import { resolve } from 'node:path'
import { stat } from 'fs-extra'

export async function getUninstallLineForPath(path: string): Promise<string> {
  const p = resolve(path)
  const isFolder = await stat(p).then((it) => it.isDirectory())
  if (isFolder) {
    return `rmdir /s /q "${p}"`
  } else {
    return `del /f /q "${p}"`
  }
}
