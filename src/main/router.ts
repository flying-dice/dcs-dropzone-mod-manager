import { installationRouter } from './features/installation'
import { trpc } from './trpc'
import { authRouter } from './features/gh-auth'
import { updaterRouter } from './features/updater'

export const appRouter = trpc.router({
  installation: installationRouter,
  auth: authRouter,
  updater: updaterRouter
})
