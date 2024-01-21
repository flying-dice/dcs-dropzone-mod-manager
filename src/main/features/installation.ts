import { join } from 'path'
import { dialog } from 'electron'
import { pathExistsSync } from 'fs-extra'
import { trpc } from '../trpc'
import { z } from 'zod'
import { EntryInstallMap, EntryInstallMapSchema, EntryInstallState } from '../../client';
import fs from "fs";
import workerpool from  'workerpool'
import { getInstalledFilePath } from '../utils'


const fileInstallStatus = {} //is this a dumb in memory download status why yes it is!


const getInstallState = async (installMapArr: EntryInstallMap[]): Promise<EntryInstallState> => {
  const installBasePath = await installationService.getDefaultWriteDir();
  const installStates = installMapArr.map(x => ({name:x.name, installed: fs.existsSync(getInstalledFilePath(installBasePath.path, x))}))

  return {
    installed: installStates.some(x => x.installed),
    installedVersion: "1", // TODO: actually check somehow
    incomplete: installStates.every(x => !x.installed),
    missingFiles: installStates.filter(x => !x.installed).map(x => x.name)
  }
}

const pool = workerpool.pool('./src/main/workers/installMod.js');

export const installationService = {
  async getDefaultWriteDir(): Promise<{ path: string; valid: boolean }> {
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
  async getWriteDir(): Promise<string> {
    const defaultPath = await installationService.getDefaultWriteDir()
    return await dialog
      .showOpenDialog({
        defaultPath: defaultPath?.path,
        properties: ['openDirectory']
      })
      .then((it) => it.filePaths[0])
  },
  async installMod(githubPage: string, tag: string, installMapArr: EntryInstallMap[]) {
    const installBasePath = await installationService.getDefaultWriteDir();
    installMapArr.map((installMap: EntryInstallMap) => {
      const stateKey = `${githubPage}-${installMap.name}`
      fileInstallStatus[stateKey] = "preparing"
      pool.exec('downloadAndUnzip', [githubPage, tag, installMap, installBasePath.path], {
      on: (payload: any) => {
        fileInstallStatus[stateKey] = payload.status
      }
    }).catch(err => {
      console.error(err)
      fileInstallStatus[stateKey] = err;
    })
  });
  },
  async uninstallMod(installMapArr: EntryInstallMap[]): Promise<EntryInstallState> {
    const installBasePath = await installationService.getDefaultWriteDir();
    installMapArr.forEach(x => {
      fs.rmSync(getInstalledFilePath(installBasePath.path, x), { recursive: true, force: true })
    })
    return await getInstallState(installMapArr);
  },
  getInstallProgress(): Record<string, string> {
    return fileInstallStatus
  },
  clearProgress() {
    Object.keys(fileInstallStatus).filter(x => fileInstallStatus[x].endsWith("Complete")).forEach(key => delete fileInstallStatus[key])
  },
  getInstallState
}



export const installationRouter = trpc.router({
  getWriteDir: trpc.procedure.query(installationService.getWriteDir),
  getDefaultWriteDir: trpc.procedure.query(installationService.getDefaultWriteDir),
  getInstallState: trpc.procedure.input(EntryInstallMapSchema).query(({ input }) => installationService.getInstallState(input)),
  getInstallProgress: trpc.procedure.query(installationService.getInstallProgress),
  clearProgress: trpc.procedure.query(installationService.clearProgress),
  installMod: trpc.procedure.input(z.object({githubPage: z.string().url(), tag: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.installMod(input.githubPage, input.tag, input.installMapArr)),
  uninstallMod: trpc.procedure.input(EntryInstallMapSchema).query(({ input }) => installationService.uninstallMod(input)),
})
