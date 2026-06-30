import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2020',
    cssMinify: 'lightningcss',
    // Menaikkan batas warning dari 500kB ke 1500kB biar gak bawel
    chunkSizeWarningLimit: 1500,
    rolldownOptions: {
      output: {
        // Otomatis memecah library di node_modules jadi file terpisah
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        },
      },
    },
  },
})

