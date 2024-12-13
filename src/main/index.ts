import 'reflect-metadata'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { INestApplicationContext, Logger } from '@nestjs/common'
import { app, BrowserWindow, dialog } from 'electron'
import { initialize, trackEvent } from '@aptabase/electron/main'
import { createIPCHandler } from 'electron-trpc/main'
import { getAppWithRouter } from './router'
import { config } from './config'
import { createWindow } from './create-main-window'
import { showError } from './utils/show-error'
import { showDuplicateAppInstance } from './utils/show-duplicate-app-instance'
import { autoUpdater } from 'electron-updater'

if (!app.requestSingleInstanceLock()) {
  Logger.debug(
    'Another instance of the app is running, showing duplicate app instance dialog',
    'main'
  )
  showDuplicateAppInstance()
  app.quit()
}

process.on('uncaughtException', (err) => {
  showError(err)
})

process.on('unhandledRejection', (err) => {
  showError(new Error(err as string))
})

if (config.aptabaseAppKey) {
  Logger.log('Initializing Aptabase', 'main')
  initialize(config.aptabaseAppKey).then(() =>
    Logger.log(`Aptabase initialized ${config.aptabaseAppKey?.replace(/\d/g, '*')}`, 'main')
  )
} else {
  Logger.warn('No Aptabase app key provided, skipping initialization', 'main')
}

let nestApp: INestApplicationContext

autoUpdater.checkForUpdatesAndNotify()

autoUpdater.on('update-downloaded', (info) => {
  Logger.log(`Update downloaded: ${info.version}`, 'main')
  // Show Electron dialog to ask user to restart the app

  dialog
    .showMessageBox({
      type: 'question',
      title: 'Update Available',
      message:
        'A new version of the app is available. Do you want to restart the app now to apply the update?',
      buttons: ['Install Now', 'Install on Exit']
    })
    .then(({ response }) => {
      if (response === 0) {
        autoUpdater.quitAndInstall(false)
      }
    })
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const awr = await getAppWithRouter()
  nestApp = awr.app

  const mainWindow = await createWindow(awr.app)
  createIPCHandler({ router: awr.router, windows: [mainWindow] })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow(awr.app)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  Logger.log('All windows closed, quitting App', 'main')

  Logger.log('Closing NApp', 'main')
  await nestApp.close()
  Logger.log("NApp Closed', 'main")

  await trackEvent('app_quit')
    .then(() => Logger.log('Aptabase event sent for app_quit', 'main'))
    .catch((err) => Logger.error(`Aptabase event failed for app_quit ${err.toString()}`, 'main'))

  app.quit()
})
