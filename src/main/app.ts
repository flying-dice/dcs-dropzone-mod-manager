import { NestFactory } from '@nestjs/core'
import { INestApplicationContext } from '@nestjs/common'
import { AppModule } from './app.module'
import { get7zip } from './tools/7zip'
import { getrclone } from './tools/rclone'

export async function bootstrap(): Promise<INestApplicationContext> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['log', 'error', 'warn', 'debug']
  })

  await get7zip()
  const rclone = await getrclone()
  await rclone.startDaemon()

  return app
}
