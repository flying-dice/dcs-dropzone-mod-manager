import mockFs from 'mock-fs'
import { validateMissionScripting } from './validateMissionScripting'
import { MISSION_SCRIPTING_TRIGGER, MissionScriptingStatusCode } from '../../lib/mission-scripting'

const topOfFile = `${MISSION_SCRIPTING_TRIGGER}
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentialy harmful lua code that may use these functions.
--You can remove the code below and make availble these functions at your own risk.

local function sanitizeModule(name)
_G[name] = nil
package.loaded[name] = nil
end

do
sanitizeModule('os')
sanitizeModule('io')
sanitizeModule('lfs')
_G['require'] = nil
_G['loadlib'] = nil
_G['package'] = nil
end
`

const expectedPosition = `
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

${MISSION_SCRIPTING_TRIGGER}
--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentialy harmful lua code that may use these functions.
--You can remove the code below and make availble these functions at your own risk.

local function sanitizeModule(name)
_G[name] = nil
package.loaded[name] = nil
end

do
sanitizeModule('os')
sanitizeModule('io')
sanitizeModule('lfs')
_G['require'] = nil
_G['loadlib'] = nil
_G['package'] = nil
end
`

const defaultFile = `
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentialy harmful lua code that may use these functions.
--You can remove the code below and make availble these functions at your own risk.

local function sanitizeModule(name)
_G[name] = nil
package.loaded[name] = nil
end

do
sanitizeModule('os')
sanitizeModule('io')
sanitizeModule('lfs')
_G['require'] = nil
_G['loadlib'] = nil
_G['package'] = nil
end
`

const incorrectPosition = `
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentialy harmful lua code that may use these functions.
--You can remove the code below and make availble these functions at your own risk.

local function sanitizeModule(name)
_G[name] = nil
package.loaded[name] = nil
end

do
sanitizeModule('os')
sanitizeModule('io')
sanitizeModule('lfs')
_G['require'] = nil
_G['loadlib'] = nil
_G['package'] = nil
end

${MISSION_SCRIPTING_TRIGGER}
`

describe('validateMissionScripting', () => {
  afterEach(() => {
    mockFs.restore()
  })

  it('should return TRIGGER_MISSING when file is not got trigger present', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': defaultFile
    })

    await expect(
      validateMissionScripting('C:/Program Files/Eagle Dynamics/DCS World')
    ).resolves.toEqual({
      content: defaultFile,
      status: MissionScriptingStatusCode.TRIGGER_MISSING
    })
  })

  it('should return VALID when file has trigger present', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': expectedPosition
    })

    await expect(
      validateMissionScripting('C:/Program Files/Eagle Dynamics/DCS World')
    ).resolves.toEqual({
      content: expectedPosition,
      status: MissionScriptingStatusCode.VALID
    })
  })

  it('should return VALID when file has trigger present but at top of file', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': topOfFile
    })

    await expect(
      validateMissionScripting('C:/Program Files/Eagle Dynamics/DCS World')
    ).resolves.toEqual({
      content: topOfFile,
      status: MissionScriptingStatusCode.VALID
    })
  })

  it('should return TRIGGER_POSITION_INCORRECT when file has trigger present but out of position', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': incorrectPosition
    })

    await expect(
      validateMissionScripting('C:/Program Files/Eagle Dynamics/DCS World')
    ).resolves.toEqual({
      content: incorrectPosition,
      status: MissionScriptingStatusCode.TRIGGER_POSITION_INCORRECT
    })
  })
})
