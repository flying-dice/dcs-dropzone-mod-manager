import { Inject, Injectable } from '@nestjs/common'
import { SettingsManager } from '../manager/settings.manager'
import { NO_DCS_INSTALLATION_DIR } from '../../lib/mission-scripting'
import { validateMissionScripting } from '../functions/validateMissionScripting'
import { getMissionScriptingWithTrigger } from '../functions/getMissionScriptingWithTrigger'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

@Injectable()
export class DcsMissionScriptingService {
  @Inject(SettingsManager)
  private readonly settingsManager: SettingsManager

  async validate() {
    const installationDir = await this.settingsManager.getDcsInstallationDirectory()
    if (!installationDir) throw new Error(NO_DCS_INSTALLATION_DIR)

    return validateMissionScripting(installationDir)
  }

  async getUpdated() {
    const installationDir = await this.settingsManager.getDcsInstallationDirectory()
    if (!installationDir) throw new Error(NO_DCS_INSTALLATION_DIR)

    return getMissionScriptingWithTrigger(installationDir)
  }

  async applyUpdated() {
    const installationDir = await this.settingsManager.getDcsInstallationDirectory()
    if (!installationDir) throw new Error(NO_DCS_INSTALLATION_DIR)

    const newFile = await getMissionScriptingWithTrigger(installationDir)
    await writeFile(join(installationDir, '/Scripts/MissionScripting.lua'), newFile)
    return true
  }
}
