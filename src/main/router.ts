import { installationRouter } from './features/installation'
import { trpc } from './trpc'

export const appRouter = trpc.router({
  installation: installationRouter
})
