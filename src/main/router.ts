import { installationRouter } from './features/installation'
import { trpc } from './trpc'
import { authRouter } from './features/gh-auth'
import { updaterRouter } from './features/updater'
import { settingsRouter } from './features/settings'

export const appRouter = trpc.router({
  installation: installationRouter,
  settings: settingsRouter,
  auth: authRouter,
  updater: updaterRouter
})
