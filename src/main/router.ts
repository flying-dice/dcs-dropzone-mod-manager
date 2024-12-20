import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager, SubscriptionWithState } from './manager/subscription.manager'
import { SettingsService } from './services/settings.service'
import { FsService } from './services/fs.service'
import { RegistryService } from './services/registry.service'
import { app as electronApp } from 'electron/main'
import { WriteDirectoryService } from './services/write-directory.service'
import { bootstrap } from './app'
import { readFile } from 'fs-extra'
import { filename, fileTransport } from './logging'
import { Logger } from '@nestjs/common'

export const trpc = initTRPC.create()

export async function getAppWithRouter() {
  const app = await bootstrap()

  return {
    app,
    router: trpc.router({
      setLoggerLevel: trpc.procedure
        .input(z.object({ level: z.string() }))
        .mutation(({ input }) => {
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
        return process.argv
          .find((arg) => arg.startsWith('dropzone://'))
          ?.replace('dropzone://', '/')
      }),
      // Enable/Disable Toggle
      toggleMod: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(LifecycleManager).toggleMod(input.modId)
        ),
      getModAssets: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .query(
          async ({
            input
          }): Promise<{ id: string; source: string; symlinkPath: string | null }[]> =>
            app.get(LifecycleManager).getModAssets(input.modId)
        ),
      openAssetInExplorer: trpc.procedure
        .input(z.object({ assetId: z.string() }))
        .mutation(
          ({ input }): Promise<void> => app.get(LifecycleManager).openAssetInExplorer(input.assetId)
        ),

      // Subscriptions
      getAllSubscriptions: trpc.procedure.query(
        async (): Promise<SubscriptionWithState[]> =>
          app.get(SubscriptionManager).getAllSubscriptions()
      ),
      subscribe: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(SubscriptionManager).subscribe(input.modId)
        ),
      unsubscribe: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(SubscriptionManager).unsubscribe(input.modId)
        ),
      update: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(SubscriptionManager).update(input.modId)
        ),
      openWriteDirInExplorer: trpc.procedure.mutation(
        async ({}): Promise<void> =>
          app.get(FsService).openFolder(await app.get(WriteDirectoryService).getWriteDirectory())
      ),
      openInExplorer: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> =>
            app.get(SubscriptionManager).openInExplorer(input.modId)
        ),

      // Settings
      currentVersion: trpc.procedure.query(async (): Promise<string> => electronApp.getVersion()),

      askFolder: trpc.procedure
        .input(z.object({ default: z.string() }))
        .query(
          async ({ input }): Promise<Electron.OpenDialogReturnValue | undefined> =>
            app.get(FsService).askFolder(input.default)
        ),

      getConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .query(
          async ({ input }): Promise<{ value: string } | undefined> =>
            app.get(SettingsService).getSettingValue(input.name)
        ),

      setConfigValue: trpc.procedure
        .input(z.object({ name: z.string(), value: z.string() }))
        .mutation(
          async ({ input }): Promise<void> =>
            app.get(SettingsService).setSettingValue(input.name, input.value)
        ),

      clearConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(SettingsService).clearSettingValue(input.name)
        ),

      getDefaultWriteDir: trpc.procedure.query(
        async (): Promise<string> => app.get(SettingsManager).getDefaultWriteDir()
      ),
      getDefaultGameDir: trpc.procedure.query(
        async (): Promise<string | undefined> => app.get(SettingsManager).getDefaultGameDir()
      ),
      getDefaultRegistryUrl: trpc.procedure.query(
        async (): Promise<string> => app.get(SettingsManager).getDefaultRegistryUrl()
      ),

      getRegistryUrl: trpc.procedure.query(
        async (): Promise<string> => app.get(SettingsManager).getRegistryUrl()
      ),
      runExe: trpc.procedure
        .input(z.object({ modId: z.string(), exePath: z.string() }))
        .mutation(
          ({ input }): Promise<void> => app.get(LifecycleManager).runExe(input.modId, input.exePath)
        ),

      getRegistryIndex: trpc.procedure.query(() => app.get(RegistryService).getRegistryIndex()),
      getRegistryEntry: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .query(({ input }) => app.get(RegistryService).getRegistryEntryIndex(input.modId))
    })
  }
}
