// Short, non-cryptographic id generator — good enough for client-only local state.
export function generateId() {
  return Math.random().toString(36).slice(2, 9);
}
