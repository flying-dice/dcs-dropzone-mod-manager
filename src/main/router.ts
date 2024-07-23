import { z } from 'zod'
import { trpc } from './trpc'
import { bootstrap } from './app'
import { ConfigService } from './services/config.service'
import { UpdateManager } from './manager/update.manager'
import { SubscriptionManager } from './manager/subscription.manager'
import { SettingsManager } from './manager/settings.manager'
import { FsService } from './services/fs.service'
import { getDefaultGameDir } from './functions/getDefaultGameDir'
import { getDefaultWriteDir } from './functions/getDefaultWriteDir'
import { LifecycleManager } from './manager/lifecycle-manager.service'

export async function getAppWithRouter() {
  const app = await bootstrap()

  return {
    app,
    router: trpc.router({
      // Enable/Disable Toggle
      toggleMod: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(async ({ input }) => app.get(LifecycleManager).toggleMod(input.modId)),
      getModAssets: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .query(async ({ input }) => app.get(LifecycleManager).getModAssets(input.modId)),
      openAssetInExplorer: trpc.procedure
        .input(z.object({ assetId: z.number() }))
        .mutation(({ input }) => app.get(LifecycleManager).openAssetInExplorer(input.assetId)),

      // Subscriptions
      getAllSubscriptions: trpc.procedure.query(async () =>
        app.get(SubscriptionManager).getAllSubscriptions()
      ),
      getSubscriptionRelease: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .query(async ({ input }) =>
          app.get(SubscriptionManager).getSubscriptionReleaseState(input.modId)
        ),
      subscribe: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(async ({ input }) => app.get(SubscriptionManager).subscribe(input.modId)),
      unsubscribe: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(async ({ input }) => app.get(SubscriptionManager).unsubscribe(input.modId)),
      openInExplorer: trpc.procedure
        .input(z.object({ modId: z.string() }))
        .mutation(async ({ input }) => app.get(SubscriptionManager).openInExplorer(input.modId)),

      // Settings
      checkForUpdates: trpc.procedure.query(async () => app.get(UpdateManager).checkForUpdates()),
      quitAndInstall: trpc.procedure.query(async () => app.get(UpdateManager).quitAndInstall()),

      askFolder: trpc.procedure
        .input(z.object({ default: z.string() }))
        .query(async ({ input }) => app.get(FsService).askFolder(input.default)),

      getConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .query(async ({ input }) => app.get(ConfigService).getConfigValue(input.name)),

      setConfigValue: trpc.procedure
        .input(z.object({ name: z.string(), value: z.string() }))
        .mutation(async ({ input }) =>
          app.get(ConfigService).setConfigValue(input.name, input.value)
        ),

      clearConfigValue: trpc.procedure
        .input(z.object({ name: z.string() }))
        .mutation(async ({ input }) => app.get(ConfigService).clearConfigValue(input.name)),

      getDefaultWriteDir: trpc.procedure.query(async () => getDefaultWriteDir()),
      getDefaultGameDir: trpc.procedure.query(async () => getDefaultGameDir()),

      getWriteDir: trpc.procedure.query(async () => app.get(SettingsManager).getWriteDir()),
      getGameDir: trpc.procedure.query(async () => app.get(SettingsManager).getGameDir()),
      getRegistryUrl: trpc.procedure.query(async () => app.get(SettingsManager).getRegistryUrl())
    })
  }
}
