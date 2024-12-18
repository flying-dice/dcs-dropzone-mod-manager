import { describe, expect, it, vi } from 'vitest'
import winreg from 'winreg'
import { getDefaultGameInstallDir } from './getDefaultGameInstallDir'

vi.mock('winreg', () => {
  return {
    default: vi.fn(),
    HKCU: 'HKCU'
  }
})

describe('getDefaultGameInstallDir', () => {
  it('returns the OpenBeta path if it exists', async () => {
    ;(winreg as any).mockImplementation(() => ({
      get: vi.fn((value, callback) => {
        if (value === 'Path') {
          callback(null, { value: 'C:\\Games\\DCS World OpenBeta' })
        } else {
          callback(new Error('Value not found'))
        }
      })
    }))
    const result = await getDefaultGameInstallDir()
    expect(result).toBe('C:\\Games\\DCS World OpenBeta')
  })

  it('returns the default path if OpenBeta path does not exist', async () => {
    ;(winreg as any).mockImplementation(() => ({
      get: vi.fn((value, callback) => {
        if (value === 'Path') {
          callback(null, { value: 'C:\\Games\\DCS World' })
        } else {
          callback(new Error('Value not found'))
        }
      })
    }))
    const result = await getDefaultGameInstallDir()
    expect(result).toBe('C:\\Games\\DCS World')
  })

  it('returns undefined if neither path exists', async () => {
    ;(winreg as any).mockImplementation(() => ({
      get: vi.fn((_, callback) => {
        callback(new Error('Value not found'))
      })
    }))
    const result = await getDefaultGameInstallDir()
    expect(result).toBeUndefined()
  })

  it('handles registry access errors gracefully', async () => {
    ;(winreg as any).mockImplementation(() => ({
      get: vi.fn((_, callback) => {
        callback(new Error('Access denied'))
      })
    }))
    const result = await getDefaultGameInstallDir()
    expect(result).toBeUndefined()
  })
})
