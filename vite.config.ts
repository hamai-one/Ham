
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Menyuntikkan API_KEY dari environment variable ke process.env di browser secara aman
    'process.env.API_KEY': JSON.stringify("AIzaSyBn-B0qzWTBulHQvHNEtDhnPuqlSVUUAsE")
  },
  server: {
    port: 7860,
    host: '0.0.0.0'
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000
  }
});
