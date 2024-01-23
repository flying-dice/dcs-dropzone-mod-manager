import { trpc } from '../trpc'
import { z } from 'zod'
import { EntryInstallMap, EntryInstallMapSchema, EntryInstallState } from '../../client';
import fs from "fs";
import workerpool from  'workerpool'
import { getInstalledFilePath, getSymlinkFilePath } from '../utils'


const fileInstallStatus = {} //is this a dumb in memory download status why yes it is!
const baseEntrySchema = z.object({modId: z.string(), installMapArr: EntryInstallMapSchema, writeDirPath: z.string(), saveDirPath: z.string()})

const getInstallState = async (modId: string, installMapArr: EntryInstallMap[],  writeDirPath: string, saveDirPath: string): Promise<EntryInstallState> => {
  const installStates = installMapArr.map(x => ({name:x.name, installed: fs.existsSync(getInstalledFilePath(modId, writeDirPath, x))}))
  const linkStates = installMapArr.map(x => ({name:x.name, installed: fs.existsSync(getSymlinkFilePath(saveDirPath, x))}))

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
  async installMod(modId: string, githubPage: string, tag: string, installMapArr: EntryInstallMap[], writeDirPath: string) {
    installMapArr.map((installMap: EntryInstallMap) => {
      const stateKey = `${modId}-${installMap.name}`
      fileInstallStatus[stateKey] = "preparing"
      pool.exec('downloadAndUnzip', [modId, githubPage, tag, installMap, writeDirPath], {
      on: (payload: any) => {
        fileInstallStatus[stateKey] = payload.status
      }
    }).catch(err => {
      console.error(err)
      fileInstallStatus[stateKey] = err;
    })
  });
  },
  async uninstallMod(modId: string, installMapArr: EntryInstallMap[], writeDirPath: string, saveDirPath: string): Promise<EntryInstallState> {
    installMapArr.forEach(x => {
      fs.rmSync(getInstalledFilePath(modId, writeDirPath, x), { recursive: true, force: true })
    })
    return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath);
  },
  getInstallProgress(): Record<string, string> {
    return fileInstallStatus
  },
  clearProgress() {
    Object.keys(fileInstallStatus).filter(x => fileInstallStatus[x].endsWith("Complete")).forEach(key => delete fileInstallStatus[key])
  },
  getInstallState,
  async enableMod(modId: string, installMapArr: EntryInstallMap[], writeDirPath: string, saveDirPath: string): Promise<EntryInstallState> {
    installMapArr.forEach((x) => {
        const installedFilePath = getInstalledFilePath(modId, writeDirPath, x);
        const symlinkFilePath = getSymlinkFilePath(saveDirPath, x)
        fs.symlinkSync(installedFilePath, symlinkFilePath, fs.statSync(installedFilePath).isFile() ? 'file':'junction')
    })
    return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath);
  },
  async disableMod(modId: string, installMapArr: EntryInstallMap[], writeDirPath: string, saveDirPath: string): Promise<EntryInstallState> {
    installMapArr.forEach(x => {
        fs.unlinkSync(getSymlinkFilePath(saveDirPath, x))
    })
    return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath);
  }
}



export const installationRouter = trpc.router({
  getInstallState: trpc.procedure.input(baseEntrySchema).query(({ input }) => installationService.getInstallState(input.modId, input.installMapArr, input.writeDirPath, input.saveDirPath)),
  getInstallProgress: trpc.procedure.query(installationService.getInstallProgress),
  clearProgress: trpc.procedure.query(installationService.clearProgress),
  installMod: trpc.procedure.input(z.object({modId: z.string(), githubPage: z.string().url(), tag: z.string(), installMapArr: EntryInstallMapSchema, writeDirPath: z.string()})).query(({ input }) => installationService.installMod(input.modId, input.githubPage, input.tag, input.installMapArr, input.writeDirPath)),
  uninstallMod: trpc.procedure.input(baseEntrySchema).query(({ input }) => installationService.uninstallMod(input.modId, input.installMapArr, input.writeDirPath, input.saveDirPath)),
  enableMod: trpc.procedure.input(baseEntrySchema).query(({ input }) => installationService.enableMod(input.modId, input.installMapArr, input.writeDirPath, input.saveDirPath)),
  disableMod: trpc.procedure.input(baseEntrySchema).query(({ input }) => installationService.disableMod(input.modId, input.installMapArr, input.writeDirPath, input.saveDirPath)),
})
