import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Ключ - это тот самый префикс, который вы придумываете
      '/api-games': {
        // 'target' - это адрес настоящего API, куда пойдут запросы
        target: 'https://api.thegamesdb.net',
        
        // 'changeOrigin: true' - это важная опция, которая помогает обходить проверки безопасности
        changeOrigin: true,
        
        // 'rewrite' - это функция, которая убирает ваш префикс из URL
        rewrite: (path) => path.replace(/^\/api-games/, ''),
      }
    }
  }
})
