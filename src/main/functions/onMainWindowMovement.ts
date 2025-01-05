import { BrowserWindow } from 'electron'

export function onBrowserWindowMovement(
  window: BrowserWindow,
  saveWindowPosition: ({}: {
    width: number
    height: number
    x: number
    y: number
    maximized: boolean
  }) => Promise<any>
) {
  return async function () {
    const [width, height] = window.getSize()
    const [x, y] = window.getPosition()
    const maximized = window.isMaximized()
    await saveWindowPosition({ width, height, x, y, maximized })
  }
}
