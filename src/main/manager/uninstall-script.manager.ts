import { Log } from '../utils/log'
import { join } from 'node:path'
import { Inject, Injectable, Logger } from '@nestjs/common'
import { WriteDirectoryService } from '../services/write-directory.service'
import { ReleaseService } from '../services/release.service'
import { OnEvent } from '@nestjs/event-emitter'
import { ModEnabledEvent } from '../events/mod-enabled.event'
import { ModDisabledEvent } from '../events/mod-disabled.event'
import { UninstallBat } from '../utils/uninstall-bat'

@Injectable()
export class UninstallScriptManager {
  private readonly logger = new Logger(UninstallScriptManager.name)

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  @Inject(WriteDirectoryService)
  private readonly writeDirectoryService: WriteDirectoryService

  @OnEvent(ModEnabledEvent.name)
  async onModEnabled(event: ModEnabledEvent) {
    this.logger.debug(`Mod enabled event received ${event.modId}:${event.version}`)
    await this.rebuildUninstallScript()
  }

  @OnEvent(ModDisabledEvent.name)
  async onModDisabled(event: ModDisabledEvent) {
    this.logger.debug(`Mod disabled event received ${event.modId}:${event.version}`)
    await this.rebuildUninstallScript()
  }

  @Log()
  private async rebuildUninstallScript() {
    this.logger.debug(`Rebuilding symlink uninstall script`)
    const path = join(await this.writeDirectoryService.getWriteDirectory(), 'del-symlinks.bat')
    const assets = await this.releaseService.findAssetsWithSymlinks()
    const uninstallBat = new UninstallBat(path)

    for (const asset of assets) {
      if (asset.symlinkPath) {
        this.logger.verbose(`Adding asset to uninstall script ${asset.id}:${asset.symlinkPath}`)
        uninstallBat.addItem({ id: asset.id, path: asset.symlinkPath })
      }
    }

    this.logger.debug(`Writing uninstall script to ${path}`)
    await uninstallBat.write()
  }
}
