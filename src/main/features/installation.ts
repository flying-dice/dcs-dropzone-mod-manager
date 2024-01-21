import { join } from 'path'
import { dialog } from 'electron'
import { pathExistsSync } from 'fs-extra'
import { trpc } from '../trpc'
import { z } from 'zod'
import { EntryInstallMap, EntryInstallMapSchema, EntryInstallState } from '../../client';
import fs from "fs";
import workerpool from  'workerpool'
import { getInstalledFilePath, getSymlinkFilePath } from '../utils'


const fileInstallStatus = {} //is this a dumb in memory download status why yes it is!


const getInstallState = async (modId: string, installMapArr: EntryInstallMap[]): Promise<EntryInstallState> => {
  const installBasePath = await installationService.getDefaultWriteDir();
  const saveGameBasePath = await installationService.getDefaultSaveGameDir();
  const installStates = installMapArr.map(x => ({name:x.name, installed: fs.existsSync(getInstalledFilePath(modId, installBasePath.path, x))}))
  const linkStates = installMapArr.map(x => ({name:x.name, installed: fs.existsSync(getSymlinkFilePath(saveGameBasePath.path, x))}))

  return {
    installed: installStates.some(x => x.installed),
    installedVersion: "1", // TODO: actually check somehow
    incomplete: installStates.every(x => !x.installed),
    missingFiles: installStates.filter(x => !x.installed).map(x => x.name),
    enabled: linkStates.some(x => x.installed),
  }
}

const pool = workerpool.pool('./src/main/workers/installMod.js');

export const installationService = {
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
    const defaultPath = await installationService.getDefaultSaveGameDir()
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
    const defaultPath = await installationService.getDefaultWriteDir()
    return await dialog
      .showOpenDialog({
        defaultPath: defaultPath?.path,
        properties: ['openDirectory']
      })
      .then((it) => it.filePaths[0])
  },
  async installMod(modId: string, githubPage: string, tag: string, installMapArr: EntryInstallMap[]) {
    const installBasePath = await installationService.getDefaultWriteDir();
    installMapArr.map((installMap: EntryInstallMap) => {
      const stateKey = `${modId}-${installMap.name}`
      fileInstallStatus[stateKey] = "preparing"
      pool.exec('downloadAndUnzip', [modId, githubPage, tag, installMap, installBasePath.path], {
      on: (payload: any) => {
        fileInstallStatus[stateKey] = payload.status
      }
    }).catch(err => {
      console.error(err)
      fileInstallStatus[stateKey] = err;
    })
  });
  },
  async uninstallMod(modId: string, installMapArr: EntryInstallMap[]): Promise<EntryInstallState> {
    const installBasePath = await installationService.getDefaultWriteDir();
    installMapArr.forEach(x => {
      fs.rmSync(getInstalledFilePath(modId, installBasePath.path, x), { recursive: true, force: true })
    })
    return await getInstallState(modId, installMapArr);
  },
  getInstallProgress(): Record<string, string> {
    return fileInstallStatus
  },
  clearProgress() {
    Object.keys(fileInstallStatus).filter(x => fileInstallStatus[x].endsWith("Complete")).forEach(key => delete fileInstallStatus[key])
  },
  getInstallState,
  async enableMod(modId: string, installMapArr: EntryInstallMap[]): Promise<EntryInstallState> {
    const installBasePath = await installationService.getDefaultWriteDir();
    const saveGameBasePath = await installationService.getDefaultSaveGameDir();
    installMapArr.forEach(x => {
        const installedFilePath = getInstalledFilePath(modId, installBasePath.path, x);
        const symlinkFilePath = getSymlinkFilePath(saveGameBasePath.path, x)
        fs.symlinkSync(installedFilePath, symlinkFilePath, fs.statSync(installedFilePath).isFile() ? 'file':'dir')
    })
    return await getInstallState(modId, installMapArr);
  },
  async disableMod(modId: string, installMapArr: EntryInstallMap[]): Promise<EntryInstallState> {
    const saveGameBasePath = await installationService.getDefaultSaveGameDir();
    installMapArr.forEach(x => {
        fs.unlinkSync(getSymlinkFilePath(saveGameBasePath.path, x))
    })
    return await getInstallState(modId, installMapArr);
  }
}



export const installationRouter = trpc.router({
  getWriteDir: trpc.procedure.query(installationService.getWriteDir),
  getDefaultWriteDir: trpc.procedure.query(installationService.getDefaultWriteDir),
  getDefaultSaveGameDir: trpc.procedure.query(installationService.getDefaultSaveGameDir),
  getInstallState: trpc.procedure.input(z.object({modId: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.getInstallState(input.modId, input.installMapArr)),
  getInstallProgress: trpc.procedure.query(installationService.getInstallProgress),
  clearProgress: trpc.procedure.query(installationService.clearProgress),
  installMod: trpc.procedure.input(z.object({modId: z.string(), githubPage: z.string().url(), tag: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.installMod(input.modId, input.githubPage, input.tag, input.installMapArr)),
  uninstallMod: trpc.procedure.input(z.object({modId: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.uninstallMod(input.modId, input.installMapArr)),
  enableMod: trpc.procedure.input(z.object({modId: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.enableMod(input.modId, input.installMapArr)),
  disableMod: trpc.procedure.input(z.object({modId: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.disableMod(input.modId, input.installMapArr)),
})
