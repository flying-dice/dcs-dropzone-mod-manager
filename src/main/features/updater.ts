import { autoUpdater } from 'electron-updater'
import { trpc } from '../trpc'

const updaterService = {
  checkForUpdates() {
    return autoUpdater.checkForUpdatesAndNotify()
  },
  quitAndInstall() {
    return autoUpdater.quitAndInstall()
  }
}

export const updaterRouter = trpc.router({
  checkForUpdates: trpc.procedure.query(updaterService.checkForUpdates),
  quitAndInstall: trpc.procedure.query(updaterService.quitAndInstall)
})
