import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
    },
  },
  resolve: {
    alias: {
      '@/core': resolve(__dirname, './src/core'),
      '@/ui': resolve(__dirname, './src/ui'),
      '@/utils': resolve(__dirname, './src/utils'),
    },
  },
});
