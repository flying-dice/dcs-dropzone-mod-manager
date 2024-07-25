import { vi } from 'vitest'

vi.mock('electron', () => ({
  app: {
    getPath: (path) => `C:\\TEST\\${path}`
  }
}))
