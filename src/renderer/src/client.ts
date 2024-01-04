import { createTRPCProxyClient } from '@trpc/client'
import { ipcLink } from 'electron-trpc/renderer'
import { AppRouter } from '../../types'

export const client = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()]
})
