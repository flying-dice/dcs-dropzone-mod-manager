import { Inject, Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { createIPCHandler } from 'electron-trpc/main'
import { getAppRouter } from '../router'
import { BrowserWindow, shell } from 'electron'
import { ModuleRef } from '@nestjs/core'
import { InjectModel } from '@nestjs/mongoose'
import { WindowSetting } from '../schemas/window-setting'
import { Model } from 'mongoose'
import { join } from 'node:path'
import { is } from '@electron-toolkit/utils'
import { trackEvent } from '@aptabase/electron/main'
import icon from '../../../resources/icon.png?asset'
import { onBrowserWindowMovement } from '../functions/onMainWindowMovement'

@Injectable()
export class MainWindow implements OnApplicationBootstrap {
  private readonly logger = new Logger(MainWindow.name)

  private mainWindow?: BrowserWindow

  @Inject(ModuleRef)
  private readonly moduleRef: ModuleRef

  @InjectModel(WindowSetting.name)
  private readonly windowSettings: Model<WindowSetting>

  async onApplicationBootstrap() {
    await this.createMainWindow()
  }

  async createMainWindow() {
    const setting = await this.windowSettings.findOne({ id: 'main' }).exec()

    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      width: setting?.width || 1280,
      height: setting?.height || 800,
      x: setting?.x || 0,
      y: setting?.y || 0,
      show: true,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    createIPCHandler({ router: getAppRouter(this.moduleRef), windows: [this.mainWindow] })

    const _onBrowserWindowMovement = onBrowserWindowMovement(this.mainWindow, (update) =>
      this.windowSettings.updateOne({ id: 'main' }, update, { upsert: true }).exec()
    )

    this.mainWindow.on('resized', _onBrowserWindowMovement)
    this.mainWindow.on('maximize', _onBrowserWindowMovement)
    this.mainWindow.on('unmaximize', _onBrowserWindowMovement)
    this.mainWindow.on('moved', _onBrowserWindowMovement)
    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
      this.mainWindow?.focus()
      if (setting?.maximized) {
        this.mainWindow?.maximize()
      }
    })

    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' } // Prevent Electron from handling the link
    })

    this.mainWindow.webContents.on('will-navigate', (event, url) => {
      event.preventDefault()
      shell.openExternal(url)
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }

    trackEvent('app_window_created')
      .then(() => this.logger.log('Aptabase event sent for app_window_created', 'main'))
      .catch((err) =>
        this.logger.error(`Aptabase event failed for app_window_created ${err.toString()}`, 'main')
      )
  }

  loadDeepLink(url: string) {
    this.logger.log(`Deep link received: ${url}`, 'main')
    if (url && this.mainWindow) {
      this.mainWindow.webContents.send(
        'deep-link',
        `${url.replace('dropzone://', '/')}#${Date.now()}`
      )

      if (this.mainWindow.isMinimized()) this.mainWindow.restore()
      this.mainWindow.focus()
    }
  }
}
