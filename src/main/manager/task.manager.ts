import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Aigle from 'aigle'
import type { Repository } from 'typeorm'
import { AssetTaskEntity, AssetTaskStatus, AssetTaskType } from '../entities/asset-task.entity'
import { DownloadTaskProcessor } from '../processor/download-task.processor'
import { ExtractTaskProcessor } from '../processor/extract-task.processor'
import type { TaskProcessor } from '../processor/task.processor'

@Injectable()
export class TaskManager implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger(TaskManager.name)

  @InjectRepository(AssetTaskEntity)
  private readonly assetTaskRepository: Repository<AssetTaskEntity>

  private readonly taskProcessors: Map<number, TaskProcessor> = new Map<number, TaskProcessor>()

  private static readonly PROCESSORS: Record<
    AssetTaskType,
    (task: AssetTaskEntity) => TaskProcessor
  > = {
    [AssetTaskType.DOWNLOAD]: () => new DownloadTaskProcessor(),
    [AssetTaskType.EXTRACT]: () => new ExtractTaskProcessor()
  }

  private active = true

  async onApplicationBootstrap() {
    this.logger.debug('Starting task manager')
    Aigle.whilst(
      () => this.active,
      async () => {
        await this.checkForPendingTasks()
        await Aigle.delay(1000)
      }
    )
  }

  async onApplicationShutdown() {
    this.logger.debug('Shutting down task manager')
    this.active = false
  }

  async checkForPendingTasks() {
    // Get the current task being processed
    let task = await this.assetTaskRepository.findOneBy({
      status: AssetTaskStatus.IN_PROGRESS
    })

    // If there is no task being processed, get the next pending task by going in ID descending order sequentially
    if (!task) {
      task = await this.assetTaskRepository.findOne({
        where: { status: AssetTaskStatus.PENDING },
        order: { id: 'asc', sequence: 'asc' }
      })
    }

    // If there is still no task to process, log a message and return as this means there are no tasks to process in the database
    if (!task) {
      return
    }

    // Get the processor for the task to process or create a new one if it doesn't exist
    // Use cache to avoid creating a new processor for the same task multiple times and allow internal state to be maintained
    const processor =
      this.taskProcessors.get(task.id) ||
      this.taskProcessors.set(task.id, TaskManager.PROCESSORS[task.type](task)).get(task.id)

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
      task.status = AssetTaskStatus.FAILED
    }

    // If the task is in a terminal state, remove the processor from the cache
    if (task.status === AssetTaskStatus.COMPLETED || task.status === AssetTaskStatus.FAILED) {
      this.logger.debug(`Task ${task.id} completed, removing processor from cache`)
      try {
        await processor.postProcess(task)
      } catch (error) {
        this.logger.error(`Error post processing task ${task.id}`, error)
      }
      this.taskProcessors.delete(task.id)
    }

    this.logger.debug(
      `Task ${task.id} processed, Progress: ${task.progress}, Status: ${task.status}, saving to database`
    )
    await this.assetTaskRepository.save(task)
  }
}
