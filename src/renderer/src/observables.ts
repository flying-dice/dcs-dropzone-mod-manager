import { BehaviorSubject } from 'rxjs'
import { client } from './client'

export const deepLink$ = new BehaviorSubject<string | undefined>(
  await client.getDeepLinkArg.query()
)

window.electron.ipcRenderer.on('deep-link', (_event, message) => {
  deepLink$.next(message)
})
