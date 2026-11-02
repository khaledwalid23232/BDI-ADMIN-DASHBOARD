import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The emulator is shared state: run files one after another.
    fileParallelism: false,
    testTimeout: 15000,
  },
});
