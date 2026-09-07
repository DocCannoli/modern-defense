import { defineConfig } from 'vite';

export default defineConfig({
  base: '/modern-defense/',
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
