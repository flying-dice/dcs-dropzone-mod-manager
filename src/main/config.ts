import { basename, join } from 'node:path'
import { app } from 'electron'
import { Logger } from '@nestjs/common'
import { DEFAULT_RCLONE_URL, DEFAULT_REGISTRY_URL } from './constants'
import { findInstalledDcsWriteDir } from './functions/findInstalledDcsWriteDir'
import { z } from 'zod'

const mainConfigSchema = z.object({
  tempDir: z.string(),
  writeDir: z.string(),
  defaultRegistryUrl: z.string(),
  appDataName: z.string(),
  defaultDcsWriteDir: z.string().optional(),
  toolsDir: z.string(),
  logfile: z.string(),
  logfileDisplayName: z.string().optional(),
  mongo: z.object({
    port: z.number(),
    dbPath: z.string()
  }),
  rcloneInstance: z.object({
    baseURL: z.string()
  })
})

export type MainConfig = z.infer<typeof mainConfigSchema>

export async function configuration(): Promise<MainConfig> {
  const appDataName = basename(app.getPath('userData'))

  const logfile = join(app.getPath('logs'), 'main.log')
  const logfileDisplayName = join(app.getPath('logs'), 'main.log').replace(
    app.getPath('home'),
    '%USERPROFILE%'
  )

  const tempDir = join(app.getPath('temp'), appDataName)
  const writeDir = join(process.env.LOCALAPPDATA || app.getPath('userData'), 'dcs-dropzone')
  const toolsDir = writeDir

  Logger.log(tempDir, 'tempDir')
  Logger.log(writeDir, 'writeDir')
  Logger.log(toolsDir, 'toolsDir')
  Logger.log(appDataName, 'appDataName')
  Logger.log(logfile, 'logfile')

  const defaultDcsWriteDir = findInstalledDcsWriteDir()

  const config: MainConfig = {
    defaultRegistryUrl: DEFAULT_REGISTRY_URL,
    tempDir,
    writeDir,
    toolsDir,
    appDataName,
    logfile,
    logfileDisplayName,
    defaultDcsWriteDir,
    rcloneInstance: {
      baseURL: DEFAULT_RCLONE_URL
    },
    mongo: {
      port: 57449,
      dbPath: join(app.getPath('userData'), '__data')
    }
  }

  return mainConfigSchema.parse(config)
}
