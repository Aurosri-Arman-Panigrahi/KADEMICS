// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react(), basicSsl()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    // Rapier WASM must be excluded from pre-bundling
    exclude: ['@dimforge/rapier3d-compat'],
    include: [
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-spring/three',
      'gsap',
      'zustand',
    ],
  },
  build: {
    target: 'esnext',
    // WASM support for Rapier physics
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'xr-vendor': ['@react-three/xr'],
          'animation-vendor': ['gsap', 'framer-motion', '@react-spring/three'],
          'ui-vendor': ['recharts', 'lucide-react', 'zustand'],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    // Required headers for WebXR WASM (SharedArrayBuffer, etc.)
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
  },
});
