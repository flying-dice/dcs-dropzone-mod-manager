import { trpc } from '../trpc'
import { z } from 'zod'
import { EntryInstallMap, EntryInstallMapSchema, EntryInstallState } from '../../client'
import fs from 'fs'
import fsp from 'fs/promises'
import workerpool from 'workerpool'
import { getInstalledFilePath, getSymlinkFilePath } from '../utils'
import { join } from 'path'

export type installWorkerMessage = {
  status: string
}


const fileInstallStatus = {} //is this a dumb in memory download status why yes it is!
const baseEntrySchema = z.object({
  modId: z.string(),
  installMapArr: EntryInstallMapSchema,
  writeDirPath: z.string(),
  saveDirPath: z.string()
})

const getInstallState = async (
  modId: string,
  installMapArr: EntryInstallMap[],
  writeDirPath: string,
  saveDirPath: string
): Promise<EntryInstallState> => {
  const installStates = installMapArr.map((x) => ({
    name: getInstalledFilePath(modId, writeDirPath, x),
    installed: fs.existsSync(getInstalledFilePath(modId, writeDirPath, x))
  }))
  const linkStates = installMapArr.map((x) => ({
    enabled: fs.existsSync(getSymlinkFilePath(saveDirPath, x))
  }))

  return {
    installed: installStates.some((x) => x.installed),
    installedVersion: '1', // TODO: actually check somehow
    incomplete: installStates.every((x) => !x.installed),
    missingFiles: installStates.filter((x) => !x.installed).map((x) => x.name),
    enabled: linkStates.some((x) => x.enabled)
  }
}

const enableMod = async (
  modId: string,
  installMapArr: EntryInstallMap[],
  writeDirPath: string,
  saveDirPath: string
): Promise<EntryInstallState> => {
  await Promise.all(
    installMapArr.map(async (x) => {
      const installedFilePath = getInstalledFilePath(modId, writeDirPath, x)
      const symlinkFilePath = getSymlinkFilePath(saveDirPath, x)
      const fileStats = await fsp.stat(installedFilePath)
      return fsp.symlink(
        installedFilePath,
        symlinkFilePath,
        fileStats.isFile() ? 'file' : 'junction'
      )
    })
  )
  return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath)
}

const disableMod = async (
  modId: string,
  installMapArr: EntryInstallMap[],
  writeDirPath: string,
  saveDirPath: string
): Promise<EntryInstallState> => {
  await Promise.all(
    installMapArr.map(async (x) => {
      return fsp.unlink(getSymlinkFilePath(saveDirPath, x))
    })
  )
  return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath)
}

const pool = workerpool.pool('./src/main/workers/installMod.js')

export const installationService = {
  async installMod(modId: string, installMapArr: EntryInstallMap[], writeDirPath: string) {
    const aggInstallMaps = {}
    installMapArr.forEach((installMap: EntryInstallMap) => {
      const key = installMap.source.split('/#/')[0]
      if (!aggInstallMaps[key]) {
        aggInstallMaps[key] = []
      }
      aggInstallMaps[key].push(installMap)
    })
    Object.keys(aggInstallMaps).map((key: string, idx) => {
      const installArr = aggInstallMaps[key]
      const stateKey = `${modId}${idx > 0 ? idx + 1 : ''}`
      fileInstallStatus[stateKey] = 'preparing'
      pool
        .exec('downloadAndUnzip', [modId, key, installArr, writeDirPath], {
          on: (payload: installWorkerMessage) => {
            fileInstallStatus[stateKey] = payload.status
          }
        })
        .catch((err) => {
          console.error(err)
          fileInstallStatus[stateKey] = err
        })
    })
  },
  async uninstallMod(
    modId: string,
    installMapArr: EntryInstallMap[],
    writeDirPath: string,
    saveDirPath: string
  ): Promise<EntryInstallState> {
    try {
      await disableMod(modId, installMapArr, writeDirPath, saveDirPath)
    } catch (e) {
      console.error('Failed to disable mod', e)
    }

    await fsp.rm(join(writeDirPath, modId), {
      recursive: true,
      force: true
    })

    return await getInstallState(modId, installMapArr, writeDirPath, saveDirPath)
  },
  getInstallProgress(): Record<string, string> {
    return fileInstallStatus
  },
  clearProgress() {
    Object.keys(fileInstallStatus)
      .filter((x) => fileInstallStatus[x].endsWith('Complete'))
      .forEach((key) => delete fileInstallStatus[key])
  },
  getInstallState,
  enableMod,
  disableMod
}

export const installationRouter = trpc.router({
  getInstallState: trpc.procedure
    .input(baseEntrySchema)
    .query(({ input }) =>
      installationService.getInstallState(
        input.modId,
        input.installMapArr,
        input.writeDirPath,
        input.saveDirPath
      )
    ),
  getInstallProgress: trpc.procedure.query(installationService.getInstallProgress),
  clearProgress: trpc.procedure.query(installationService.clearProgress),
  installMod: trpc.procedure
    .input(
      z.object({
        modId: z.string(),
        installMapArr: EntryInstallMapSchema,
        writeDirPath: z.string()
      })
    )
    .query(({ input }) =>
      installationService.installMod(input.modId, input.installMapArr, input.writeDirPath)
    ),
  uninstallMod: trpc.procedure
    .input(baseEntrySchema)
    .query(({ input }) =>
      installationService.uninstallMod(
        input.modId,
        input.installMapArr,
        input.writeDirPath,
        input.saveDirPath
      )
    ),
  enableMod: trpc.procedure
    .input(baseEntrySchema)
    .query(({ input }) =>
      installationService.enableMod(
        input.modId,
        input.installMapArr,
        input.writeDirPath,
        input.saveDirPath
      )
    ),
  disableMod: trpc.procedure
    .input(baseEntrySchema)
    .query(({ input }) =>
      installationService.disableMod(
        input.modId,
        input.installMapArr,
        input.writeDirPath,
        input.saveDirPath
      )
    )
})
