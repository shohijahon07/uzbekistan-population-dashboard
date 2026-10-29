import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev rejimida /api so'rovlari Node.js mock serverga (5000-port) proksi qilinadi.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
