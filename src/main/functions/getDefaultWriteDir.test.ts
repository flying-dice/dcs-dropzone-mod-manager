import { describe, it, expect, vi } from 'vitest'
import { join } from 'node:path'
import { getDefaultWriteDir } from './getDefaultWriteDir'

vi.mock('../config', () => ({
  config: {
    writeDir: 'mockWriteDir'
  }
}))

describe('getDefaultWriteDir', () => {
  it('should return the default write directory path', () => {
    const result = getDefaultWriteDir()
    expect(result).toBe(join('mockWriteDir', 'mods'))
  })
})
