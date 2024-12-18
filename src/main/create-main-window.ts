import { INestApplicationContext, Logger } from '@nestjs/common'
import { BrowserWindow, shell } from 'electron'
import { SettingsService } from './services/settings.service'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { trackEvent } from '@aptabase/electron/main'
import icon from '../../resources/icon.png?asset'

const windowDefault = JSON.stringify([1280, 720, 0, 0])

export async function createWindow(app: INestApplicationContext): Promise<BrowserWindow> {
  Logger.log('Creating main window', 'main')

  const [width, height, x, y] = JSON.parse(
    await app.get(SettingsService).getSettingValueOrDefault('mw_config', windowDefault)
  )

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
    show: true,
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

    app.get(SettingsService).setSettingValue('mw_config', JSON.stringify([width, height, x, y]))
  })

  mainWindow.on('moved', () => {
    const [width, height] = mainWindow.getSize()
    const [x, y] = mainWindow.getPosition()

    app.get(SettingsService).setSettingValue('mw_config', JSON.stringify([width, height, x, y]))
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
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
