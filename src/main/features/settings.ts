import { join } from 'path'
import { dialog } from 'electron'
import { pathExistsSync } from 'fs-extra'
import { trpc } from '../trpc'


export const settingsService = {
  async getDefaultSaveGameDir(): Promise<{ path: string; valid: boolean }> {
    if (!process.env.USERPROFILE) {
      return {
        path: '',
        valid: false
      }
    }

    const defaultPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS')
    const defaultOBPath = join(process.env.USERPROFILE, 'Saved Games', 'DCS.openbeta')

    const paths = [defaultPath, defaultOBPath]

    const validPath = paths.find((it) => pathExistsSync(it))

    if (validPath) {
      return {
        path: validPath,
        valid: true
      }
    }
    return {
      path: defaultPath,
      valid: false
    }
  },
  async getSaveGameDir(): Promise<string> {
    const defaultPath = await settingsService.getDefaultSaveGameDir()
    return await dialog
      .showOpenDialog({
        defaultPath: defaultPath?.path,
        properties: ['openDirectory']
      })
      .then((it) => it.filePaths[0])
  },
  async getDefaultWriteDir(): Promise<{ path: string; valid: boolean }> {
    if (!process.env.USERPROFILE) {
      return {
        path: '',
        valid: false
      }
    }
  
    const defaultPath = join(process.env.USERPROFILE, 'Saved Games' ,'Dropzone', 'Mods')
  
    return {
      path: defaultPath,
      valid: pathExistsSync(defaultPath)
    }

  },
  async getWriteDir(): Promise<string> {
    const defaultPath = await settingsService.getDefaultWriteDir()
    return await dialog
      .showOpenDialog({
        defaultPath: defaultPath?.path,
        properties: ['openDirectory']
      })
      .then((it) => it.filePaths[0])
  },
}



export const settingsRouter = trpc.router({
  getWriteDir: trpc.procedure.query(settingsService.getWriteDir),
  getDefaultWriteDir: trpc.procedure.query(settingsService.getDefaultWriteDir),
  getDefaultSaveGameDir: trpc.procedure.query(settingsService.getDefaultSaveGameDir),
})
