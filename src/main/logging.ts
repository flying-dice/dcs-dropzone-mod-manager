import winston from 'winston'
import bytes from 'bytes'
import { join } from 'node:path'
import { app } from 'electron'

const { combine, timestamp, printf, colorize } = winston.format

const myFormat = printf(({ level, message, context, timestamp }) => {
  return `${timestamp} [${context}] [${level}] ${message}`
})

export const fileTransport = new winston.transports.File({
  maxsize: bytes('5mb'),
  filename: join(app.getPath('logs'), 'main.log'),
  level: 'debug',
  format: combine(timestamp(), myFormat)
})

export const consoleTransport = new winston.transports.Console({
  format: combine(colorize(), timestamp(), myFormat),
  level: 'silly'
})
