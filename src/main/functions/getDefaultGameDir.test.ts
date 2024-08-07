import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import { pathExistsSync } from 'fs-extra'
import { getDefaultGameDir } from './getDefaultGameDir'

vi.mock('fs-extra', () => ({
  pathExistsSync: vi.fn()
}))

describe('getDefaultGameDir', () => {
  let __USERPROFILE: string | undefined
  const testUserProfile = 'C:\\Users\\TestUser'

  beforeAll(() => {
    __USERPROFILE = process.env.USERPROFILE
    process.env.USERPROFILE = testUserProfile
  })

  afterAll(() => {
    process.env.USERPROFILE = __USERPROFILE
  })

  it('should return the path if DCS folder exists', () => {
    const defaultPath = `${testUserProfile}\\Saved Games\\DCS`
    vi.mocked(pathExistsSync).mockImplementation((path) => path === defaultPath || false)
    const result = getDefaultGameDir()
    expect(result).toBe(defaultPath)
  })

  it('should return the path if DCS.openbeta folder exists and DCS does not exist', () => {
    process.env.USERPROFILE = 'C:\\Users\\TestUser'
    const defaultOBPath = `${testUserProfile}\\Saved Games\\DCS.openbeta`
    vi.mocked(pathExistsSync).mockImplementation((path) => path === defaultOBPath || false)
    const result = getDefaultGameDir()
    expect(result).toBe(defaultOBPath)
  })

  it('should return undefined if neither DCS nor DCS.openbeta folders exist', () => {
    vi.mocked(pathExistsSync).mockImplementation(() => false)
    const result = getDefaultGameDir()
    expect(result).toBeUndefined()
  })
})
