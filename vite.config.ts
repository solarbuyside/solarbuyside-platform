import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Otimizações de produção
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // Chunking strategy para melhor caching
        manualChunks: {
          react: ['react', 'react-dom'],
          lucide: ['lucide-react'],
        },
      },
    },
    // Relatório de tamanho do build
    reportCompressedSize: true,
    // Análise do build
    sourcemap: false, // Desabilitar sourcemaps em produção (segurança)
  },
  server: {
    // Dev server
    port: 5173,
    open: true,
  },
})
