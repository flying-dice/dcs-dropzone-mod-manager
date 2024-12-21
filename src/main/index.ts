import 'reflect-metadata'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { INestApplicationContext, Logger } from '@nestjs/common'
import { app, BrowserWindow, dialog } from 'electron'
import { trackEvent } from '@aptabase/electron/main'
import { autoUpdater } from 'electron-updater'
import { initalizeAptabase } from './functions/initalizeAptabase'
import { onUnhandledRejection } from './functions/onUnhandledRejection'
import { onUncaughtException } from './functions/onUncaughtException'
import { ApplicationClosingEvent } from './events/application-closing.event'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { bootstrapNestApplication } from './functions/bootstrap-nest-application'
import { MainWindow } from './windows/main.window'

let nestApp: INestApplicationContext

// Prevent multiple instances of the app from running
// When calling app.requestSingleInstanceLock() it will return false if another instance is already running and emit the 'second-instance' event
if (!app.requestSingleInstanceLock()) {
  Logger.debug(
    "Another instance of the app is already running, quitting this instance as the 'second-instance' event will now have fired",
    'main'
  )
  Logger.flush()
  app.quit()
  process.exit(0)
}

app.on('second-instance', (_event, argv) => {
  Logger.log('Second instance detected', 'main')
  const url = argv.find((arg) => arg.startsWith('dropzone://'))
  if (url) {
    Logger.log(`Second instance with URL: ${url}`, 'main')
    nestApp.get(MainWindow).loadDeepLink(url)
  }
})

process.on('uncaughtException', onUncaughtException)
process.on('unhandledRejection', onUnhandledRejection)
initalizeAptabase()
app.setAsDefaultProtocolClient('dropzone')

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

app.on('open-url', (event, url) => {
  event.preventDefault()
  nestApp.get(MainWindow).loadDeepLink(url)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app
  .whenReady()
  .then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.flyingdice.dcsdropzonemodmanager')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    nestApp = await bootstrapNestApplication()

    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) nestApp.get(MainWindow).createMainWindow()
    })
  })
  .catch(onUncaughtException)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    Logger.log('All windows closed, quitting App', 'main')

    Logger.log('NApp: Closing Event Firing...', 'main')
    await nestApp
      .get(EventEmitter2)
      .emitAsync(ApplicationClosingEvent.name, new ApplicationClosingEvent())
    Logger.log('NApp: Closing Event Completed, closing app...', 'main')
    await nestApp.close()
    Logger.log("NApp: Closed', 'main")

    await trackEvent('app_quit')
      .then(() => Logger.log('Aptabase event sent for app_quit', 'main'))
      .catch((err) => Logger.error(`Aptabase event failed for app_quit ${err.toString()}`, 'main'))

    app.quit()
  }
})
