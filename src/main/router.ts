import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager, SubscriptionWithState } from './manager/subscription.manager'
import { SettingsService } from './services/settings.service'
import { FsService } from './services/fs.service'
import { RegistryService } from './services/registry.service'
import { WriteDirectoryService } from './services/write-directory.service'
import { readFile } from 'fs-extra'
import { filename, fileTransport } from './logging'
import { Logger } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { app } from 'electron'
import { MissionScriptingStatusCode } from '../lib/mission-scripting'
import { DcsMissionScriptingService } from './services/dcs-mission-scripting.service'

export const trpc = initTRPC.create()

export function getAppRouter(moduleRef: ModuleRef) {
  return trpc.router({
    setLoggerLevel: trpc.procedure.input(z.object({ level: z.string() })).mutation(({ input }) => {
      fileTransport.level = input.level
    }),
    getLoggerLevel: trpc.procedure.query(() => {
      return fileTransport.level
    }),
    getLogs: trpc.procedure
      .input(z.object({ previousRows: z.number(), logLevel: z.array(z.string()) }))
      .query(async ({ input }) => {
        Logger.flush()
        const content = await readFile(filename, 'utf-8')
          .then((it) => it.split('\n'))
          .then((it) =>
            it.filter((it) => input.logLevel.some((level) => it.includes(`[${level}]`)))
          )

        return content.slice(-input.previousRows).join('\n')
      }),
    getDeepLinkArg: trpc.procedure.query(() => {
      return process.argv.find((arg) => arg.startsWith('dropzone://'))?.replace('dropzone://', '/')
    }),
    // Enable/Disable Toggle
    toggleMod: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .mutation(
        async ({ input }): Promise<void> => moduleRef.get(LifecycleManager).toggleMod(input.modId)
      ),
    getModAssets: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .query(
        async ({ input }): Promise<{ id: string; source: string; symlinkPath: string | null }[]> =>
          moduleRef.get(LifecycleManager).getModAssets(input.modId)
      ),
    openAssetInExplorer: trpc.procedure
      .input(z.object({ assetId: z.string() }))
      .mutation(
        ({ input }): Promise<void> =>
          moduleRef.get(LifecycleManager).openAssetInExplorer(input.assetId)
      ),

    // Subscriptions
    getAllSubscriptions: trpc.procedure.query(
      async (): Promise<SubscriptionWithState[]> =>
        moduleRef.get(SubscriptionManager).getAllSubscriptions()
    ),
    subscribe: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SubscriptionManager).subscribe(input.modId)
      ),
    unsubscribe: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SubscriptionManager).unsubscribe(input.modId)
      ),
    update: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .mutation(
        async ({ input }): Promise<void> => moduleRef.get(SubscriptionManager).update(input.modId)
      ),
    openWriteDirInExplorer: trpc.procedure.mutation(
      async ({}): Promise<void> =>
        moduleRef
          .get(FsService)
          .openFolder(await moduleRef.get(WriteDirectoryService).getWriteDirectory())
    ),
    openInExplorer: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SubscriptionManager).openInExplorer(input.modId)
      ),

    // Settings
    currentVersion: trpc.procedure.query(async (): Promise<string> => app.getVersion()),

    askFolder: trpc.procedure
      .input(z.object({ default: z.string() }))
      .query(
        async ({ input }): Promise<Electron.OpenDialogReturnValue | undefined> =>
          moduleRef.get(FsService).askFolder(input.default)
      ),

    getConfigValue: trpc.procedure
      .input(z.object({ name: z.string() }))
      .query(
        async ({ input }): Promise<{ value: string } | undefined> =>
          moduleRef.get(SettingsService).getSettingValue(input.name)
      ),

    setConfigValue: trpc.procedure
      .input(z.object({ name: z.string(), value: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SettingsService).setSettingValue(input.name, input.value)
      ),

    clearConfigValue: trpc.procedure
      .input(z.object({ name: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SettingsService).clearSettingValue(input.name)
      ),

    getDefaultWriteDir: trpc.procedure.query(
      async (): Promise<string> => moduleRef.get(SettingsManager).getDefaultWriteDir()
    ),
    getDefaultGameDir: trpc.procedure.query(
      async (): Promise<string | undefined> => moduleRef.get(SettingsManager).getDefaultGameDir()
    ),
    getDefaultRegistryUrl: trpc.procedure.query(
      async (): Promise<string> => moduleRef.get(SettingsManager).getDefaultRegistryUrl()
    ),
    getDcsInstallationDirectory: trpc.procedure.query(
      async (): Promise<string | undefined> =>
        moduleRef.get(SettingsManager).getDcsInstallationDirectory()
    ),
    setDcsInstallationDirectory: trpc.procedure
      .input(z.object({ path: z.string() }))
      .mutation(
        async ({ input }): Promise<void> =>
          moduleRef.get(SettingsManager).setDcsInstallationDirectory(input.path)
      ),
    validateMissionScripting: trpc.procedure.query(
      async (): Promise<{ content: string; status: MissionScriptingStatusCode }> => {
        return moduleRef.get(DcsMissionScriptingService).validate()
      }
    ),
    getNewMissionScriptingFile: trpc.procedure.query(async () => {
      return moduleRef.get(DcsMissionScriptingService).getUpdated()
    }),
    applyNewMissionScriptingFile: trpc.procedure.mutation(async () => {
      return moduleRef.get(DcsMissionScriptingService).applyUpdated()
    }),

    getRegistryUrl: trpc.procedure.query(
      async (): Promise<string> => moduleRef.get(SettingsManager).getRegistryUrl()
    ),
    runExe: trpc.procedure
      .input(z.object({ modId: z.string(), exePath: z.string() }))
      .mutation(
        ({ input }): Promise<void> =>
          moduleRef.get(LifecycleManager).runExe(input.modId, input.exePath)
      ),

    getRegistryIndex: trpc.procedure.query(() => moduleRef.get(RegistryService).getRegistryIndex()),
    getRegistryEntry: trpc.procedure
      .input(z.object({ modId: z.string() }))
      .query(({ input }) => moduleRef.get(RegistryService).getRegistryEntryIndex(input.modId))
  })
}
