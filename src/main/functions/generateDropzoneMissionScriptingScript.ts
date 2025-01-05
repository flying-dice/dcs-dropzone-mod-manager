import { Logger } from '@nestjs/common'
import { stat } from 'fs-extra'
import { posixpath } from './posixpath'
import {
  MISSION_SCRIPTING_TRIGGER,
  MISSION_SCRIPTING_TRIGGER_BEFORE
} from '../../lib/mission-scripting'

const logger = new Logger('generateDropzoneMissionScriptingScript')

const FILE_HEADER = `\
-- This file is automatically generated by DCS DROPZONE
-- Do not edit this file manually as it will be overwritten
-- This file should be called at the top (before '${MISSION_SCRIPTING_TRIGGER_BEFORE}') of the DCS MissionScripting.lua file by adding the following line:
-- ${MISSION_SCRIPTING_TRIGGER}

function dofileifexist(filePath)
    local file = io.open(filePath, "r")
    if file then
        env.info("[dcs-dropzone] - Running dofile: " .. filePath)
        file:close()
        dofile(filePath)
    else
        env.warning("[dcs-dropzone] - Attempted to dofile but file was not found: " .. filePath)
    end
end
`

const getLineForScript = (id: string, symlinkPath: string) => `\
-- ${id}
dofileifexist([[${symlinkPath}]])
`

/**
 * Generates a script to run lua files for the provided items.
 *
 * This function creates a script that contains commands to remove directories or delete files
 * based on the provided list of uninstallable items.
 *
 * @param {{id: string, path: string}[]} paths - A list of paths to remove.
 * @returns {string} The generated uninstaller script.
 */
export async function generateDropzoneMissionScriptingScript(
  paths: { id: string; path: string }[]
): Promise<string> {
  const content: string[] = []

  // eslint-disable-next-line prefer-const
  for (let { id, path } of paths) {
    path = posixpath(path) // Must convert to posix path for lua script as windows paths would need to be escaped
    try {
      await stat(path)
      logger.debug(`Adding dofile for: ${path}`)
      content.push(getLineForScript(id, path))
    } catch (error) {
      logger.error(`Failed to get stats for path: ${path}`, error)
    }
  }

  return FILE_HEADER + `\n-- ## Start of Scripts ##\n` + content.join('\n')
}