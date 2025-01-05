import { describe, it, vi, beforeAll, afterEach, expect } from 'vitest'
import { DcsMissionScriptingService } from './dcs-mission-scripting.service'
import mockFs from 'mock-fs'
import { Test, TestingModule } from '@nestjs/testing'
import { SettingsManager } from '../manager/settings.manager'
import {
  MISSION_SCRIPTING_TRIGGER,
  MissionScriptingStatusCode,
  NO_DCS_INSTALLATION_DIR
} from '../../lib/mission-scripting'
import { readFile } from 'node:fs/promises'

const missionScriptingLua = `\
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentially harmful lua code that may use these functions.
--You can remove the code below and make available these functions at your own risk.

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

const validMissionScriptingLua = `\
--Initialization script for the Mission lua Environment (SSE)

dofile('Scripts/ScriptingSystem.lua')

${MISSION_SCRIPTING_TRIGGER}
--Sanitize Mission Scripting environment
--This makes unavailable some unsecure functions.
--Mission downloaded from server to client may contain potentially harmful lua code that may use these functions.
--You can remove the code below and make available these functions at your own risk.

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

describe('DcsMissionScriptingService', () => {
  let moduleRef: TestingModule
  let settingsManagerMock = { getDcsInstallationDirectory: vi.fn() }

  beforeAll(async () => {
    settingsManagerMock = {
      getDcsInstallationDirectory: vi
        .fn()
        .mockResolvedValue('C:/Program Files/Eagle Dynamics/DCS World')
    }

    moduleRef = await Test.createTestingModule({
      providers: [
        DcsMissionScriptingService,
        {
          provide: SettingsManager,
          useValue: settingsManagerMock
        }
      ]
    }).compile()
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should report TRIGGER_MISSING if the mission scripting file does not contain the required trigger', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': missionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).validate()).resolves.toEqual({
      content: missionScriptingLua,
      status: MissionScriptingStatusCode.TRIGGER_MISSING
    })
  })

  it('should report VALID if the mission scripting file contains the required trigger', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua':
        validMissionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).validate()).resolves.toEqual({
      content: validMissionScriptingLua,
      status: MissionScriptingStatusCode.VALID
    })
  })

  it('should return an updated, valid mission scripting file if the original is missing the trigger', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': missionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).getUpdated()).resolves.toEqual(
      validMissionScriptingLua
    )
  })

  it('should throw an error if the mission scripting file is already valid (trigger present)', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua':
        validMissionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).getUpdated()).rejects.toThrowError(
      `MissionScripting.lua already contains the expected line --Sanitize Mission Scripting environment`
    )
  })

  it('should write an updated mission scripting file if the original is missing the trigger', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua': missionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).applyUpdated()).resolves.toBeTruthy()
    await expect(
      readFile('C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua', 'utf8')
    ).resolves.toEqual(validMissionScriptingLua)
  })

  it('should throw an error if the mission scripting file is already valid (trigger present) and cannot be updated', async () => {
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts/MissionScripting.lua':
        validMissionScriptingLua
    })

    await expect(moduleRef.get(DcsMissionScriptingService).applyUpdated()).rejects.toThrowError(
      `MissionScripting.lua already contains the expected line --Sanitize Mission Scripting environment`
    )
  })

  it('should throw NO_DCS_INSTALLATION_DIR if the DCS installation directory is not set', async () => {
    // Force the SettingsManager mock to return null/undefined
    settingsManagerMock.getDcsInstallationDirectory.mockResolvedValueOnce(null)

    await expect(moduleRef.get(DcsMissionScriptingService).validate()).rejects.toThrow(
      NO_DCS_INSTALLATION_DIR
    )
  })

  it('should throw if the MissionScripting.lua file is missing entirely', async () => {
    // Directory exists, but no MissionScripting.lua
    mockFs({
      'C:/Program Files/Eagle Dynamics/DCS World/Scripts': {}
    })

    await expect(moduleRef.get(DcsMissionScriptingService).validate()).rejects.toThrowError(
      /ENOENT, no such file or directory.*'/
    )
  })
})
