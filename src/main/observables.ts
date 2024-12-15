import { BehaviorSubject } from 'rxjs'

export const deepLink$ = new BehaviorSubject<string | undefined>(
  process.argv.find((arg) => arg.startsWith('dropzone://'))
)
