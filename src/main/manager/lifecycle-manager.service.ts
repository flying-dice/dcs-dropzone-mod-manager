import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { ensureDirSync, pathExists, rm, symlink } from 'fs-extra'
import { FsService } from '../services/fs.service'
import { WriteDirectoryService } from '../services/write-directory.service'
import { VariablesService } from '../services/variables.service'
import { SubscriptionService } from '../services/subscription.service'
import { ReleaseService } from '../services/release.service'
import { Subscription } from '../schemas/subscription.schema'
import { Release } from '../schemas/release.schema'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { ModEnabledEvent } from '../events/mod-enabled.event'
import { ModDisabledEvent } from '../events/mod-disabled.event'
import { posixpath } from '../functions/posixpath'
import { promisify } from 'node:util'
import { execFile } from 'node:child_process'
import { ReleaseAsset } from '../schemas/release-asset.schema'

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

  @Inject(EventEmitter2)
  private readonly eventEmitter: EventEmitter2

  @Inject(VariablesService)
  private variablesService: VariablesService

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
    const releaseAssets = await this.releaseService.findAssetsByRelease(release.id)
    this.logger.debug(`Enabling mod: ${modId} with ${releaseAssets.length} release assets`)
    for (const releaseAsset of releaseAssets) {
      this.logger.debug(`Enabling release asset: ${releaseAsset.id}`)
      for (const link of releaseAsset.links) {
        const srcPath = posixpath(
          join(
            await this.writeDirectoryService.getWriteDirectoryForRelease(subscription, release),
            link.source
          )
        )

        const targetPath = posixpath(await this.variablesService.replaceVariables(link.target))
        this.logger.log(
          `Creating Symlink for release asset: ${releaseAsset.id} from ${srcPath} to ${targetPath}`
        )
        ensureDirSync(dirname(targetPath))

        if (await pathExists(targetPath)) {
          this.logger.error(
            `Target path already exists: ${targetPath}, please remove it and try again`
          )
          throw new Error(
            `Target path already exists: ${targetPath}, please remove it and try again`
          )
        }

        await symlink(srcPath, targetPath)
        if (existsSync(targetPath)) {
          link.symlinkPath = targetPath
        } else {
          this.logger.error(
            `Failed to create symlink at ${targetPath}. Please ensure the target path does not already exist and try again.`
          )
          throw new Error(
            `Failed to create symlink at ${targetPath}. Please ensure the target path does not already exist and try again.`
          )
        }
      }
      await this.releaseService.saveAsset(releaseAsset)
    }

    release.enabled = true
    await this.releaseService.save(release)
    await this.eventEmitter.emitAsync(
      ModEnabledEvent.name,
      new ModEnabledEvent(modId, release.version)
    )
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
      // Temporarily remove symlinks still using the old path
      // TODO: Remove this after no daily starts with 1.18.0 (Check Aptabase Dash) Due for review 30/02/2024
      if (releaseAsset.symlinkPath) {
        this.logger.debug(`Deleting Symlink for release asset: ${releaseAsset.id}`)
        await rm(releaseAsset.symlinkPath, { force: true, recursive: true })
        releaseAsset.symlinkPath = null
      }
      // End

      for (const link of releaseAsset.links) {
        if (link.symlinkPath) {
          this.logger.debug(`Deleting Symlink for release asset: ${releaseAsset.id}`)
          await rm(link.symlinkPath, { force: true, recursive: true })
          link.symlinkPath = null
        }
        await this.releaseService.saveAsset(releaseAsset)
      }
    }
    release.enabled = false
    await this.releaseService.save(release)
    await this.eventEmitter.emitAsync(
      ModDisabledEvent.name,
      new ModEnabledEvent(modId, release.version)
    )
  }

  async runExe(modId: string, exePath: string) {
    this.logger.debug(`Running exe: ${modId}, ${exePath}`)
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)

    if (!release.enabled) {
      throw new Error(`Mod is not enabled, please enable it first and try again`)
    }

    const path = posixpath(await this.variablesService.replaceVariables(exePath))
    try {
      await promisify(execFile)(path, [], { cwd: dirname(path) })
      this.logger.debug(`Exe ran successfully: ${modId}, ${exePath}`)
    } catch (error) {
      Logger.debug(`Error running exe: ${modId}, ${exePath}`, error)
      throw new Error(`Failed to run the executable for mod: ${modId} at path: \n${path}`)
    }
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

  async getModAssets(modId: string): Promise<{ id: string; links: ReleaseAsset['links'] }[]> {
    const { release } = await this.getSubscriptionWithReleaseOrThrow(modId)
    const releaseAssets = await this.releaseService.findAssetsByRelease(release.id)
    return releaseAssets.map((it) => ({
      id: it.id,
      links: it.links
    }))
  }

  async openAssetInExplorer(assetId: string, linkIndex: number) {
    const asset = await this.releaseService.findAssetByIdOrThrow(assetId)
    if (!asset.links[linkIndex].symlinkPath)
      throw new Error(`Symlink path not present, is the mod enabled?`)
    this.logger.debug(`Opening asset in explorer: ${asset.id}`)

    return this.fsService.openFolder(dirname(asset.links[linkIndex].symlinkPath))
  }
}
