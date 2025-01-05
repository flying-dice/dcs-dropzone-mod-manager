export enum MissionScriptingStatusCode {
  VALID,
  TRIGGER_MISSING,
  TRIGGER_POSITION_INCORRECT,
  UNKNOWN_ERROR
}

export const MISSION_SCRIPTING_TRIGGER = `dofile(lfs.writedir()..'Scripts/dcs-dropzone_MissionScripting.lua')`
export const MISSION_SCRIPTING_TRIGGER_BEFORE = `--Sanitize Mission Scripting environment`
export const NO_DCS_INSTALLATION_DIR = `The DCS installation directory is not configured, please configure it in the settings.`
