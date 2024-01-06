import { autoUpdater } from 'electron-updater'
import { trpc } from '../trpc'

const updaterService = {
  checkForUpdates() {
    return autoUpdater.checkForUpdatesAndNotify()
  }
}

export const updaterRouter = trpc.router({
  checkForUpdates: trpc.procedure.query(updaterService.checkForUpdates)
})
