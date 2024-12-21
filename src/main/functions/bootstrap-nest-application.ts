import { NestFactory } from '@nestjs/core'
import { AppModule } from '../app.module'
import { WinstonModule } from 'nest-winston'
import { consoleTransport, fileTransport } from '../logging'
import { Logger, ShutdownSignal } from '@nestjs/common'
import { BrowserWindow } from 'electron'
import { join } from 'node:path'

export async function bootstrapNestApplication() {
  const logger = new Logger('bootstrap')
  logger.log('Bootstrapping application')
  const splashScreen = new BrowserWindow({
    width: 1050,
    height: 600,
    show: true,
    frame: false,
    alwaysOnTop: false
  })
  await splashScreen.loadFile(join(__dirname, '../../resources/splash.png'))
  splashScreen.setTitle('DCS Dropzone Mod Manager')

  try {
    logger.log('Creating application context')
    const applicationContext = await NestFactory.createApplicationContext(AppModule, {
      abortOnError: false,
      logger: WinstonModule.createLogger({
        level: 'silly',
        transports: [consoleTransport, fileTransport]
      })
    })
    applicationContext.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT])

    logger.log('Initializing application context')
    await applicationContext.init()

    logger.log('Application context initialized, closing splash screen')
    splashScreen.close()

    return applicationContext
  } catch (e) {
    splashScreen.close()
    logger.error('Failed to bootstrap application', e)
    throw e
  }
}
