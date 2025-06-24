import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cards': 'http://localhost:5000',
      '/card': 'http://localhost:5000',
      '/analyze': 'http://localhost:5000',
    }
  }
})
