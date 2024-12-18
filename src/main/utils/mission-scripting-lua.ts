import { ensureDir, readFile } from 'fs-extra'
import { verifyExistsBefore } from './verifyExistsBefore'
import writeFileAtomic from 'write-file-atomic'
import { dirname } from 'node:path'

export class MissionScriptingLua {
  static readonly SANITIZE_START_LINE = '--Sanitize Mission Scripting environment'
  static readonly DOFILE_SCRIPTING_SYSTEM = `dofile('Scripts/ScriptingSystem.lua')`

  get content(): string {
    return this.fileContent
  }

  get abspath(): string {
    return this.path
  }

  constructor(
    private path: string,
    private fileContent: string
  ) {}

  includesLine(line: string): boolean {
    return this.fileContent
      .split('\n')
      .map((it) => it.trim())
      .includes(line.trim())
  }

  includesBefore(line: string, before: string): boolean {
    return verifyExistsBefore(this.fileContent, line, before)
  }

  addAfter(line: string, after: string): void {
    const lines = this.fileContent.split('\n').map((it) => it.trim())
    const index = lines.indexOf(after.trim())

    if (index === -1) {
      throw new Error(`Line ${after} not found in content`)
    }

    lines.splice(index + 1, 0, line)
    this.fileContent = lines.join('\n')
  }

  async write(): Promise<void> {
    await ensureDir(dirname(this.path))
    await writeFileAtomic(this.path, this.fileContent)
  }

  static async fromFile(abspath: string): Promise<MissionScriptingLua> {
    const content = await readFile(abspath, 'utf-8')

    return new MissionScriptingLua(abspath, content)
  }
}
