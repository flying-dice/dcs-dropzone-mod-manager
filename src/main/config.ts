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
  appData: string
  appRoamingDir: string
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
const appData = app.getPath('appData')
const logfile = join(appData, appDataName, 'logs', 'main.log')

export const config: MainConfig = {
  defaultRegistryUrl: 'https://dcs-mod-manager-registry.pages.dev/',
  appDataName,
  appData,
  appRoamingDir: join(appData, appDataName),
  logfile,
  aptabaseAppKey: import.meta.env.MAIN_VITE_APTABASE_APP_KEY,
  rcloneInstance: {
    baseURL: 'http://127.0.0.1:5572'
  },
  mongo: {
    port: 57449,
    dbPath: join(appData, appDataName, '__data')
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
          level: 'info',
          format: combine(timestamp(), myFormat)
        })
      ]
    })
  }
}
