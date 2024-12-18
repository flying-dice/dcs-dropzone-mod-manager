import { describe, expect, it, vi } from 'vitest'
import { ensureDir } from 'fs-extra'
import writeFileAtomic from 'write-file-atomic'
import { getUninstallLineForPath } from './get-uninstall-line-for-path'
import { UninstallBat, Uninstallable } from './uninstall-bat'
import { when } from 'jest-when'

vi.mock('fs-extra', () => ({
  ensureDir: vi.fn()
}))

vi.mock('write-file-atomic', () => ({
  default: vi.fn()
}))

vi.mock('./get-uninstall-line-for-path', () => ({
  getUninstallLineForPath: vi.fn()
}))

describe('UninstallBat', () => {
  it('adds an item to the uninstallable paths', () => {
    const uninstallBat = new UninstallBat('path')
    const item: Uninstallable = { id: '1', path: 'C:\\path\\to\\file' }
    uninstallBat.addItem(item)
    expect(uninstallBat.uninstallablePaths).toContain(item)
  })

  it('generates correct content for uninstall script', async () => {
    vi.mocked(getUninstallLineForPath).mockResolvedValue('del /f /q "C:\\path\\to\\file"')
    const uninstallBat = new UninstallBat('path')
    uninstallBat.addItem({ id: '1', path: 'C:\\path\\to\\file' })
    const content = await uninstallBat.getContent()
    expect(content).toBe('del /f /q "C:\\path\\to\\file"')
  })

  it('writes the uninstall script to the specified path', async () => {
    vi.mocked(getUninstallLineForPath).mockResolvedValue('del /f /q "C:\\path\\to\\file"')
    const uninstallBat = new UninstallBat('path')
    uninstallBat.addItem({ id: '1', path: 'C:\\path\\to\\file' })
    await uninstallBat.write()
    expect(ensureDir).toHaveBeenCalledWith('path')
    expect(writeFileAtomic).toHaveBeenCalledWith('path', 'del /f /q "C:\\path\\to\\file"')
  })

  it('handles empty uninstallable paths gracefully', async () => {
    const uninstallBat = new UninstallBat('path')
    const content = await uninstallBat.getContent()
    expect(content).toBe('')
  })

  it('handles errors from getUninstallLineForPath gracefully', async () => {
    vi.mocked(getUninstallLineForPath).mockRejectedValue(new Error('Error'))
    const uninstallBat = new UninstallBat('path')
    uninstallBat.addItem({ id: '1', path: 'C:\\path\\to\\file' })
    await expect(uninstallBat.getContent()).rejects.toThrow('Error')
  })

  it('should pass a content snapshot test', () => {
    const uninstallBat = new UninstallBat('C:\\path\\to\\uninstall.bat')
    uninstallBat.addItem({ id: '1', path: 'C:\\path\\to\\folder' })
    when(getUninstallLineForPath)
      .calledWith('C:\\path\\to\\folder')
      .mockResolvedValue('rmdir /s /q "C:\\path\\to\\folder"')

    uninstallBat.addItem({ id: '2', path: 'C:\\path\\to\\file' })
    when(getUninstallLineForPath)
      .calledWith('C:\\path\\to\\file')
      .mockResolvedValue('del /f /q "C:\\path\\to\\file"')

    uninstallBat.addItem({ id: '3', path: 'C:\\path\\to\\another\\file' })
    when(getUninstallLineForPath)
      .calledWith('C:\\path\\to\\another\\file')
      .mockResolvedValue('del /f /q "C:\\path\\to\\another\\file"')

    expect(uninstallBat.getContent()).resolves.toMatchSnapshot()
  })
})
