import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import {
  MISSION_SCRIPTING_TRIGGER,
  MISSION_SCRIPTING_TRIGGER_BEFORE,
  MissionScriptingStatusCode
} from '../../lib/mission-scripting'

export async function validateMissionScripting(dcsInstallationDir: string): Promise<{
  content: string
  status: MissionScriptingStatusCode
}> {
  const fileContent = await readFile(
    join(dcsInstallationDir, '/Scripts/MissionScripting.lua'),
    'utf8'
  )
  const fileContentArr = fileContent.split('\n').map((line) => line.trim())

  const indexOfMissionScriptingTrigger = fileContentArr.indexOf(MISSION_SCRIPTING_TRIGGER)
  const indexOfMissionScriptingTriggerBefore = fileContentArr.indexOf(
    MISSION_SCRIPTING_TRIGGER_BEFORE
  )

  if (indexOfMissionScriptingTriggerBefore === -1) {
    throw new Error(
      `MissionScripting.lua does not contain the expected line ${MISSION_SCRIPTING_TRIGGER_BEFORE}`
    )
  }

  if (
    indexOfMissionScriptingTrigger >= 0 &&
    indexOfMissionScriptingTrigger < indexOfMissionScriptingTriggerBefore
  ) {
    return {
      content: fileContent,
      status: MissionScriptingStatusCode.VALID
    }
  }

  if (indexOfMissionScriptingTrigger === -1) {
    return {
      content: fileContent,
      status: MissionScriptingStatusCode.TRIGGER_MISSING
    }
  }

  if (indexOfMissionScriptingTrigger > indexOfMissionScriptingTriggerBefore) {
    return {
      content: fileContent,
      status: MissionScriptingStatusCode.TRIGGER_POSITION_INCORRECT
    }
  }

  return {
    content: fileContent,
    status: MissionScriptingStatusCode.UNKNOWN_ERROR
  }
}
