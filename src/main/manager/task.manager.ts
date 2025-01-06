import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap
} from '@nestjs/common'
import { DownloadTaskProcessor } from '../processor/download-task.processor'
import { ExtractTaskProcessor } from '../processor/extract-task.processor'
import { TaskProcessor } from '../processor/task.processor'
import { trackEvent } from '@aptabase/electron/main'
import { formatError } from '../functions/formatError'
import { AssetTask, AssetTaskStatus, AssetTaskType } from '../schemas/release-asset-task.schema'
import { ReleaseService } from '../services/release.service'
import { SubscriptionService } from '../services/subscription.service'
import { findFirstPendingTask } from '../functions/find-first-pending-task'
import { ConfigService } from '@nestjs/config'
import { MainConfig } from '../config'
import { delay } from '../functions/delay'
import { Scheduler } from '../utils/scheduler'
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter'

@Injectable()
export class TaskManager implements OnApplicationBootstrap, BeforeApplicationShutdown {
  private readonly logger = new Logger(TaskManager.name)

  @Inject(SubscriptionService)
  private readonly subscriptionService: SubscriptionService

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  @Inject(ConfigService)
  private readonly configService: ConfigService<MainConfig>

  private readonly taskProcessors: Map<string, TaskProcessor> = new Map<string, TaskProcessor>()

  private readonly processors: Record<AssetTaskType, (task: AssetTask) => TaskProcessor>

  private busy = false

  private scheduler: Scheduler

  constructor(
    @Inject(EventEmitter2)
    private readonly eventEmitter: EventEmitter2
  ) {
    this.processors = {
      [AssetTaskType.DOWNLOAD]: () => new DownloadTaskProcessor(this.configService),
      [AssetTaskType.EXTRACT]: () => new ExtractTaskProcessor(this.configService)
    }
    if (!this.eventEmitter) throw new Error('EventEmitter2 not injected')
    this.scheduler = new Scheduler(this.eventEmitter, 'task:loop', 1_000)
  }

  async onApplicationBootstrap() {
    this.logger.log('========== Starting task manager ==========')
    this.scheduler.start()
  }

  @OnEvent('task:loop')
  async onTaskLoop() {
    if (this.busy) return
    this.busy = true
    await this.checkForPendingTasks()
    this.busy = false
  }

  async beforeApplicationShutdown() {
    this.logger.log('========== Shutting down task manager ==========')
    this.scheduler.stop()

    await delay(1_000)
    this.logger.log('Task manager shut down')
  }

  async checkForPendingTasks() {
    const subscriptionsWithNonTerminalTasks =
      await this.releaseService.fetchIdsForActiveSubscriptionTasks()

    let task = await this.releaseService.findInProgressAssetTask()

    if (!task) {
      for (const subscription of await this.subscriptionService.findAllByIds(
        subscriptionsWithNonTerminalTasks
      )) {
        const release = await this.releaseService.findBySubscriptionIdOrThrow(subscription.id)
        const assets = await this.releaseService.findAssetsByRelease(release.id)

        for (const asset of assets) {
          const tasks = await this.releaseService.findAssetTasksByAssetId(asset.id)
          const firstPendingTask = findFirstPendingTask(tasks)

          if (firstPendingTask) {
            task = firstPendingTask
            break
          }
        }

        if (task) {
          break
        }
      }
    }

    if (!task) return

    // Get the processor for the task to process or create a new one if it doesn't exist
    // Use cache to avoid creating a new processor for the same task multiple times and allow internal state to be maintained
    const processor =
      this.taskProcessors.get(task.id) ||
      this.taskProcessors.set(task.id, this.processors[task.type](task)).get(task.id)

    // If there is no processor for the task, log an error message and return
    if (!processor) {
      this.logger.error(`No processor found for task type ${task.type}`)
      return
    }

    // Process the task and save the task to the database after processing
    // Processors are responsible for updating the task status and progress
    this.logger.debug(`Processing task ${task.id}`)
    try {
      await processor.process(task)
    } catch (error) {
      this.logger.error(`Error processing task ${task.id}`, error)

      const subscription = await this.subscriptionService.findByIdOrThrow(task.subscriptionId)
      const release = await this.releaseService.findByIdOrThrow(task.releaseId)
      const asset = await this.releaseService.findAssetByIdOrThrow(task.releaseAssetId)

      await trackEvent('task_process_error', {
        task_id: task.id,
        task_type: task.type,
        mod_id: subscription.id,
        mod_version: release.version,
        asset_links: JSON.stringify(asset.links),
        ...formatError(error as Error)
      })
      task.status = AssetTaskStatus.FAILED
    }

    // If the task is in a terminal state, remove the processor from the cache
    if (task.status === AssetTaskStatus.COMPLETED || task.status === AssetTaskStatus.FAILED) {
      this.logger.debug(`Task ${task.id} completed, removing processor from cache`)
      try {
        await processor.postProcess(task)
      } catch (error) {
        this.logger.error(`Error post processing task ${task.id}`, error)

        const subscription = await this.subscriptionService.findByIdOrThrow(task.subscriptionId)
        const release = await this.releaseService.findByIdOrThrow(task.releaseId)
        const asset = await this.releaseService.findAssetByIdOrThrow(task.releaseAssetId)

        await trackEvent('task_post_process_error', {
          task_id: task.id,
          task_type: task.type,
          mod_id: subscription.id,
          mod_version: release.version,
          asset_links: JSON.stringify(asset.links),
          ...formatError(error as Error)
        })
      }
      this.taskProcessors.delete(task.id)
    }

    this.logger.debug(
      `Task ${task.id} processed, Progress: ${task.progress}, Status: ${task.status}, saving to database`
    )
    await this.releaseService.saveAssetTask(task)
  }
}
