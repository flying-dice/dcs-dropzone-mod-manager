import { get7zip } from './7zip'
import { spawn } from 'child_process'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { ensureDir, readJsonSync, rmdir, writeJsonSync } from 'fs-extra'
import Downloader from 'nodejs-file-downloader'
import { join } from 'path'
import { app } from 'electron'
import { config } from '../../lib/config'
import { glob } from 'glob'
import { Logger } from '@nestjs/common'
import { existsSync } from 'node:fs'

const logger = new Logger('rclone')
const rootDir = join(
  process.env.LOCALAPPDATA || app.getPath('userData'),
  config.appDataName,
  'rclone'
)

const manifestPath = join(rootDir, 'manifest.json')

const RCLONE_DOWNLOAD = 'https://downloads.rclone.org/v1.66.0/rclone-v1.66.0-windows-amd64.zip'

let _rcloneInstance: Rclone | undefined = undefined

export class Rclone {
  private static readonly ARGS = [
    'rcd',
    '--rc-web-gui',
    '--rc-web-gui-no-open-browser',
    '--rc-no-auth',

    '--rc-allow-origin',
    '*',

    '--rc-addr',
    'localhost:5572'
  ]

  private process: ChildProcessWithoutNullStreams | undefined

  constructor(private readonly exePath: string) {}

  async startDaemon(): Promise<void> {
    if (this.process) {
      logger.log('rclone daemon already running')
      return
    }

    return new Promise((resolve, reject) => {
      logger.log('Starting rclone')
      this.process = spawn(this.exePath, Rclone.ARGS)

      this.process.on('spawn', () => {
        resolve()
      })

      this.process.on('error', (err) => {
        console.error(`Failed to start rclone: ${err}`)
        reject(err)
      })

      this.process.on('exit', (code, signal) => {
        if (code) {
          console.log(`rclone exited with code ${code}`)
        } else if (signal) {
          console.log(`rclone was killed with signal ${signal}`)
        } else {
          console.log('rclone started successfully in daemon mode')
        }
      })

      this.process.stdout.on('data', (data) => {
        logger.log(data)
      })

      this.process.stderr.on('data', (data) => {
        logger.error(data)
      })
    })
  }

  async stopDaemon(): Promise<void> {
    this.process?.kill()
    this.process = undefined
  }
}

export async function getrclone(): Promise<Rclone> {
  if (_rcloneInstance) {
    logger.log('Using existing rclone instance')
    return _rcloneInstance
  }

  logger.log('Creating new rclone instance')

  try {
    logger.log(`Checking for existing 7zip manifest at ${manifestPath}`)
    const { exePath, downloadUrl } = readJsonSync(manifestPath)
    logger.log(`Found existing rclone manifest, exePath: ${exePath}, downloadUrl: ${downloadUrl}`)
    if (existsSync(exePath) && RCLONE_DOWNLOAD === downloadUrl) {
      _rcloneInstance = new Rclone(exePath)
      logger.log(`Using existing Installation, new rclone instance created ${exePath}`)
      return _rcloneInstance
    }
  } catch (err) {
    logger.error(`Failed to read manifest file: ${err}, re-installing`)
  }

  logger.log(`Removing root directory: ${rootDir}`)
  await rmdir(rootDir, { recursive: true }).catch((err) => logger.error(err))
  await ensureDir(rootDir)

  logger.log(`Downloading rclone from ${RCLONE_DOWNLOAD}`)
  const downloaded = await new Downloader({
    url: RCLONE_DOWNLOAD,
    directory: rootDir
  }).download()

  if (!downloaded.filePath) {
    throw new Error('Failed to download rclone, file path not found')
  }

  logger.log('Requesting rclone instance')
  const _7zip = await get7zip()

  logger.log(`Extracting rclone to ${rootDir}`)
  await _7zip.extract(downloaded.filePath, rootDir)

  const [rcloneExe] = await glob('**/rclone.exe', { cwd: rootDir, absolute: true })

  if (!rcloneExe || !existsSync(rcloneExe)) {
    throw new Error('Failed to extract rclone, file path not found or file does not exist')
  }

  _rcloneInstance = new Rclone(rcloneExe)

  logger.log(`rclone instance created ${rcloneExe}`)

  writeJsonSync(manifestPath, {
    exePath: rcloneExe,
    downloadUrl: RCLONE_DOWNLOAD
  })

  return _rcloneInstance
}
