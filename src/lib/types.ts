import { inferAsyncReturnType } from '@trpc/server'
import { getAppWithRouter } from '../main/router'

export type TaskState = 'Pending' | 'In Progress' | 'Completed' | 'Failed'

export type AppRouter = inferAsyncReturnType<typeof getAppWithRouter>['router']
