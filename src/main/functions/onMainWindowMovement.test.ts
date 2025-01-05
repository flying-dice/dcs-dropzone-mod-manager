import { describe, it, expect, vi } from 'vitest'
import { BrowserWindow } from 'electron'
import { onBrowserWindowMovement } from './onMainWindowMovement'

describe('onBrowserWindowMovement', () => {
  it('saves window position and size correctly', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([1024, 768]),
      getPosition: vi.fn().mockReturnValue([200, 150]),
      isMaximized: vi.fn().mockReturnValue(false)
    } as unknown as BrowserWindow

    const saveWindowPosition = vi.fn().mockResolvedValue(undefined)

    const handler = onBrowserWindowMovement(mockWindow, saveWindowPosition)
    await handler()

    expect(saveWindowPosition).toHaveBeenCalledWith({
      width: 1024,
      height: 768,
      x: 200,
      y: 150,
      maximized: false
    })
  })

  it('saves maximized state correctly', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([1024, 768]),
      getPosition: vi.fn().mockReturnValue([200, 150]),
      isMaximized: vi.fn().mockReturnValue(true)
    } as unknown as BrowserWindow

    const saveWindowPosition = vi.fn().mockResolvedValue(undefined)

    const handler = onBrowserWindowMovement(mockWindow, saveWindowPosition)
    await handler()

    expect(saveWindowPosition).toHaveBeenCalledWith({
      width: 1024,
      height: 768,
      x: 200,
      y: 150,
      maximized: true
    })
  })

  it('handles errors during saveWindowPosition call', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([1024, 768]),
      getPosition: vi.fn().mockReturnValue([200, 150]),
      isMaximized: vi.fn().mockReturnValue(false)
    } as unknown as BrowserWindow

    const saveWindowPosition = vi.fn().mockRejectedValue(new Error('Save failed'))

    const handler = onBrowserWindowMovement(mockWindow, saveWindowPosition)
    await expect(handler()).rejects.toThrow('Save failed')
  })
})
