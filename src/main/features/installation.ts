import { join } from 'path'
import { dialog } from 'electron'
import { pathExistsSync } from 'fs-extra'
import { trpc } from '../trpc'
import Downloader from 'nodejs-file-downloader';
import { z } from 'zod'
import { EntryInstallMap, EntryInstallMapSchema, EntryInstallState } from '../../client';
import fs from "fs";
import unzipper from  'unzipper'


const fileInstallStatus = {} //is this a dumb in memory download status why yes it is!

const getInstalledFilePath = (basePath:string, installMap: EntryInstallMap): string => {
  const namedPath =  join(basePath, installMap.target, installMap.name.replace(".zip", ""));
  if(!installMap.zipPath) return namedPath
  var terminalFolder = installMap.zipPath.split("/").pop()
  if(!terminalFolder) return namedPath
  return join(basePath, installMap.target, terminalFolder)
}

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
  async installMod(githubPage: string, tag: string, installMapArr: EntryInstallMap[]): Promise<string[]> {
    const installBasePath = await installationService.getDefaultWriteDir();
    const downloads = installMapArr.map((installMap: EntryInstallMap) => new Downloader({
      url: join(githubPage, "releases","download", tag, installMap.name),
      directory: join(installBasePath.path, installMap.target),
      onProgress: function (percentage: string) {
        fileInstallStatus[`${githubPage}-${installMap.name}`] = `${percentage}%`
      },
    }));

    try {
      const reports = await Promise.all(downloads.map(x => x.download())) // TODO: Refactor block into single download & unzip promise

      // Update all unzip states
      installMapArr.filter(x => x.name.endsWith(".zip")).map((installMap: EntryInstallMap) => fileInstallStatus[join(githubPage, installMap.name)] = "Unpacking")

      const unzipList = installMapArr.filter(x => x.name?.endsWith(".zip"))
      await Promise.all(unzipList.map(x => fs.createReadStream(join(installBasePath.path, x.target, x.name)) 
      .pipe(unzipper.Extract({ path: join(installBasePath.path, x.target, x.name.replace(".zip", ""))})) // this is dumb as rocks don't like it would be nice if I could get a subset
      .promise()))
      unzipList.forEach(x => fs.rmSync(join(installBasePath.path, x.target, x.name),  { recursive: true, force: true }))
      installMapArr.filter(x => x.zipPath).forEach(x => {
        if(!x.zipPath) return
        fs.renameSync(join(installBasePath.path, x.target, x.name.replace(".zip", ""), x.zipPath), getInstalledFilePath(installBasePath.path, x))
        fs.rmSync(join(installBasePath.path, x.target, x.name.replace(".zip", "")),  { recursive: true, force: true })
      })
      // Remove file install statuses
      installMapArr.map((installMap: EntryInstallMap) => delete fileInstallStatus[join(githubPage, installMap.name)])

      return reports.map(x => x.filePath || "");
    } catch (error) {
      // TODO: proper error handling
      console.error(error);
      return [""]
    }
  },
  async uninstallMod(installMapArr: EntryInstallMap[]): Promise<EntryInstallState> {
    const installBasePath = await installationService.getDefaultWriteDir();
    installMapArr.forEach(x => {
      fs.rmSync(getInstalledFilePath(installBasePath.path, x), { recursive: true, force: true })
    }) // IS this really uninstalling will the OS free count it as free space?
    return await getInstallState(installMapArr);
  },
  getInstallProgress(githubPage: string): string[] {
    const result =  Object.keys(fileInstallStatus).filter(x => x.startsWith(githubPage)).map(x => fileInstallStatus[x])
    return result
  },
  getInstallState
}



export const installationRouter = trpc.router({
  getWriteDir: trpc.procedure.query(installationService.getWriteDir),
  getDefaultWriteDir: trpc.procedure.query(installationService.getDefaultWriteDir),
  getInstallState: trpc.procedure.input(EntryInstallMapSchema).query(({ input }) => installationService.getInstallState(input)),
  getInstallProgress: trpc.procedure.input(z.object({githubPage: z.string().url()})).query(({ input }) => installationService.getInstallProgress(input.githubPage)),
  installMod: trpc.procedure.input(z.object({githubPage: z.string().url(), tag: z.string(), installMapArr: EntryInstallMapSchema})).query(({ input }) => installationService.installMod(input.githubPage, input.tag, input.installMapArr)),
  uninstallMod: trpc.procedure.input(EntryInstallMapSchema).query(({ input }) => installationService.uninstallMod(input)),
})
