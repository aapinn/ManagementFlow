import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    devSourcemap: true,
    lightningcss: {
      targets: {
        safari: (15 << 16) | (0 << 8),
        ios_saf: (15 << 16) | (0 << 8),
        chrome: 90 << 16,
        firefox: 90 << 16,
      },
    },
  },
  build: {
    cssCodeSplit: false,
    cssTarget: ['safari15', 'chrome90'],
  },
})
