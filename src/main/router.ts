import { installationRouter } from './features/installation'
import { trpc } from './trpc'
import { authRouter } from './features/gh-auth'

export const appRouter = trpc.router({
  installation: installationRouter,
  auth: authRouter
})
