import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { WinstonModule } from 'nest-winston'
import { consoleTransport } from './logging'
import { ShutdownSignal } from '@nestjs/common'

export async function bootstrap() {
  const applicationContext = await NestFactory.createApplicationContext(AppModule, {
    logger: WinstonModule.createLogger({
      level: 'silly',
      transports: [consoleTransport]
    })
  })
  applicationContext.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT])

  await applicationContext.init()

  return applicationContext
}
