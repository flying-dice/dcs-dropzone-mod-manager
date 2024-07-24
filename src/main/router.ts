import { initTRPC } from '@trpc/server'
import { UpdateCheckResult } from 'electron-updater'
import { z } from 'zod'
import { TaskState } from '../lib/types'
import { bootstrap } from './app'
import { config } from './config'
import { SubscriptionEntity } from './entities/subscription.entity'
import { getDefaultGameDir } from './functions/getDefaultGameDir'
import { getDefaultWriteDir } from './functions/getDefaultWriteDir'
import { LifecycleManager } from './manager/lifecycle-manager.service'
import { SettingsManager } from './manager/settings.manager'
import { SubscriptionManager } from './manager/subscription.manager'
import { UpdateManager } from './manager/update.manager'
import { ConfigService } from './services/config.service'
import { FsService } from './services/fs.service'

export const trpc = initTRPC.create()

export async function getAppWithRouter() {
  const app = await bootstrap()

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
          }): Promise<{ id: number; source: string; symlinkPath: string | null }[]> =>
            app.get(LifecycleManager).getModAssets(input.modId)
        ),
      openAssetInExplorer: trpc.procedure
        .input(z.object({ assetId: z.number() }))
        .mutation(
          ({ input }): Promise<void> => app.get(LifecycleManager).openAssetInExplorer(input.assetId)
        ),

      // Subscriptions
      getAllSubscriptions: trpc.procedure.query(
        async (): Promise<SubscriptionEntity[]> =>
          app.get(SubscriptionManager).getAllSubscriptions()
      ),
      getSubscriptionRelease: trpc.procedure.input(z.object({ modId: z.string() })).query(
        async ({
          input
        }): Promise<
          | {
              enabled: boolean
              version: string
              status: TaskState
              progress: number
              label?: string | undefined
            }
          | undefined
        > => app.get(SubscriptionManager).getSubscriptionReleaseState(input.modId)
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
      openInExplorer: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(
          async ({ input }): Promise<void> =>
            app.get(SubscriptionManager).openInExplorer(input.modId)
        ),

      // Settings
      checkForUpdates: trpc.procedure.query(
        async (): Promise<UpdateCheckResult | undefined> => app.get(UpdateManager).checkForUpdates()
      ),
      quitAndInstall: trpc.procedure.query(
        async (): Promise<void> => app.get(UpdateManager).quitAndInstall()
      ),

      askFolder: trpc.procedure
        .input(z.object({ default: z.string() }))
        .query(
          async ({ input }): Promise<Electron.OpenDialogReturnValue | undefined> =>
            app.get(FsService).askFolder(input.default)
        ),

      getConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .query(
          async ({ input }): Promise<{ value: string; lastModified: number } | undefined> =>
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
      )
    })
  }
}
