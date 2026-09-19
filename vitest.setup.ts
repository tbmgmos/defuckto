import { vi } from 'vitest';

// Services await `delay()` to imitate network latency. Tests don't need the
// wait, so resolve immediately; everything else in localDatabase (including
// the shared `db` object) stays real.
vi.mock('./src/services/localDatabase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./src/services/localDatabase')>();
  return { ...actual, delay: <T>(value: T) => Promise.resolve(value) };
});
