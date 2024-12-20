import { BrowserWindow } from 'electron'
import { Store } from '../utils/store'

export function onBrowserWindowMovement(window: BrowserWindow, store: Store<number>) {
  return async function () {
    const [width, height] = window.getSize()
    const [x, y] = window.getPosition()
    const isMaximized = window.isMaximized()
    store.set('width', width)
    store.set('height', height)
    store.set('x', x)
    store.set('y', y)
    store.set('maximized', isMaximized ? 1 : 0)
    await store.write()
  }
}
