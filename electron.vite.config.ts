import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  main: {
    plugins: [
      dts({
        include: ['src/main/**/*.ts'],
        outDir: 'dist',
        rollupTypes: true,
      }),
    ],
    build: {
      externalizeDeps: true,
      minify: 'esbuild',
      lib: {
        entry: resolve(import.meta.dirname, 'src/main/index.ts'),
        formats: ['es'],
        fileName: () => 'index.js',
      },
      outDir: 'dist',
      rollupOptions: {
        external: ['electron', '@devraghu/cashdrawer'],
      },
    },
  },
  preload: {
    build: {
      externalizeDeps: {
        exclude: ['fs', 'path'],
      },
      minify: 'esbuild',
      outDir: 'dist/preload',
      lib: {
        entry: resolve(import.meta.dirname, 'src/preload/preload.ts'),
        formats: ['cjs'],
        fileName: () => 'preload.cjs',
      },
      rollupOptions: {
        external: ['electron'],
      },
    },
  },
  renderer: {
    root: 'src/renderer',
    build: {
      minify: 'esbuild',
      outDir: resolve(import.meta.dirname, 'dist/renderer'),
      rollupOptions: {
        input: resolve(import.meta.dirname, 'src/renderer/index.html'),
      },
    },
  },
});
