import { Injectable } from '@nestjs/common'
import { autoUpdater, UpdateCheckResult } from 'electron-updater'

@Injectable()
export class UpdateManager {
  async checkForUpdates(): Promise<UpdateCheckResult | undefined> {
    const update = await autoUpdater.checkForUpdatesAndNotify()
    return update || undefined
  }

  async quitAndInstall(): Promise<void> {
    autoUpdater.quitAndInstall()
  }
}
