import { inferAsyncReturnType } from '@trpc/server'
import { getAppRouter } from './router'

declare global {
  type AppRouter = inferAsyncReturnType<typeof getAppRouter>
}
