import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { config } from '../config'
import { getDefaultWriteDir } from './getDefaultWriteDir'

const testLocalAppData = 'C:\\Users\\TestUser\\AppData\\Local'

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn().mockImplementation(() => 'C:\\Users\\TestUser\\AppData\\Local')
  }
}))

describe('getDefaultWriteDir', () => {
  let _LOCALAPPDATA: string | undefined

  beforeAll(() => {
    _LOCALAPPDATA = process.env.LOCALAPPDATA
    process.env.LOCALAPPDATA = testLocalAppData
  })

  afterAll(() => {
    process.env.LOCALAPPDATA = _LOCALAPPDATA
  })

  it('should return the directory path using LOCALAPPDATA if set', () => {
    const result = getDefaultWriteDir()
    expect(result).toBe(`${testLocalAppData}\\${config.appDataName}\\mods`)
  })
})
