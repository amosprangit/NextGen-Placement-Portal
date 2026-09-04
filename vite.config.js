import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Lets a relative "/api" baseURL (used in production behind a reverse
    // proxy) also work during `npm run dev`, without needing VITE_API_URL
    // set locally. If VITE_API_URL IS set in .env, it takes priority over
    // this proxy entirely (see src/lib/api.js).
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
