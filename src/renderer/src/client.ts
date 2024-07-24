import { createTRPCProxyClient } from '@trpc/client'
import { ipcLink } from 'electron-trpc/renderer'
import type { AppRouter } from '../../lib/types'

export const client = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()]
})
