// Shared cache tag so claim-mutating actions can invalidate the cached
// claimed-buildings list without importing the query module directly.
export const CLAIMED_STORES_TAG = "claimed-stores";
