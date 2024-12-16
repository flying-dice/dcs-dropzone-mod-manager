import { join } from 'node:path'
import { config } from '../config'

/**
 * Get the default write directory for mods
 * Defaults to the dcs-dropzone directory in the user's documents folder
 */
export function getDefaultWriteDir(): string {
  return join(config.writeDir, 'mods')
}
