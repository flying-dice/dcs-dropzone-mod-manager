import { initTRPC } from '@trpc/server'
import { z } from 'zod'
import { config } from './config'
import { getDefaultGameDir } from './functions/getDefaultGameDir'
import { getDefaultWriteDir } from './functions/getDefaultWriteDir'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager, SubscriptionWithState } from './manager/subscription.manager'
import { ConfigService } from './services/config.service'
import { FsService } from './services/fs.service'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { RegistryService } from './services/registry.service'
import { app as electronApp } from 'electron/main'

export const trpc = initTRPC.create()

export async function getAppWithRouter() {
  const app = await NestFactory.createApplicationContext(AppModule, config.appOptions)

  return {
    app,
    router: trpc.router({
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
            app.get(ConfigService).getConfigValue(input.name)
        ),

      setConfigValue: trpc.procedure
        .input(z.object({ name: z.string(), value: z.string() }))
        .mutation(
          async ({ input }): Promise<void> =>
            app.get(ConfigService).setConfigValue(input.name, input.value)
        ),

      clearConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .mutation(
          async ({ input }): Promise<void> => app.get(ConfigService).clearConfigValue(input.name)
        ),

      getDefaultWriteDir: trpc.procedure.query(async (): Promise<string> => getDefaultWriteDir()),
      getDefaultGameDir: trpc.procedure.query(
        async (): Promise<string | undefined> => getDefaultGameDir()
      ),
      getDefaultRegistryUrl: trpc.procedure.query(
        async (): Promise<string> => config.defaultRegistryUrl
      ),

      getWriteDir: trpc.procedure.query(
        async (): Promise<string> => app.get(SettingsManager).getWriteDir()
      ),
      getGameDir: trpc.procedure.query(
        async (): Promise<string> => app.get(SettingsManager).getGameDir()
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
