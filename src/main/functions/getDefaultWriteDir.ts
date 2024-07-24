import { join } from 'path'
import { config } from '../../lib/config'
import { app } from 'electron'

/**
 * Get the default write directory for mods
 * Defaults to the dcs-dropzone directory in the user's documents folder
 */
export function getDefaultWriteDir(): string {
  return join(process.env.LOCALAPPDATA || app.getPath('userData'), config.appDataName, 'mods')
}
