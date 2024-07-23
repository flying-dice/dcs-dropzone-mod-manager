import { getAppRouter } from './main/router'
import { z } from 'zod'
import { EntryIndex, EntryLatestRelease } from './client'
import { inferAsyncReturnType } from '@trpc/server'

export const EntryInstallMapSchema = z.array(
  z.object({
    source: z.string(),
    target: z.string()
  })
)

export type EntryInstallMap = z.infer<typeof EntryInstallMapSchema>

export interface EntryInstallState {
  installed: boolean
  installedVersion: string
  incomplete: boolean
  latestRelease: EntryLatestRelease
  entry: EntryIndex
  missingFiles: string[]
  enabled: boolean
}

export interface EachEntryInstallState {
  id: string
  installMapArr: EntryInstallMap
  installState: EntryInstallState
  version: string
}

export type TaskState = 'Pending' | 'In Progress' | 'Completed' | 'Failed'

export type AppRouter = inferAsyncReturnType<typeof getAppRouter>
