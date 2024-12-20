import { Logger } from '@nestjs/common'
import { app, BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { trackEvent } from '@aptabase/electron/main'
import icon from '../../resources/icon.png?asset'
import { Store } from './utils/store'
import { ensureDir } from 'fs-extra'
import { z } from 'zod'
import { onBrowserWindowMovement } from './functions/onMainWindowMovement'

const mainWindowPositionsStorePath = join(app.getPath('userData'), 'Stores', 'MWP')

export async function createWindow(): Promise<BrowserWindow> {
  Logger.log('Creating main window', 'main')

  await ensureDir(join(app.getPath('userData'), 'Stores'))
  const mainWindowPositions = await Store.load(mainWindowPositionsStorePath, z.number()).catch(
    (err) => {
      Logger.error(`Failed to load main window positions ${err.toString()}`, 'main')
      return Store.new(mainWindowPositionsStorePath, z.number())
    }
  )

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: mainWindowPositions.get('width') ?? 1280,
    height: mainWindowPositions.get('height') ?? 800,
    x: mainWindowPositions.get('x') ?? 0,
    y: mainWindowPositions.get('y') ?? 0,
    show: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('resized', onBrowserWindowMovement(mainWindow, mainWindowPositions))
  mainWindow.on('maximize', onBrowserWindowMovement(mainWindow, mainWindowPositions))
  mainWindow.on('unmaximize', onBrowserWindowMovement(mainWindow, mainWindowPositions))
  mainWindow.on('moved', onBrowserWindowMovement(mainWindow, mainWindowPositions))
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
    if (mainWindowPositions.get('maximized')) {
      mainWindow.maximize()
    }
  })

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' } // Prevent Electron from handling the link
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    event.preventDefault()
    shell.openExternal(url)
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
