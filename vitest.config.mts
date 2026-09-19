import { defineConfig } from 'vitest/config';

// Tests cover the pure service layer (src/services) — no React Native, no
// device. Services only touch the in-memory `db`, so plain Node is enough.
export default defineConfig({
  // React Native injects this global; a few data files read it.
  define: { __DEV__: false },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: ['./vitest.setup.ts'],
  },
});
