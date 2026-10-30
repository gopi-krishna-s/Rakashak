import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';
import electronRenderer from 'vite-plugin-electron-renderer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    electron([
      {
        // Main-process entry point of the Electron App.
        entry: 'electron/main.js',
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron', 'child_process', 'fs', 'path', 'os'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.js',
        onstart(options) {
          // Notify the Preload-Process to reload the page when the Preload-Scripts build is finished.
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
    electronRenderer(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './', // Important for HashRouter and Electron file:// protocol
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
