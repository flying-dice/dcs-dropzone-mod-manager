import { join } from 'node:path'
import { readFile } from 'node:fs/promises'
import {
  MISSION_SCRIPTING_TRIGGER,
  MISSION_SCRIPTING_TRIGGER_BEFORE
} from '../../lib/mission-scripting'

export async function getMissionScriptingWithTrigger(dcsInstallationDir: string): Promise<string> {
  const fileContent = await readFile(
    join(dcsInstallationDir, '/Scripts/MissionScripting.lua'),
    'utf8'
  )
  const fileContentArr = fileContent.split('\n').map((line) => line.trim())

  const indexOfMissionScriptingTrigger = fileContentArr.indexOf(MISSION_SCRIPTING_TRIGGER)

  const indexOfMissionScriptingTriggerBefore = fileContentArr.indexOf(
    MISSION_SCRIPTING_TRIGGER_BEFORE
  )

  if (indexOfMissionScriptingTrigger >= 0) {
    throw new Error(
      `MissionScripting.lua already contains the expected line ${MISSION_SCRIPTING_TRIGGER_BEFORE}`
    )
  }

  if (indexOfMissionScriptingTriggerBefore === -1) {
    throw new Error(
      `MissionScripting.lua does not contain the expected line ${MISSION_SCRIPTING_TRIGGER_BEFORE}`
    )
  }

  return [
    ...fileContentArr.slice(0, indexOfMissionScriptingTriggerBefore),
    MISSION_SCRIPTING_TRIGGER,
    ...fileContentArr.slice(indexOfMissionScriptingTriggerBefore)
  ].join('\n')
}
