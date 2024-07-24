import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ensureDirSync, rm, symlink } from 'fs-extra'
import type { Repository } from 'typeorm'
import { ReleaseAssetEntity } from '../entities/release-asset.entity'
import { ReleaseEntity } from '../entities/release.entity'
import { SubscriptionEntity } from '../entities/subscription.entity'
import type { FsService } from '../services/fs.service'
import type { WriteDirectoryService } from '../services/write-directory.service'
import { HashPath } from '../utils/hash-path'
import type { SettingsManager } from './settings.manager'

/**
 * Manages the toggling of a mod between enabled and disabled states
 *
 * Also exposes methods to query the state of assets for a mod
 */
@Injectable()
export class LifecycleManager {
  private readonly logger = new Logger(LifecycleManager.name)

  @InjectRepository(SubscriptionEntity)
  private readonly subscriptionRepository: Repository<SubscriptionEntity>

  @InjectRepository(ReleaseEntity)
  private readonly releaseRepository: Repository<ReleaseEntity>

  @InjectRepository(ReleaseAssetEntity)
  private readonly releaseAssetRepository: Repository<ReleaseAssetEntity>

  @Inject()
  private readonly writeDirectoryService: WriteDirectoryService

  @Inject()
  private readonly settingsManager: SettingsManager

  @Inject()
  private readonly fsService: FsService

  /**
   * Toggles the mod between enabled and disabled states
   * If the mod is enabled, it will be disabled
   * If the mod is disabled, it will be enabled
   */
  async toggleMod(modId: string): Promise<void> {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    this.logger.debug(`Toggling mod: ${modId} which is currently ${release.enabled}`)
    if (release.enabled) {
      this.logger.debug(`Disabling mod: ${modId}`)
      await this.disableMod(modId)
    } else {
      this.logger.debug(`Enabling mod: ${modId}`)
      await this.enableMod(modId)
    }
  }

  /**
   * Enables the mod
   * If the mod is already enabled, it will remain enabled
   */
  async enableMod(modId: string): Promise<void> {
    const { release, subscription } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseAssetRepository.findBy({ release })
    this.logger.debug(`Enabling mod: ${modId} with ${releaseAssets.length} release assets`)
    for (const releaseAsset of releaseAssets) {
      this.logger.debug(`Enabling release asset: ${releaseAsset.id}`)

      let srcPath = join(
        await this.writeDirectoryService.getWriteDirectoryForRelease(subscription.id, release.id),
        releaseAsset.source
      )

      // If the source is a hash path, we need to extract the base path and make sure the symlink is for the exploded folder including internal route
      if (HashPath.isHashPath(srcPath)) {
        this.logger.debug(`Source is a hash path: ${srcPath}`)
        const hashPath = new HashPath(srcPath)
        srcPath = join(hashPath.basePathWithoutExt, hashPath.hashPath)
      }

      const targetPath = join(await this.settingsManager.getGameDir(), releaseAsset.target)
      this.logger.debug(
        `Creating Symlink for release asset: ${releaseAsset.id} from ${srcPath} to ${targetPath}`
      )
      ensureDirSync(dirname(targetPath))
      await symlink(join(srcPath), targetPath)
      if (existsSync(targetPath)) {
        releaseAsset.symlinkPath = targetPath
        await this.releaseAssetRepository.save(releaseAsset)
      } else {
        throw new Error(`Symlink not created: ${targetPath}`)
      }
    }

    release.enabled = true
    await this.releaseRepository.save(release)
  }

  /**
   * Disables the mod
   * If the mod is already disabled, it will remain disabled
   */
  async disableMod(modId: string): Promise<void> {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseAssetRepository.findBy({ release })

    this.logger.debug(`Disabling mod: ${modId} with ${releaseAssets.length} release assets`)
    for (const releaseAsset of releaseAssets) {
      if (releaseAsset.symlinkPath !== null) {
        this.logger.debug(`Deleting Symlink for release asset: ${releaseAsset.id}`)
        await rm(releaseAsset.symlinkPath, { force: true, recursive: true })
        releaseAsset.symlinkPath = null
        await this.releaseAssetRepository.save(releaseAsset)
      }
    }
    release.enabled = false
    await this.releaseRepository.save(release)
  }

  /**
   * Gets the subscription and release for the mod or throws an error if not found
   *
   * @param modId
   * @private
   */
  private async getSubscriptionWithReleaseOrThrow(modId: string) {
    const subscription = await this.subscriptionRepository.findOneByOrFail({
      modId
    })
    const release = await this.releaseRepository.findOneByOrFail({
      subscription
    })

    return { subscription, release }
  }

  async getModAssets(modId: string) {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseAssetRepository.findBy({ release })
    return releaseAssets.map((it) => ({
      id: it.id,
      source: it.source,
      symlinkPath: it.symlinkPath
    }))
  }

  async openAssetInExplorer(assetId: number) {
    const asset = await this.releaseAssetRepository.findOneByOrFail({
      id: assetId
    })
    if (!asset.symlinkPath) throw new Error(`Symlink path not present, is the mod enabled?`)
    this.logger.debug(`Opening asset in explorer: ${asset.id}`)

    return this.fsService.openFolder(dirname(asset.symlinkPath))
  }
}
