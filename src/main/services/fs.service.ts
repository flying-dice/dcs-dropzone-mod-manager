import { Injectable } from '@nestjs/common'
import { app, dialog, OpenDialogReturnValue, shell } from 'electron'
import { join } from 'path'
import { config } from '../../config'
import { pathExistsSync } from 'fs-extra'
import { expandPathWithEnvars } from '../functions/expandPathWithEnvars'

@Injectable()
export class FsService {
  async askFolder(defaultPath: string): Promise<OpenDialogReturnValue | undefined> {
    return dialog.showOpenDialog({
      message: 'Select a folder',
      defaultPath: expandPathWithEnvars(defaultPath),
      properties: ['openDirectory']
    })
  }

  getDefaultWriteDir(): string {
    return join(process.env.LOCALAPPDATA || app.getPath('userData'), config.appDataName, 'mods')
  }

  getDefaultGameDir(): string | undefined {
    if (!process.env.USERPROFILE) {
      return undefined
    }

    const defaultPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS')
    const defaultOBPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS.openbeta')

    const paths = [defaultPath, defaultOBPath]

    return paths.find((it) => pathExistsSync(it))
  }

  async openFolder(p: string) {
    await shell.openPath(p)
  }
}
