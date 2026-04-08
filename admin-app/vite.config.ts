import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3001 },
  preview: {
    host: '0.0.0.0',
    port: parseInt(process.env.PORT || '8080'),
    allowedHosts: true,
  },
})
