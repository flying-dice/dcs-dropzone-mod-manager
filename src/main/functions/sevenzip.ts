import { spawn } from 'child_process'
import { Logger } from '@nestjs/common'
import { extractPercentage } from './extract-percentage'
import { stat } from 'node:fs/promises'

export const SUPPORTED_ARCHIVE_EXTENSIONS = [
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

export type SevenzipProps = {
  exePath: string
  archivePath: string
  targetDir: string
  onProgress: (progress: { progress: number; summary?: string }) => void
}
export async function sevenzip({ exePath, archivePath, targetDir, onProgress }: SevenzipProps) {
  await stat(exePath)

  const args = ['-bso1', '-bsp1', '-y', 'x', archivePath, `-o${targetDir}`]

  Logger.verbose(['\n', exePath, ...args].join(' '))

  const _7zip = spawn(exePath, args, { stdio: 'pipe' })

  _7zip.on('spawn', () => {
    onProgress({ progress: 0 })
  })

  _7zip.stdout.on('data', (data) => {
    if (!data) return
    const summary = data.toString().trim()
    const progress = extractPercentage(summary)
    if (progress && onProgress) {
      onProgress({ progress, summary })
    }
  })

  _7zip.stderr.on('data', (data) => {
    if (!data) return
    const summary = data.toString().trim()
    const progress = extractPercentage(summary)
    if (progress && onProgress) {
      onProgress({ progress, summary })
    }
  })

  _7zip.on('error', (err) => {
    _7zip.removeAllListeners()
    Logger.error(`Failed to start Seven Zip: ${err}`)
  })

  await new Promise((resolve, reject) => {
    _7zip.on('close', (code) => {
      if (code === 0) {
        _7zip.removeAllListeners()
        onProgress({ progress: 100 })
        resolve(code)
      } else {
        _7zip.removeAllListeners()
        reject(new Error(`Failed to Extract Archive, code: ${code}`))
      }
    })
  })

  return targetDir
}
