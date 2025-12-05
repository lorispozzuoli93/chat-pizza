import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000', // L'indirizzo del backend
        changeOrigin: true,
        secure: false,
        // IMPORTANTE: Rimuove '/api' dall'URL finale inviato al backend
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});