import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { ProgressLabel } from '../../lib/types'
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
import { getReleaseAsset } from '../utils/get-release-asset'
import { randomUUID } from 'node:crypto'
import { join } from 'node:path'
import { existsSync, readdirSync, ensureDirSync, rmdir, pathExistsSync } from 'fs-extra'
import { AssetTaskStatus } from '../schemas/release-asset-task.schema'

export type SubscriptionReleaseState = {
  enabled: boolean
  version: string
  progressLabel: ProgressLabel
  progress: number
  currentTaskLabel?: string
  exePath?: string
  isLatest: boolean
  latest?: string
  isReady: boolean
}

export type SubscriptionWithState = {
  subscription: Subscription
  state: SubscriptionReleaseState
}

@Injectable()
export class SubscriptionManager implements OnApplicationBootstrap {
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

  async onApplicationBootstrap(): Promise<any> {
    this.logger.log('Checking for orphaned subscriptions and releases')
    await this.removeOrphanedSubscriptionsAndReleases()
  }

  @Log()
  async getAllSubscriptions(): Promise<SubscriptionWithState[]> {
    const subscriptionsWithState: SubscriptionWithState[] = []

    for (const subscription of await this.subscriptionService.findAll()) {
      const state = await this.getSubscriptionReleaseState(subscription)
      if (state) {
        subscriptionsWithState.push({ subscription, state })
      }
    }

    return subscriptionsWithState
  }

  /**
   * Gets the subscription and release for the mod or throws an error if not found
   * This is primarily used on the MyContent page to render the current subscriptions and their status
   */
  @Log()
  async getSubscriptionReleaseState(
    subscription: Subscription
  ): Promise<SubscriptionReleaseState | undefined> {
    const installed = await this.releaseService.findBySubscriptionIdOrThrow(subscription.id)
    const latest = await this.registryService.getLatestVersion(subscription.modId)

    const assetTasks = await this.releaseService.findAssetTasksByRelease(installed.id)

    const taskStatuses = assetTasks.map((it) => it.status)
    const taskProgress = assetTasks.map((it) => it.progress)

    let progressLabel: ProgressLabel = 'Pending'

    if (taskStatuses.every((it) => it === AssetTaskStatus.COMPLETED)) {
      progressLabel = 'Completed'
    }

    if (taskStatuses.some((it) => it === AssetTaskStatus.FAILED)) {
      progressLabel = 'Failed'
    }

    if (taskStatuses.some((it) => it === AssetTaskStatus.IN_PROGRESS)) {
      progressLabel = 'In Progress'
    }

    const progress = taskProgress.reduce((acc, cur) => acc + cur, 0) / taskProgress.length

    return {
      enabled: installed.enabled,
      version: installed.version,
      progressLabel,
      progress,
      currentTaskLabel: assetTasks.find((it) => it.status === AssetTaskStatus.IN_PROGRESS)?.label,
      isReady: taskStatuses.every((it) => it === AssetTaskStatus.COMPLETED),
      exePath: installed.exePath,
      isLatest: installed.version === latest?.version || true,
      latest: latest?.version
    }
  }

  @Log()
  async subscribe(modId: string): Promise<void> {
    this.logger.log(`Subscribing to mod ${modId}`)

    this.logger.debug(`Getting registry index for mod ${modId}`)
    const mod = await this.registryService.getRegistryEntryIndex(modId)

    this.logger.debug(`Getting latest release for mod ${modId}`)
    const latestRelease = await this.registryService.getLatestVersion(modId)

    if (!latestRelease) {
      throw new Error(`No releases found for mod ${modId}`)
    }

    this.logger.debug(`Building Subscription and Release data for ${modId}`)
    const subscription: Subscription = {
      id: randomUUID(),
      modId: mod.id,
      modName: mod.name!,
      created: Date.now()
    }
    const release: Release = {
      id: randomUUID(),
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
    await this.releaseService.deleteBySubscriptionId(subscription.id)
    await this.subscriptionService.deleteById(subscription.id)
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

  @Log()
  async removeOrphanedSubscriptionsAndReleases() {
    const writeDirectory = await this.writeDirectoryService.getWriteDirectory()

    if (!pathExistsSync(writeDirectory)) return

    const foldersInWriteDirectory = readdirSync(writeDirectory, { withFileTypes: true }).filter(
      (it) => it.isDirectory()
    )

    for (const directory of foldersInWriteDirectory) {
      const subscription = await this.subscriptionService.findById(directory.name)
      if (!subscription) {
        this.logger.warn(`Deleting orphaned directory ${directory.name}`)
        await rmdir(join(directory.parentPath, directory.name), { recursive: true })
        continue
      }

      await this.removeOrphanedReleases(subscription)
    }
  }

  @Log()
  async removeOrphanedReleases(subscription: Subscription) {
    const subscriptionDirectory =
      await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription)

    const foldersInSubscriptionDirectory = readdirSync(subscriptionDirectory, {
      withFileTypes: true
    }).filter((it) => it.isDirectory())

    for (const directory of foldersInSubscriptionDirectory) {
      const release = await this.releaseService.findById(directory.name)
      if (!release) {
        this.logger.warn(`Deleting orphaned directory ${directory.name}`)
        await rmdir(join(directory.parentPath, directory.name), { recursive: true })
      }
    }
  }
}
