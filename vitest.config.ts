// vitest.config.ts
import { defineConfig } from 'vitest/config'
import { swcPlugin } from 'electron-vite'

export default defineConfig({
  plugins: [swcPlugin()],
  test: {
    globals: true,
    include: ['src/main/**/*.test.ts'],
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/main/**/*.ts'],
      reporter: ['text', 'json-summary', 'json', 'cobertura', 'html'],
      reportOnFailure: true,
      thresholds: {
        statements: 30,
        branches: 70,
        functions: 70,
        lines: 30
      }
    }
  }
})
