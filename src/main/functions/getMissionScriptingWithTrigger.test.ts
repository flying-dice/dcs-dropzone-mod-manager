import { MISSION_SCRIPTING_TRIGGER } from '../../lib/mission-scripting'
import mockFs from 'mock-fs'
import { getMissionScriptingWithTrigger } from './getMissionScriptingWithTrigger'

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

describe('validateMissionScripting', () => {
  afterEach(() => {
    mockFs.restore()
  })

  it('should return new file when trigger is missing', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': defaultFile
    })

    await expect(
      getMissionScriptingWithTrigger('C:/Program Files/Eagle Dynamics/DCS World')
    ).resolves.toMatchSnapshot()
  })

  it('should throw if trigger is present', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': expectedPosition
    })

    await expect(
      getMissionScriptingWithTrigger('C:/Program Files/Eagle Dynamics/DCS World')
    ).rejects.toThrowError()
  })

  it('should throw if before trigger is not present', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua':
        '---Some Random File'
    })

    await expect(
      getMissionScriptingWithTrigger('C:/Program Files/Eagle Dynamics/DCS World')
    ).rejects.toThrowError()
  })
})
