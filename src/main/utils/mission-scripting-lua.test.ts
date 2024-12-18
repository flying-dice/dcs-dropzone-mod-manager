import { describe, expect, it, vi } from 'vitest'
import { MissionScriptingLua } from './mission-scripting-lua'
import writeFileAtomic from 'write-file-atomic'
import { readFile } from 'fs-extra'

vi.mock('write-file-atomic', () => ({
  default: vi.fn()
}))

vi.mock('fs-extra', () => ({
  readFile: vi.fn(),
  ensureDir: vi.fn()
}))

describe('MissionScriptingLua', () => {
  it('includesLine returns true if the line exists in the file content', () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    const result = lua.includesLine('line2')
    expect(result).toBe(true)
  })

  it('includesLine returns false if the line does not exist in the file content', () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    const result = lua.includesLine('line4')
    expect(result).toBe(false)
  })

  it('includesBefore returns true if the line exists before the specified line', () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    const result = lua.includesBefore('line2', 'line3')
    expect(result).toBe(true)
  })

  it('includesBefore returns false if the line does not exist before the specified line', () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    const result = lua.includesBefore('line3', 'line2')
    expect(result).toBe(false)
  })

  it('addAfter adds a line after the specified line', () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    lua.addAfter('newLine', 'line2')
    expect(lua.content).toBe('line1\nline2\nnewLine\nline3')
  })

  it('write calls outputFile with the correct path and content', async () => {
    const lua = new MissionScriptingLua('path', 'line1\nline2\nline3')
    await lua.write()
    expect(writeFileAtomic).toHaveBeenCalledWith('path', 'line1\nline2\nline3')
  })

  it('fromFile creates an instance with the correct path and content', async () => {
    vi.mocked(readFile).mockResolvedValue('line1\nline2\nline3' as any)
    const lua = await MissionScriptingLua.fromFile('path')
    expect(lua.abspath).toBe('path')
    expect(lua.content).toBe('line1\nline2\nline3')
  })
})
