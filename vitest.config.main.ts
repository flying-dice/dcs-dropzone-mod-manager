import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    swc.vite({
      tsconfigFile: './tsconfig.node.json'
    }) as any
  ],
  test: {
    setupFiles: ['./vitest.setup.ts'],
    globals: true
  }
})
