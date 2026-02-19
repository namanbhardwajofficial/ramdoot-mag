import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/componets'),
  '@/lib': path.resolve(__dirname, 'lib')
    }
  },
  server: {
    port: 3000,
  },
});
