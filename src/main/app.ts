import { INestApplicationContext } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { config } from './config'
import { get7zip } from './tools/7zip'
import { getrclone } from './tools/rclone'

export async function bootstrap(): Promise<INestApplicationContext> {
  const app = await NestFactory.createApplicationContext(AppModule, config.appOptions)

  await get7zip()
  const rclone = await getrclone()
  await rclone.startDaemon()

  return app
}
