import { getAppWithRouter } from './main/router'
import { inferAsyncReturnType } from '@trpc/server'

export type TaskState = 'Pending' | 'In Progress' | 'Completed' | 'Failed'

export type AppRouter = inferAsyncReturnType<typeof getAppWithRouter>['router']
