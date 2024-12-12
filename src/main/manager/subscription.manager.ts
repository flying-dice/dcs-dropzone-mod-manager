import { Inject, Injectable, Logger } from '@nestjs/common'
import { ensureDirSync, rmdir } from 'fs-extra'
import { TaskState } from '../../lib/types'
import { FsService } from '../services/fs.service'
import { RegistryService } from '../services/registry.service'
import { WriteDirectoryService } from '../services/write-directory.service'
import { LifecycleManager } from './lifecycle-manager.service'
import { trackEvent } from '@aptabase/electron/main'
import { Subscription } from '../schemas/subscription.schema'
import { Release } from '../schemas/release.schema'
import { SubscriptionService } from '../services/subscription.service'
import { ReleaseService } from '../services/release.service'
import { Log } from '../utils/log'
import { existsSync } from 'node:fs'
import { AssetTaskStatus } from '../schemas/release-asset-task.schema'
import { getReleaseAsset } from '../utils/get-release-asset'

export type SubscriptionReleaseState = {
  enabled: boolean
  version: string
  status: TaskState
  progress: number
  label?: string
  exePath?: string
}

@Injectable()
export class SubscriptionManager {
  private readonly logger = new Logger(SubscriptionManager.name)

  @Inject(SubscriptionService)
  private readonly subscriptionService: SubscriptionService

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  @Inject()
  private readonly registryService: RegistryService

  @Inject()
  private readonly writeDirectoryService: WriteDirectoryService

  @Inject()
  private readonly fsService: FsService

  @Inject()
  private readonly toggleManager: LifecycleManager

  @Log()
  async getAllSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionService.findAll()
  }

  /**
   * Gets the subscription and release for the mod or throws an error if not found
   * This is primarily used on the MyContent page to render the current subscriptions and their status
   */
  @Log()
  async getSubscriptionReleaseState(id: string): Promise<SubscriptionReleaseState | undefined> {
    const release = await this.releaseService.findBySubscriptionIdOrThrow(id)

    if (!release) return undefined
    const releaseAssetTasks = await this.releaseService.findAssetTasksByRelease(release.id)

    const taskStatuses = releaseAssetTasks.map((it) => it.status)
    const taskProgress = releaseAssetTasks.map((it) => it.progress)

    let status: TaskState = 'Pending'

    if (taskStatuses.every((it) => it === AssetTaskStatus.COMPLETED)) {
      status = 'Completed'
    }

    if (taskStatuses.some((it) => it === AssetTaskStatus.FAILED)) {
      status = 'Failed'
    }

    if (taskStatuses.some((it) => it === AssetTaskStatus.IN_PROGRESS)) {
      status = 'In Progress'
    }

    const progress = taskProgress.reduce((acc, cur) => acc + cur, 0) / taskProgress.length

    return {
      enabled: release.enabled,
      version: release.version,
      status,
      progress,
      label: releaseAssetTasks.find((it) => it.status === AssetTaskStatus.IN_PROGRESS)?.label,
      exePath: release.exePath
    }
  }

  @Log()
  async subscribe(modId: string): Promise<void> {
    this.logger.log(`Subscribing to mod ${modId}`)

    this.logger.debug(`Getting registry index for mod ${modId}`)
    const mod = await this.registryService.getRegistryIndex(modId)

    this.logger.debug(`Getting latest release for mod ${modId}`)
    const latestRelease = await this.registryService.getLatestRelease(modId)

    if (!latestRelease) {
      throw new Error(`No releases found for mod ${modId}`)
    }

    this.logger.debug(`Building Subscription and Release data for ${modId}`)
    const subscription: Subscription = {
      id: crypto.randomUUID(),
      modId: mod.id,
      modName: mod.name!,
      deleted: false,
      created: Date.now()
    }
    const release: Release = {
      id: crypto.randomUUID(),
      subscriptionId: subscription.id,
      version: latestRelease.version!,
      enabled: false,
      exePath: latestRelease.exePath
    }

    this.logger.debug(`Determining write directory for mod ${modId}`)
    const releaseWriteDir = await this.writeDirectoryService.getWriteDirectoryForRelease(
      subscription,
      release
    )
    this.logger.verbose(`Release write directory: ${releaseWriteDir}`)

    const assets = latestRelease.assets.map((asset) =>
      getReleaseAsset(release, asset, releaseWriteDir)
    )

    this.logger.debug(`Creating write directories`)
    ensureDirSync(releaseWriteDir)

    this.logger.debug(`Saving subscription for mod ${modId}`)
    await this.subscriptionService.save(subscription)

    this.logger.debug(`Saving release ${latestRelease.version} for mod ${modId}`)
    await this.releaseService.save(release)

    this.logger.debug(`Saving release assets for mod ${modId}`)
    for (const asset of assets) {
      await this.releaseService.saveAsset(asset)
      for (const task of asset.tasks) {
        await this.releaseService.saveAssetTask(task)
      }
    }

    this.logger.log(`Subscribed to mod ${modId}`)

    await trackEvent('mod_subscribed', { mod_id: modId, mod_version: latestRelease.version! })
  }

  @Log()
  async unsubscribe(modId: string): Promise<void> {
    this.logger.debug(`Finding subscription for mod ${modId}`)
    const subscription = await this.subscriptionService.findByModId(modId)

    if (!subscription) {
      this.logger.warn(`Subscription for mod ${modId} not found`)
      return
    }

    this.logger.debug(`Disabling mod ${modId}`)
    await this.toggleManager.disableMod(modId)

    const modDir = await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription)

    if (existsSync(modDir)) {
      this.logger.debug(`Deleting write directory for mod ${modId}`)
      await rmdir(modDir, { recursive: true })
    }

    this.logger.debug(`Deleting subscription for mod ${modId}`)
    await this.subscriptionService.save({ ...subscription, deleted: true })
  }

  @Log()
  async openInExplorer(modId: string): Promise<void> {
    const subscription = await this.subscriptionService.findByModId(modId)
    if (subscription) {
      const modDir = await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription)
      await this.fsService.openFolder(modDir)
    }
  }

  @Log()
  async update(modId: string) {
    this.logger.log(`Updating mod ${modId}`)

    this.logger.debug(`Unsubscribing from mod ${modId}`)
    await this.unsubscribe(modId)

    this.logger.debug(`Subscribing to mod ${modId}`)
    await this.subscribe(modId)
  }
}
