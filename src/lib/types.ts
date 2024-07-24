import type { inferAsyncReturnType } from '@trpc/server'
import type { getAppWithRouter } from '../main/router'

export type TaskState = 'Pending' | 'In Progress' | 'Completed' | 'Failed'

export type AppRouter = inferAsyncReturnType<typeof getAppWithRouter>['router']
