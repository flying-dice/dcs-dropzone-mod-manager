import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin, swcPlugin } from 'electron-vite'
import swc from 'unplugin-swc'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      swcPlugin(),
      swc.vite({
        tsconfigFile: './tsconfig.node.json'
      })
    ]
  },
  preload: {
    plugins: [externalizeDepsPlugin(), swcPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()]
  }
})
