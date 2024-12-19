import { afterEach, describe, expect, it, vi } from 'vitest'
import mockFs from 'mock-fs'
import { when } from 'jest-when'
import { findInstalledDcsWriteDir } from './findInstalledDcsWriteDir'
import { getEnvironmentVariable } from './getEnvironmentVariable'

vi.mock('./getEnvironmentVariable', () => ({
  getEnvironmentVariable: vi.fn()
}))

describe('getDefaultGameDir', () => {
  beforeAll(() => {
    when(getEnvironmentVariable).calledWith('USERPROFILE').mockReturnValue('C:/Users/username')
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should return the path if DCS folder exists', () => {
    mockFs({ 'C:/Users/username/Saved Games/DCS': {} })
    const result = findInstalledDcsWriteDir()
    expect(result).toBe('C:/Users/username/Saved Games/DCS')
  })

  it('should return the path if DCS.openbeta folder exists and DCS does not exist', () => {
    mockFs({ 'C:/Users/username/Saved Games/DCS.openbeta': {} })
    const result = findInstalledDcsWriteDir()
    expect(result).toBe('C:/Users/username/Saved Games/DCS.openbeta')
  })

  it('should return undefined if neither DCS nor DCS.openbeta folders exist', () => {
    const result = findInstalledDcsWriteDir()
    expect(result).toBeUndefined()
  })
})
