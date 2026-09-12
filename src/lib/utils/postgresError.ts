import "server-only";
import type { PostgrestError } from "@supabase/supabase-js";

const POSTGRES_UNIQUE_VIOLATION = "23505";

/** True when a Postgres error is a unique-constraint (duplicate key) violation. */
export function isUniqueConstraintError(
  error: Pick<PostgrestError, "code"> | null | undefined,
): boolean {
  return error?.code === POSTGRES_UNIQUE_VIOLATION;
}
