import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,                        // ✅ allow access from outside (0.0.0.0)
    allowedHosts: ['.ngrok-free.app'], // ✅ allow ngrok subdomains
    port: 5173                         // (optional) ensure fixed port
  }
})
