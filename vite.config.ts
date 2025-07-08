import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'CNAME',
          dest: '.',
        },
        {
          src: 'dist/index.html',
          dest: '.',
          rename: '404.html'
        }
      ]
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: ["clover.nickrucinski.com"], // Allow your domain
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});