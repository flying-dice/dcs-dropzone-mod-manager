import { join } from 'node:path'
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface'
import { AxiosRequestConfig } from 'axios'
import { app } from 'electron'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import bytes from 'bytes'

const { combine, timestamp, printf, colorize } = winston.format

const myFormat = printf(({ level, message, context, timestamp }) => {
  return `${timestamp} [${context}] [${level}] ${message}`
})

export type MainConfig = {
  defaultRegistryUrl: string
  appDataName: string
  logfile: string
  mongo: {
    port: number
    dbPath: string
  }
  aptabaseAppKey?: string
  rcloneInstance: AxiosRequestConfig
  appOptions: NestApplicationContextOptions
}

const appDataName = 'dcs-dropzone'
const logfile = join(app.getPath('logs'), 'main.log')

export const config: MainConfig = {
  defaultRegistryUrl: 'https://dcs-mod-manager-registry.pages.dev/',
  appDataName,
  logfile,
  aptabaseAppKey: import.meta.env.MAIN_VITE_APTABASE_APP_KEY,
  rcloneInstance: {
    baseURL: 'http://127.0.0.1:5572'
  },
  mongo: {
    port: 57449,
    dbPath: join(app.getPath('userData'), '__data')
  },
  appOptions: {
    logger: WinstonModule.createLogger({
      level: 'verbose',
      transports: [
        new winston.transports.Console({
          format: combine(colorize(), timestamp(), myFormat)
        }),
        new winston.transports.File({
          maxsize: bytes('5mb'),
          filename: logfile,
          level: 'debug',
          format: combine(timestamp(), myFormat)
        })
      ]
    })
  }
}
