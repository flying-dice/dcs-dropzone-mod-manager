import { posixpath } from './posixpath'
import { join } from 'path'
import { spawn } from 'child_process'
import { mkdir, rename, stat } from 'node:fs/promises'
import { Logger } from '@nestjs/common'
import { extractPercentage } from './extract-percentage'
import { rm } from 'fs-extra'

export type WgetProps = {
  exePath: string
  baseUrl: string
  file: string
  targetDir: string
  onProgress: (progress: { progress: number; summary?: string }) => void
}
export async function wget({ exePath, baseUrl, file, targetDir, onProgress }: WgetProps) {
  await stat(exePath)

  const tempdir = posixpath(join(targetDir, 'downloading'))

  try {
    await mkdir(tempdir, { recursive: true })

    const target = posixpath(join(targetDir, file))
    const source = `${baseUrl}/${file}`
    const args = ['--progress=bar:force:giga', '--show-progress', source]

    const _wget = spawn(exePath, args, { stdio: 'pipe', cwd: tempdir })

    _wget.on('spawn', () => {
      onProgress({ progress: 0 })
    })

    // This is due to the fact that wget writes to stderr https://www.gnu.org/software/wget/manual/wget.html#Logging-and-Input-File-Options:~:text=Log%20all%20messages%20to%20logfile.%20The%20messages%20are%20normally%20reported%20to%20standard%20error.
    _wget.stderr.on('data', (data) => {
      if (!data) return
      const summary = data
        .toString()
        .replace('wget.exe', '')
        .replace(/\[=+>+]/, '')
        .replace(/\s+/g, ' ')
        .trim()
      const progress = extractPercentage(summary)
      if (progress && onProgress) {
        onProgress({ progress, summary })
      }
    })

    _wget.on('error', (err) => {
      _wget.removeAllListeners()
      Logger.error(`Failed to start wget: ${err}`)
    })

    await new Promise((resolve, reject) => {
      _wget.on('close', (code) => {
        if (code === 0) {
          _wget.removeAllListeners()
          onProgress({ progress: 100 })
          resolve(code)
        } else {
          _wget.removeAllListeners()
          reject(new Error(`Failed to download file, code: ${code}`))
        }
      })
    })

    Logger.debug(`Downloaded file successfully, moving to target directory ${target}`)
    await rename(join(tempdir, decodeURIComponent(file)), target)

    Logger.debug('Removing temp directory')
    await rm(tempdir, { recursive: true, force: true })

    return target
  } catch (e) {
    await rm(tempdir, { recursive: true, force: true })
    throw e
  }
}
