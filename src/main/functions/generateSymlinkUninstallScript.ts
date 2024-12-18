import { Logger } from '@nestjs/common'
import { stat } from 'fs-extra'

const logger = new Logger('generateSymlinkUninstallScript')

/**
 * Generates a script to uninstall symlinks for the provided items.
 *
 * This function creates a script that contains commands to remove directories or delete files
 * based on the provided list of uninstallable items.
 *
 * @param {string[]} paths - A list of paths to remove.
 * @returns {string} The generated uninstaller script.
 */
export async function generateSymlinkUninstallScript(paths: string[]): Promise<string> {
  const content: string[] = []

  for (const path of paths) {
    try {
      const stats = await stat(path)
      if (stats.isDirectory()) {
        logger.debug(`Adding rmdir command for folder: ${path}`)
        content.push(`rmdir /s /q "${path}"`)
      } else {
        logger.debug(`Adding del command for file: ${path}`)
        content.push(`del /f /q "${path}"`)
      }
    } catch (error) {
      logger.error(`Failed to get stats for path: ${path}`, error)
    }
  }

  return content.join('\n')
}
