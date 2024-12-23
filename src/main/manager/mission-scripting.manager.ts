import { Inject, Injectable, Logger } from '@nestjs/common'
import { OnEvent } from '@nestjs/event-emitter'
import { ModEnabledEvent } from '../events/mod-enabled.event'
import { ModDisabledEvent } from '../events/mod-disabled.event'
import { ReleaseService } from '../services/release.service'
import { outputFile } from 'fs-extra'
import { SettingsManager } from './settings.manager'
import path from 'node:path'
import { generateDropzoneMissionScriptingScript } from '../functions/generateDropzoneMissionScriptingScript'

@Injectable()
export class MissionScriptingManager {
  static readonly FILENAME = 'dcs-dropzone_MissionScripting.lua'

  private readonly logger = new Logger(MissionScriptingManager.name)

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  @Inject()
  private readonly settingsManager: SettingsManager

  @OnEvent(ModEnabledEvent.name)
  async onModEnabled(event: ModEnabledEvent) {
    this.logger.log(`Handling mod enabled event: ${event.modId} ${event.version}`)
    await this.rebuildUninstallBat()
  }

  @OnEvent(ModDisabledEvent.name)
  async onModDisabled(event: ModDisabledEvent) {
    this.logger.log(`Handling mod disabled event: ${event.modId} ${event.version}`)
    await this.rebuildUninstallBat()
  }

  async rebuildUninstallBat() {
    const releaseAssets = await this.releaseService.findAssetsWithSymlinks()

    const scripts: { id: string; path: string }[] = []

    for (const asset of releaseAssets) {
      if (asset.symlinkPath && asset.runOnStart) {
        scripts.push({
          id: asset.id,
          path: asset.symlinkPath
        })
      }
    }

    const content = await generateDropzoneMissionScriptingScript(scripts)
    await outputFile(
      path.join(
        await this.settingsManager.getGameDir(),
        'Scripts',
        MissionScriptingManager.FILENAME
      ),
      content
    )
  }
}
