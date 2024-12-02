import { extname, join } from 'node:path'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import Aigle from 'aigle'
import { ensureDirSync, rmdir } from 'fs-extra'
import { flatten } from 'lodash'
import { Repository } from 'typeorm'
import { TaskState } from '../../lib/types'
import {
  AssetTaskEntity,
  AssetTaskStatus,
  AssetTaskType,
  DownloadTaskPayload,
  ExtractTaskPayload
} from '../entities/asset-task.entity'
import { ReleaseAssetEntity } from '../entities/release-asset.entity'
import { ReleaseEntity } from '../entities/release.entity'
import { SubscriptionEntity } from '../entities/subscription.entity'
import { getUrlPartsForDownload } from '../functions/getUrlPartsForDownload'
import { FsService } from '../services/fs.service'
import { RegistryService } from '../services/registry.service'
import { WriteDirectoryService } from '../services/write-directory.service'
import { _7zip } from '../tools/7zip'
import { LifecycleManager } from './lifecycle-manager.service'
import { trackEvent } from '@aptabase/electron/main'
import { execFile } from 'node:child_process'

@Injectable()
export class SubscriptionManager {
  private readonly logger = new Logger(SubscriptionManager.name)

  @InjectRepository(SubscriptionEntity)
  private readonly subscriptionRepository: Repository<SubscriptionEntity>

  @InjectRepository(ReleaseEntity)
  private readonly releaseRepository: Repository<ReleaseEntity>

  @InjectRepository(ReleaseAssetEntity)
  private readonly releaseAssetRepository: Repository<ReleaseAssetEntity>

  @InjectRepository(AssetTaskEntity)
  private readonly assetTaskRepository: Repository<AssetTaskEntity>

  @Inject()
  private readonly registryService: RegistryService

  @Inject()
  private readonly writeDirectoryService: WriteDirectoryService

  @Inject()
  private readonly fsService: FsService

  @Inject()
  private readonly toggleManager: LifecycleManager

  async getAllSubscriptions(): Promise<SubscriptionEntity[]> {
    return this.subscriptionRepository.find()
  }

  /**
   * Gets the subscription and release for the mod or throws an error if not found
   * This is primarily used on the MyContent page to render the current subscriptions and their status
   * @param modId
   */
  async getSubscriptionReleaseState(modId: string): Promise<
    | undefined
    | {
        enabled: boolean
        version: string
        status: TaskState
        progress: number
        label?: string
      }
  > {
    const subscription = await this.subscriptionRepository.findOneBy({
      modId: modId
    })
    if (!subscription) return undefined
    const release = await this.releaseRepository.findOneBy({ subscription })

    if (!release) return undefined

    const allTasks: AssetTaskEntity[] = flatten(
      await Aigle.map(
        await this.releaseAssetRepository.findBy({ release }),
        async (releaseAsset) => await this.assetTaskRepository.findBy({ releaseAsset })
      )
    )

    const taskStatuses = allTasks.map((it) => it.status)
    const taskProgress = allTasks.map((it) => it.progress)

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
      label: allTasks.find((it) => it.status === AssetTaskStatus.IN_PROGRESS)?.label
    }
  }

  async subscribe(modId: string): Promise<void> {
    this.logger.log(`Subscribing to mod ${modId}`)

    this.logger.debug(`Getting registry index for mod ${modId}`)
    const mod = await this.registryService.getRegistryIndex(modId)

    this.logger.debug(`Getting latest release for mod ${modId}`)
    const latestRelease = await this.registryService.getLatestRelease(modId)

    this.logger.debug(`Saving subscription for mod ${modId}`)
    const subscription = await this.subscriptionRepository.save({
      modId: mod.id,
      modName: mod.name,
      exePath: latestRelease.exePath
    })

    this.logger.debug(`Saving latest release for mod ${modId}`)
    const latestReleaseEntity = await this.releaseRepository.save({
      subscription,
      version: latestRelease.version
    })

    this.logger.debug(`Creating write directories`)
    const modWriteDir = await this.writeDirectoryService.getWriteDirectoryForSubscription(
      subscription.id
    )
    const releaseWriteDir = join(modWriteDir, latestReleaseEntity.id.toString())
    ensureDirSync(modWriteDir)
    ensureDirSync(releaseWriteDir)

    this.logger.debug(`Saving release assets for mod ${modId}`)
    for (const asset of latestRelease.assets) {
      const releaseAsset = await this.releaseAssetRepository.save({
        release: latestReleaseEntity,
        source: asset.source,
        target: asset.target
      })

      this.logger.debug('Creating Release Asset Tasks')
      let source = releaseAsset.source

      /** Should be moved to the integration pipeline when generating index.md from releases */
      if (mod.integration) {
        switch (mod.integration.type) {
          case 'github':
            source = `https://github.com/${mod.integration.owner}/${mod.integration.repo}/releases/download/${latestRelease.version}/${releaseAsset.source}`
            break
        }
      }

      const { baseUrl, file } = getUrlPartsForDownload(source)
      const downloadTaskPayload: DownloadTaskPayload = {
        baseUrl,
        file,
        folder: releaseWriteDir
      }
      await this.assetTaskRepository.save({
        releaseAsset,
        type: AssetTaskType.DOWNLOAD,
        sequence: 1,
        payload: downloadTaskPayload,
        label: `Downloading ${file}`
      })

      if (_7zip.SUPPORTED_ARCHIVE_EXTENSIONS.map((ext) => `.${ext}`).includes(extname(file))) {
        const extractTaskPayload: ExtractTaskPayload = {
          file,
          folder: releaseWriteDir
        }
        await this.assetTaskRepository.save({
          releaseAsset,
          sequence: 2,
          type: AssetTaskType.EXTRACT,
          payload: extractTaskPayload,
          label: `Unpacking ${file}`
        })
      }
    }

    await trackEvent('mod_subscribed', { mod_id: modId, mod_version: latestRelease.version })
  }

  async unsubscribe(modId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOneBy({ modId })
    await this.toggleManager.disableMod(modId)
    if (subscription) {
      await rmdir(
        await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription.id),
        { recursive: true }
      )
      await this.subscriptionRepository.remove(subscription)
    }
  }

  async openInExplorer(modId: string): Promise<void> {
    const subscription = await this.subscriptionRepository.findOneBy({ modId })
    if (subscription) {
      await this.fsService.openFolder(
        await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription.id)
      )
    }
  }

  async runExe(modId: string, exePath: string) {
    this.logger.debug(`Running exe: ${modId}, ${exePath}`)
    const subscription = await this.subscriptionRepository.findOneBy({ modId })
    if (subscription) {
      execFile(exePath, {
        cwd: await this.writeDirectoryService.getWriteDirectoryForSubscription(subscription.id)
      })
    }
  }

  async update(modId: string) {
    this.logger.log(`Updating mod ${modId}`)

    this.logger.debug(`Unsubscribing from mod ${modId}`)
    await this.unsubscribe(modId)

    this.logger.debug(`Subscribing to mod ${modId}`)
    await this.subscribe(modId)
  }
}
