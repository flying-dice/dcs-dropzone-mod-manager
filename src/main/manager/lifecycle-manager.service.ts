import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ensureDirSync, rm, symlink } from 'fs-extra'
import { FsService } from '../services/fs.service'
import { WriteDirectoryService } from '../services/write-directory.service'
import { HashPath } from '../utils/hash-path'
import { VariablesService } from '../services/variables.service'
import { getUrlPartsForDownload } from '../functions/getUrlPartsForDownload'
import { execFile } from 'node:child_process'
import { SubscriptionService } from '../services/subscription.service'
import { ReleaseService } from '../services/release.service'
import { Subscription } from '../schemas/subscription.schema'
import { Release } from '../schemas/release.schema'

/**
 * Manages the toggling of a mod between enabled and disabled states
 *
 * Also exposes methods to query the state of assets for a mod
 */
@Injectable()
export class LifecycleManager {
  private readonly logger = new Logger(LifecycleManager.name)

  @Inject(SubscriptionService)
  private readonly subscriptionService: SubscriptionService

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  @Inject()
  private readonly writeDirectoryService: WriteDirectoryService

  @Inject()
  private readonly fsService: FsService

  @Inject(VariablesService)
  private variablesService: VariablesService /**
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
    const releaseAssets = await this.releaseService.findAssetsByRelease(release.id)
    this.logger.debug(`Enabling mod: ${modId} with ${releaseAssets.length} release assets`)
    for (const releaseAsset of releaseAssets) {
      this.logger.debug(`Enabling release asset: ${releaseAsset.id}`)

      const { baseUrl } = getUrlPartsForDownload(releaseAsset.source)

      let srcPath = join(
        await this.writeDirectoryService.getWriteDirectoryForRelease(subscription, release),
        releaseAsset.source.replace(baseUrl, '')
      )

      // If the source is a hash path, we need to extract the base path and make sure the symlink is for the exploded folder including internal route
      if (HashPath.isHashPath(srcPath)) {
        this.logger.debug(`Source is a hash path: ${srcPath}`)
        const hashPath = new HashPath(srcPath)
        srcPath = join(hashPath.basePathWithoutExt, hashPath.hashPath)
      }

      const targetPath = await this.variablesService.replaceVariables(releaseAsset.target)
      this.logger.debug(
        `Creating Symlink for release asset: ${releaseAsset.id} from ${srcPath} to ${targetPath}`
      )
      ensureDirSync(dirname(targetPath))
      await symlink(join(srcPath), targetPath)
      if (existsSync(targetPath)) {
        releaseAsset.symlinkPath = targetPath
        await this.releaseService.saveAsset(releaseAsset)
      } else {
        throw new Error(`Symlink not created: ${targetPath}`)
      }
    }

    release.enabled = true
    await this.releaseService.save(release)
  }

  /**
   * Disables the mod
   * If the mod is already disabled, it will remain disabled
   */
  async disableMod(modId: string): Promise<void> {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseService.findAssetsByRelease(release.id)

    this.logger.debug(`Disabling mod: ${modId} with ${releaseAssets.length} release assets`)
    for (const releaseAsset of releaseAssets) {
      if (releaseAsset.symlinkPath) {
        this.logger.debug(`Deleting Symlink for release asset: ${releaseAsset.id}`)
        await rm(releaseAsset.symlinkPath, { force: true, recursive: true })
        releaseAsset.symlinkPath = undefined
        await this.releaseService.saveAsset(releaseAsset)
      }
    }
    release.enabled = false
    await this.releaseService.save(release)
  }

  async runExe(modId: string, exePath: string) {
    this.logger.debug(`Running exe: ${modId}, ${exePath}`)
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)

    if (!release.enabled) {
      throw new Error(`Mod is not enabled, please enable it first and try again`)
    }

    const path = await this.variablesService.replaceVariables(exePath)

    execFile(path, [], { cwd: dirname(path) }, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`Error running exe: ${error}`)
      }
      if (stdout) {
        this.logger.debug(`stdout: ${stdout}`)
      }
      if (stderr) {
        this.logger.error(`stderr: ${stderr}`)
      }
    })
  }

  /**
   * Gets the subscription and release for the mod or throws an error if not found
   *
   * @param modId
   * @private
   */
  private async getSubscriptionWithReleaseOrThrow(
    modId: string
  ): Promise<{ subscription: Subscription; release: Release }> {
    const subscription = await this.subscriptionService.findByModIdOrThrow(modId)
    const release = await this.releaseService.findBySubscriptionIdOrThrow(subscription.id)

    return { subscription, release }
  }

  async getModAssets(modId: string) {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseService.findAssetsByRelease(release.id)
    return releaseAssets.map((it) => ({
      id: it.id,
      source: it.source,
      symlinkPath: it.symlinkPath
    }))
  }

  async openAssetInExplorer(assetId: string) {
    const asset = await this.releaseService.findAssetByIdOrThrow(assetId)
    if (!asset.symlinkPath) throw new Error(`Symlink path not present, is the mod enabled?`)
    this.logger.debug(`Opening asset in explorer: ${asset.id}`)

    return this.fsService.openFolder(dirname(asset.symlinkPath))
  }
}
