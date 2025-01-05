import mockFs from 'mock-fs'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { generateSymlinkUninstallScript } from './generateSymlinkUninstallScript'

describe('generateSymlinkUninstallScript', () => {
  beforeEach(() => {
    mockFs({
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/aircraft/example-ac': {},
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/aircraft/example-ac2': {},
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/Scripts/example.lua': '-- A Lua File'
    })
  })

  afterEach(() => {
    mockFs.restore()
  })

  it('should return the script for a single folder', async () => {
    const items = ['C:/Users/jonat/Saved Games/DCS.openbeta/Mods/aircraft/example-ac']
    const result = await generateSymlinkUninstallScript(items)
    expect(result).toMatchInlineSnapshot(
      `"rmdir /s /q "C:\\Users\\jonat\\Saved Games\\DCS.openbeta\\Mods\\aircraft\\example-ac""`
    )
  })

  it('should return the script for a single file', async () => {
    const items = ['C:/Users/jonat/Saved Games/DCS.openbeta/Mods/Scripts/example.lua']
    const result = await generateSymlinkUninstallScript(items)
    expect(result).toMatchInlineSnapshot(
      `"del /f /q "C:\\Users\\jonat\\Saved Games\\DCS.openbeta\\Mods\\Scripts\\example.lua""`
    )
  })

  it('should return the script for multiple items', async () => {
    const items = [
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/aircraft/example-ac',
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/aircraft/example-ac2',
      'C:/Users/jonat/Saved Games/DCS.openbeta/Mods/Scripts/example.lua'
    ]
    const result = await generateSymlinkUninstallScript(items)
    expect(result).toMatchInlineSnapshot(`
        "rmdir /s /q "C:\\Users\\jonat\\Saved Games\\DCS.openbeta\\Mods\\aircraft\\example-ac"
        rmdir /s /q "C:\\Users\\jonat\\Saved Games\\DCS.openbeta\\Mods\\aircraft\\example-ac2"
        del /f /q "C:\\Users\\jonat\\Saved Games\\DCS.openbeta\\Mods\\Scripts\\example.lua""
      `)
  })

  it('should return the script for an empty list', async () => {
    const items: string[] = []
    const result = await generateSymlinkUninstallScript(items)
    expect(result).toMatchInlineSnapshot(`""`)
  })
})
