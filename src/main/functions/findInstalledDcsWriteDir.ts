import { join } from 'node:path'
import { pathExistsSync } from 'fs-extra'
import { posixpath } from './posixpath'
import { getEnvironmentVariable } from './getEnvironmentVariable'

/**
 * Get the default game directory for DCS by checking the user's saved games folder for DCS and DCS.openbeta
 *
 * Finds the first existing path in the following order:
 * - %USERPROFILE%\Saved Games\DCS
 * - %USERPROFILE%\Saved Games\DCS.openbeta
 */
export function findInstalledDcsWriteDir(): string | undefined {
  const userProfile = getEnvironmentVariable('USERPROFILE')
  if (!userProfile) {
    return undefined
  }

  const defaultPath = posixpath(join(userProfile, 'Saved Games', 'DCS'))
  const defaultOBPath = posixpath(join(userProfile, 'Saved Games', 'DCS.openbeta'))

  const paths = [defaultPath, defaultOBPath]

  return paths.find((it) => pathExistsSync(it))
}
