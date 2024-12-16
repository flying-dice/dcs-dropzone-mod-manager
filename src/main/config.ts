import { basename, join } from 'node:path'
import { NestApplicationContextOptions } from '@nestjs/common/interfaces/nest-application-context-options.interface'
import { AxiosRequestConfig } from 'axios'
import { app } from 'electron'
import { WinstonModule } from 'nest-winston'
import winston from 'winston'
import bytes from 'bytes'
import { Logger } from "@nestjs/common";

const { combine, timestamp, printf, colorize } = winston.format

const myFormat = printf(({ level, message, context, timestamp }) => {
  return `${timestamp} [${context}] [${level}] ${message}`
})

export type MainConfig = {
  tempDir: string
  writeDir: string
  defaultRegistryUrl: string
  appDataName: string
  toolsDir: string
  logfile: string
  logfileDisplayName?: string
  mongo: {
    port: number
    dbPath: string
  }
  aptabaseAppKey?: string
  rcloneInstance: AxiosRequestConfig
  appOptions: NestApplicationContextOptions
}

const appDataName = basename(app.getPath('userData'))

const logfile = join(app.getPath('logs'), 'main.log')
const logfileDisplayName = join(app.getPath('logs'), 'main.log').replace(
  app.getPath('home'),
  '%USERPROFILE%'
)

const tempDir = join(app.getPath('temp'), appDataName)
const writeDir = join(process.env.LOCALAPPDATA || app.getPath('userData'), 'dcs-dropzone')
const toolsDir = writeDir

Logger.log(tempDir, 'tempDir')
Logger.log(writeDir, 'writeDir')
Logger.log(toolsDir, 'toolsDir')
Logger.log(appDataName, 'appDataName')
Logger.log(logfile, 'logfile')

export const config: MainConfig = {
  defaultRegistryUrl: 'https://dcs-mod-manager-registry.pages.dev/',
  tempDir,
  writeDir,
  toolsDir,
  appDataName,
  logfile,
  logfileDisplayName,
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
