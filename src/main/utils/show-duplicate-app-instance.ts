import { dialog } from 'electron'

const title = 'Application Already Running'
const message = `\
It looks like DCS Dropzone is already running. Please switch to the open instance to continue using the app.

If you believe this message is a mistake, try closing the current instance, waiting 30s and reopening the app.
`

export function showDuplicateAppInstance() {
  dialog.showErrorBox(title, message)
}
