import { spawn } from 'child_process'
import { ChildProcessWithoutNullStreams } from 'node:child_process'
import { existsSync } from 'node:fs'
import { Logger } from '@nestjs/common'
/**
 * This module provides a wrapper around the 7-zip executable it downloads and extracts the 7-zip extra archive from the 7-zip website
 * and provides a class that can be used to extract supported archive types.
 *
 * A potential alternative would be to instruct the user to download 7-zip themselves and provide the path to the executable
 *
 * The wrapper class has been kept separate with this in mind, so that it can be easily replaced with a class that uses the user provided executable
 */
import { ensureDir, readJsonSync, rm, writeJsonSync } from 'fs-extra'
import { glob } from 'glob'
import Downloader from 'nodejs-file-downloader'
import { join } from 'node:path'

const logger = new Logger('_7zip')

const _7ZR_DOWNLOAD = 'https://www.7-zip.org/a/7zr.exe'
const _7ZEXTRA_DOWNLOAD = 'https://www.7-zip.org/a/7z2407-extra.7z'

let _7zipInstance: _7zip | undefined = undefined
let _7ziprInstance: _7zip | undefined = undefined

export class _7zip {
  static readonly SUPPORTED_ARCHIVE_EXTENSIONS = [
    '7z',
    'bzip2',
    'gzip',
    'lzma',
    'lzma86',
    'tar',
    'xz',
    'zip',
    'zstd'
  ]
  jobs: Map<string, ChildProcessWithoutNullStreams> = new Map()

  jobLogs: Map<string, string> = new Map()

  constructor(private readonly exePath: string) {}

  async extract(archivePath: string, destDir: string): Promise<void> {
    logger.debug(`Extracting ${archivePath} to ${destDir}`)
    const child = this.spawnExtractor(archivePath, destDir)
    this.jobs.set(archivePath, child)

    child.stderr.on('data', (data) => {
      if (!data) return
      this.jobLogs.set(archivePath, data.toString())
    })

    child.stdout.on('data', (data) => {
      if (!data) return
      this.jobLogs.set(archivePath, data.toString())
    })

    return new Promise((resolve, reject) => {
      child.on('close', (code) => {
        this.jobs.delete(archivePath)
        if (code === 0) {
          resolve()
        } else {
          reject(new Error(`Failed to extract zip file, code: ${code}`))
        }
      })
    })
  }

  spawnExtractor(archivePath: string, destDir: string): ChildProcessWithoutNullStreams {
    logger.debug(`Spawning 7zr process with ${archivePath} and ${destDir}`)
    logger.debug(`- ${this.exePath} -bso0 -bsp1 -y x ${archivePath} -o${destDir}`)
    return spawn(this.exePath, ['-bso0', '-bsp1', '-y', 'x', archivePath, `-o${destDir}`], {
      stdio: 'pipe'
    })
  }
}

/**
 * Downloads the 7zr executable and returns an instance of the 7zip class
 * that can be used to extract 7-zip archives
 */
async function get7zipr(installDir: string): Promise<_7zip> {
  const rootDir = join(installDir, '7zip')

  if (_7ziprInstance) {
    logger.debug('Using existing 7zip instance')
    return _7ziprInstance
  }

  logger.debug('Creating new 7zip instance')

  logger.debug(`Downloading 7zr from ${_7ZR_DOWNLOAD}`)
  const downloaded = await new Downloader({
    url: _7ZR_DOWNLOAD,
    directory: rootDir
  }).download()

  if (!downloaded.filePath) {
    throw new Error('Failed to download 7zr, file path not found')
  }

  const [_7zrExe] = await glob('**/7zr.exe', { cwd: rootDir, absolute: true })

  if (!_7zrExe || !existsSync(_7zrExe)) {
    throw new Error('Failed to extract 7za, file path not found or file does not exist')
  }

  _7ziprInstance = new _7zip(_7zrExe)

  logger.debug(`7zr instance created ${downloaded.filePath}`)
  return _7ziprInstance
}

/**
 * Downloads 7-zip Extra from the 7-zip extra download url in the config
 * and extracts the archive using the 7zr executable and returns an instance of the 7zip class
 * that can be used to extract additional archive types
 */
export async function get7zip(installDir: string): Promise<_7zip> {
  const rootDir = join(installDir, '7zip')
  const manifestPath = join(rootDir, 'manifest.json')

  if (_7zipInstance) {
    logger.debug('Using existing 7zip instance')
    return _7zipInstance
  }

  logger.debug('Creating new 7zip instance')

  try {
    logger.debug(`Checking for existing 7zip manifest at ${manifestPath}`)
    const { exePath, downloadUrl } = readJsonSync(manifestPath)
    logger.debug(`Found existing 7zip manifest, exePath: ${exePath}, downloadUrl: ${downloadUrl}`)
    if (existsSync(exePath) && _7ZEXTRA_DOWNLOAD === downloadUrl) {
      _7zipInstance = new _7zip(exePath)
      logger.debug(`Using existing Installation, new 7zip instance created ${exePath}`)
      return _7zipInstance
    }
  } catch (err) {
    logger.error(`Failed to read manifest file: ${err}, re-installing`)
  }

  logger.debug(`Removing root directory: ${rootDir}`)
  await rm(rootDir, { recursive: true }).catch((err) => logger.error(err))
  await ensureDir(rootDir)

  logger.debug(`Downloading 7-zip Extra from ${_7ZEXTRA_DOWNLOAD}`)
  const downloaded = await new Downloader({
    url: _7ZEXTRA_DOWNLOAD,
    directory: rootDir
  }).download()

  if (!downloaded.filePath) {
    throw new Error('Failed to download 7-zip Extra, file path not found')
  }

  logger.debug('Requesting 7zr instance')
  const _7zr = await get7zipr(installDir)

  logger.debug(`Extracting 7-zip Extra to ${rootDir}`)
  await _7zr.extract(downloaded.filePath, rootDir)

  const [_7zaExe] = await glob('**/7za.exe', { cwd: rootDir, absolute: true })

  if (!_7zaExe || !existsSync(_7zaExe)) {
    throw new Error('Failed to extract 7za, file path not found or file does not exist')
  }

  _7zipInstance = new _7zip(_7zaExe)

  logger.debug(`7zip instance created ${_7zaExe}`)

  writeJsonSync(manifestPath, {
    exePath: _7zaExe,
    downloadUrl: _7ZEXTRA_DOWNLOAD
  })

  return _7zipInstance
}
