let counter = 0;

// Deterministic-enough unique id for a local/mock backend. Swap for a
// real UUID (or server-issued id) when a backend lands.
export function createId(prefix: string): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}`;
}
