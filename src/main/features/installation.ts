import { join } from 'path'
import { dialog } from 'electron'
import { pathExistsSync } from 'fs-extra'
import { trpc } from '../trpc'
import Downloader from 'nodejs-file-downloader';
import { z } from 'zod'
import { EntryInstallMap } from '../../client';

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
      onProgress: function (percentage) {
        console.log(`${installMap.name}: ${percentage}%`);
      },
    }));

    try {
      const reports = await Promise.all(downloads.map(x => x.download()))
      return reports.map(x => x.filePath || "");
    } catch (error) {
      console.log(error);
      return [""]
    }
  }
}

export const installationRouter = trpc.router({
  getWriteDir: trpc.procedure.query(installationService.getWriteDir),
  getDefaultWriteDir: trpc.procedure.query(installationService.getDefaultWriteDir),
  installMod: trpc.procedure.input(z.object({githubPage: z.string().url(), tag: z.string(), installMapArr: z.array(z.object({
    name: z.string(),
    target: z.string()
  }))})).query(({ input }) => installationService.installMod(input.githubPage, input.tag, input.installMapArr))
})
