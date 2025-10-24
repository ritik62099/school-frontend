// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://school-api-gd9l.onrender.com/', // ← no trailing spaces!
        // target: 'http://localhost:5000', // ← no trailing spaces!
        changeOrigin: true,
        secure: false,
      }
    }
  }
});