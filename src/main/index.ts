import 'reflect-metadata'
import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { type INestApplicationContext, Logger } from '@nestjs/common'
import { app, BrowserWindow, shell } from 'electron'
import { initialize, trackEvent } from '@aptabase/electron/main'
import { createIPCHandler } from 'electron-trpc/main'
import icon from '../../resources/icon.png?asset'
import { getAppWithRouter } from './router'
import { ConfigService } from './services/config.service'
import { config } from './config'
import { getrclone } from './tools/rclone'

if (config.aptabaseAppKey) {
  Logger.log('Initializing Aptabase', 'main')
  initialize(config.aptabaseAppKey).then(() =>
    Logger.log(`Aptabase initialized ${config.aptabaseAppKey?.replace(/\d/g, '*')}`, 'main')
  )
} else {
  Logger.warn('No Aptabase app key provided, skipping initialization', 'main')
}

const windowDefault = JSON.stringify([900, 670, 0, 0])

async function createWindow(app: INestApplicationContext): Promise<BrowserWindow> {
  Logger.log('Creating main window', 'main')

  const [width, height, x, y] = JSON.parse(
    await app.get(ConfigService).getConfigValueOrDefault('mw_config', windowDefault)
  )

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('resized', () => {
    const [width, height] = mainWindow.getSize()
    const [x, y] = mainWindow.getPosition()

    app.get(ConfigService).setConfigValue('mw_config', JSON.stringify([width, height, x, y]))
  })

  mainWindow.on('moved', () => {
    const [width, height] = mainWindow.getSize()
    const [x, y] = mainWindow.getPosition()

    app.get(ConfigService).setConfigValue('mw_config', JSON.stringify([width, height, x, y]))
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  trackEvent('app_window_created')
    .then(() => Logger.log('Aptabase event sent for app_window_created', 'main'))
    .catch((err) =>
      Logger.error(`Aptabase event failed for app_window_created ${err.toString()}`, 'main')
    )

  return mainWindow
}

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
  Logger.log('All windows closed, quitting app', 'main')
  await trackEvent('app_quit')
    .then(() => Logger.log('Aptabase event sent for app_quit', 'main'))
    .catch((err) => Logger.error(`Aptabase event failed for app_quit ${err.toString()}`, 'main'))

  const rclone = await getrclone()
  await rclone.stopDaemon()

  app.quit()
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
