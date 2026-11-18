import path from 'node:path';
import { defineConfig } from 'electron-vite';
import { dts } from 'rolldown-plugin-dts';

export default defineConfig({
  main: {
    plugins: [dts({ generator: 'tsgo' })],
    // Keep Vite's Oxc transform away from the generated declarations, otherwise
    // it strips them like regular TS. `exclude` replaces the defaults, so .js stays excluded too.
    oxc: {
      exclude: [/\.js$/u, /\.d\.[cm]?ts$/u],
    },
    build: {
      externalizeDeps: true,
      minify: 'oxc',
      lib: {
        entry: path.resolve(import.meta.dirname, 'src/main/index.ts'),
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
      minify: 'oxc',
      outDir: 'dist/preload',
      lib: {
        entry: path.resolve(import.meta.dirname, 'src/preload/preload.ts'),
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
      minify: 'oxc',
      outDir: path.resolve(import.meta.dirname, 'dist/renderer'),
      rollupOptions: {
        input: path.resolve(import.meta.dirname, 'src/renderer/index.html'),
      },
    },
  },
});
