// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { swcPlugin } from 'electron-vite'

export default defineConfig({
  plugins: [swcPlugin()],
  test: {
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  }
})
