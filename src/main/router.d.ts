import { inferAsyncReturnType } from "@trpc/server"
import { getAppWithRouter } from "./router"

declare global {
  type AppRouter = inferAsyncReturnType<typeof getAppWithRouter>['router']
}

