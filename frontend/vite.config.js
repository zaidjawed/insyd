import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/like': 'http://localhost:3000',
      '/notifications': 'http://localhost:3000',
    },
  },
});