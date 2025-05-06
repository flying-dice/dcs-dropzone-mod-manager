import winston from 'winston'
import bytes from 'bytes'
import { dirname, join } from 'node:path'
import { app } from 'electron'
import { ensureDirSync } from 'fs-extra'
import { posixpath } from './functions/posixpath'

const { combine, timestamp, printf, colorize } = winston.format

const myFormat = printf(({ level, message, context, timestamp }) => {
  return `${timestamp} [${context}] [${level}] ${message}`
})

export const filename = posixpath(join(app.getPath('logs'), 'main.log'))

ensureDirSync(dirname(filename))

console.log('Logs will be written to', filename)

export const fileTransport = new winston.transports.File({
  options: { flags: 'w' },
  maxsize: bytes('1mb'),
  filename,
  format: combine(timestamp(), myFormat),
  maxFiles: 1
})

export const consoleTransport = new winston.transports.Console({
  format: combine(colorize(), timestamp(), myFormat)
})
