import { Inject, Injectable, Logger } from '@nestjs/common'
import { SettingsManager } from './settings.manager'
import Aigle from 'aigle'
import { extname, join, resolve } from 'node:path'
import { stat } from 'fs-extra'
import { OnEvent } from '@nestjs/event-emitter'
import { ModEnabledEvent } from '../events/mod-enabled.event'
import { ModDisabledEvent } from '../events/mod-disabled.event'
import { ReleaseService } from '../services/release.service'
import { Log } from '../utils/log'
import { MissionScriptingLua } from '../utils/mission-scripting-lua'
import { DropzoneMissionScriptingLua } from '../utils/dropzone-mission-scripting-lua'

@Injectable()
export class MissionScriptingManager {
  private readonly logger = new Logger(MissionScriptingManager.name)

  @Inject(SettingsManager)
  private readonly settingsManager: SettingsManager

  @Inject(ReleaseService)
  private readonly releaseService: ReleaseService

  async repairMissionScriptingFile(): Promise<void> {
    const file = join(
      await this.settingsManager.getGameInstallDir(),
      'Scripts',
      'MissionScripting.lua'
    )
    Logger.log(`Repairing MissionScripting file ${file}`)

    const missionScriptingFile = await MissionScriptingLua.fromFile(file)

    if (
      !missionScriptingFile.includesBefore(
        DropzoneMissionScriptingLua.MISSION_SCRIPTING_TRIGGER,
        MissionScriptingLua.SANITIZE_START_LINE
      )
    ) {
      missionScriptingFile.addAfter(
        DropzoneMissionScriptingLua.MISSION_SCRIPTING_TRIGGER,
        MissionScriptingLua.DOFILE_SCRIPTING_SYSTEM
      )
      await missionScriptingFile.write()
    }
  }

  @Log()
  async validateMissionScriptingFile(): Promise<{
    content: string
    isValid: boolean
    expected: string
    before: string
    path: string
  }> {
    const file = join(
      await this.settingsManager.getGameInstallDir(),
      'Scripts',
      'MissionScripting.lua'
    )
    Logger.log(`Validating MissionScripting file ${file}`)

    const missionScriptingFile = await MissionScriptingLua.fromFile(file)

    Logger.log(`Validating MissionScripting file ${file}`)
    Logger.log(missionScriptingFile.content)

    const test = missionScriptingFile.includesBefore(
      DropzoneMissionScriptingLua.MISSION_SCRIPTING_TRIGGER,
      MissionScriptingLua.SANITIZE_START_LINE
    )

    Logger.log(`MissionScripting file validation result: ${test}`)

    return {
      content: missionScriptingFile.content,
      isValid: test,
      expected: DropzoneMissionScriptingLua.MISSION_SCRIPTING_TRIGGER,
      path: missionScriptingFile.abspath,
      before: MissionScriptingLua.SANITIZE_START_LINE
    }
  }

  @OnEvent(ModEnabledEvent.name, { async: true })
  async onModEnabled(event: ModEnabledEvent) {
    this.logger.debug(`Mod enabled event received ${event.modId}:${event.version}`)
    await this.rebuildScriptingFile()
  }

  @OnEvent(ModDisabledEvent.name, { async: true })
  async onModDisabled(event: ModDisabledEvent) {
    this.logger.debug(`Mod disabled event received ${event.modId}:${event.version}`)
    await this.rebuildScriptingFile()
  }

  @Log()
  async rebuildScriptingFile() {
    this.logger.debug(`Rebuilding dcs-dropzone MissionScripting file`)
    const assets = await this.releaseService.findAssetsWithRunOnStart()

    const assetsToBeIncluded: { id: string; symlinkPath: string }[] = []

    await Aigle.eachSeries(assets, async (it) => {
      if (!it.runOnStart) return
      if (!it.symlinkPath) return

      try {
        this.logger.debug(`Checking symlink path: ${it.symlinkPath}`)
        const symlinkPath = resolve(it.symlinkPath)
        const isFolder = await stat(symlinkPath).then((it) => it.isDirectory())
        if (isFolder) {
          this.logger.verbose('Ignoring folder, only files are supported')
          return
        }
        if (extname(it.symlinkPath) !== '.lua') {
          this.logger.verbose(`Ignoring non-lua file: ${symlinkPath}`)
          return
        }

        this.logger.verbose(`Adding dofileifexist for: ${symlinkPath}`)
        assetsToBeIncluded.push({
          id: it.id,
          symlinkPath: symlinkPath
        })
      } catch (e) {
        this.logger.error(`Error adding dofileifexist for: ${it.symlinkPath}`)
        this.logger.error(e)
      }
    })

    this.logger.debug(`Assets to be included: ${assetsToBeIncluded.length}`)

    this.logger.debug(`Writing dcs-dropzone MissionScripting file`)
    const file = join(
      await this.settingsManager.getGameDir(),
      'Scripts',
      'dcs-dropzone',
      'MissionScripting.lua'
    )

    try {
      const dropzoneMissionScriptingLua = await DropzoneMissionScriptingLua.fromFile(file)
      dropzoneMissionScriptingLua.addScripts(assetsToBeIncluded)

      Logger.log(`Writing MissionScripting file ${file}`)
      await dropzoneMissionScriptingLua.write()
    } catch (e) {
      Logger.error(`Error writing MissionScripting file ${file}`)
      Logger.error(e)
      throw e
    }
  }
}
