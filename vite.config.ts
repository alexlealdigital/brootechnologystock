import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  root: './stock-control-complete',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './stock-control-complete/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: '../dist',
    sourcemap: false,
    minify: 'terser',
    emptyOutDir: true,
  },
})
