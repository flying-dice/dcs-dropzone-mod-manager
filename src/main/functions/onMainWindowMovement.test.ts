import { describe, it, expect, vi } from 'vitest'
import { BrowserWindow } from 'electron'
import { onBrowserWindowMovement } from './onMainWindowMovement'
import { Store } from '../utils/store'

describe('onBrowserWindowMovement', () => {
  it('stores window size and position when window is moved', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([800, 600]),
      getPosition: vi.fn().mockReturnValue([100, 100]),
      isMaximized: vi.fn().mockReturnValue(false)
    } as unknown as BrowserWindow

    const mockStore = {
      set: vi.fn(),
      write: vi.fn().mockResolvedValue(undefined)
    } as unknown as Store<number>

    const handler = onBrowserWindowMovement(mockWindow, mockStore)
    await handler()

    expect(mockStore.set).toHaveBeenCalledWith('width', 800)
    expect(mockStore.set).toHaveBeenCalledWith('height', 600)
    expect(mockStore.set).toHaveBeenCalledWith('x', 100)
    expect(mockStore.set).toHaveBeenCalledWith('y', 100)
    expect(mockStore.set).toHaveBeenCalledWith('maximized', 0)
    expect(mockStore.write).toHaveBeenCalled()
  })

  it('stores maximized state when window is maximized', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([800, 600]),
      getPosition: vi.fn().mockReturnValue([100, 100]),
      isMaximized: vi.fn().mockReturnValue(true)
    } as unknown as BrowserWindow

    const mockStore = {
      set: vi.fn(),
      write: vi.fn().mockResolvedValue(undefined)
    } as unknown as Store<number>

    const handler = onBrowserWindowMovement(mockWindow, mockStore)
    await handler()

    expect(mockStore.set).toHaveBeenCalledWith('maximized', 1)
  })

  it('handles errors during store write', async () => {
    const mockWindow = {
      getSize: vi.fn().mockReturnValue([800, 600]),
      getPosition: vi.fn().mockReturnValue([100, 100]),
      isMaximized: vi.fn().mockReturnValue(false)
    } as unknown as BrowserWindow

    const mockStore = {
      set: vi.fn(),
      write: vi.fn().mockRejectedValue(new Error('Write failed'))
    } as unknown as Store<number>

    const handler = onBrowserWindowMovement(mockWindow, mockStore)
    await expect(handler()).rejects.toThrow('Write failed')
  })
})
