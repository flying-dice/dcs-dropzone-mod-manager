import { join } from 'path'
import { pathExistsSync } from 'fs-extra'

/**
 * Get the default game directory for DCS by checking the user's saved games folder for DCS and DCS.openbeta
 *
 * Finds the first existing path in the following order:
 * - %USERPROFILE%\Saved Games\DCS
 * - %USERPROFILE%\Saved Games\DCS.openbeta
 */
export function getDefaultGameDir(): string | undefined {
  if (!process.env.USERPROFILE) {
    return undefined
  }

  const defaultPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS')
  const defaultOBPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS.openbeta')

  const paths = [defaultPath, defaultOBPath]

  return paths.find((it) => pathExistsSync(it))
}
