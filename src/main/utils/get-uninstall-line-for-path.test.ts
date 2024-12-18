import { describe, expect, it, vi } from 'vitest'
import { stat } from 'fs-extra'
import { getLineForPath } from './get-uninstall-line-for-path'

vi.mock('fs-extra', () => ({
  stat: vi.fn()
}))

describe('getLineForPath', () => {
  it('returns rmdir command for a directory path', async () => {
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => true } as any)
    const result = await getLineForPath('C:\\path\\to\\directory')
    expect(result).toBe('rmdir /s /q "C:\\path\\to\\directory"')
  })

  it('returns del command for a file path', async () => {
    vi.mocked(stat).mockResolvedValue({ isDirectory: () => false } as any)
    const result = await getLineForPath('C:\\path\\to\\file.txt')
    expect(result).toBe('del /f /q "C:\\path\\to\\file.txt"')
  })

  it('handles non-existent paths gracefully', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('ENOENT'))
    await expect(getLineForPath('C:\\non\\existent\\path')).rejects.toThrow('ENOENT')
  })

  it('handles permission errors gracefully', async () => {
    vi.mocked(stat).mockRejectedValue(new Error('EACCES'))
    await expect(getLineForPath('C:\\restricted\\path')).rejects.toThrow('EACCES')
  })
})
