import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: '/',
  server: {
    proxy: {
      // 开发时将 /api/* 转发到 wrangler pages dev (端口 8788)
      // 需要同时运行 npm run dev 和 npm run dev:full
      '/api': 'http://localhost:8788',
    },
  },
})