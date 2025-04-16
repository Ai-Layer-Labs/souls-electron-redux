import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    build: {
      target: 'esnext',
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
        '@services': path.join(__dirname, 'services')
      },
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    server: {
      proxy: {
        '/api': 'http://localhost:8000',
      }
    }
  }
})
