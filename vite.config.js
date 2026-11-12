import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev server meneruskan /api ke backend FastAPI (main.py).
// Endpoint asli: GET /status dan POST /comment.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
