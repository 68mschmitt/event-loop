import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
    },
  },
  resolve: {
    alias: {
      '@/core': resolve(__dirname, './src/core'),
      '@/state': resolve(__dirname, './src/state'),
      '@/ui': resolve(__dirname, './src/ui'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
});
