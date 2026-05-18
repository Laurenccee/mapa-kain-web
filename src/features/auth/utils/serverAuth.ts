// features/auth/utils/server-auth.ts
import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

/**
 * Reusable helper to get the authenticated user on the server side.
 * Works perfectly in Layouts, Pages, Route Handlers, and Server Actions.
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error fetching user on server:', error);
    return null;
  }
}

/**
 * Enforces authentication on Server Pages/Layouts.
 * Throws a hard error which cleanly redirects to the nearest Next.js error boundary.
 */
export async function requireServerUser(): Promise<User> {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Unauthorized access');
  }
  return user;
}

/**
 * Enforces authentication inside Server Actions.
 * Returns a standardized payload so the client form UI can show an alert instead of crashing.
 */
export async function guardServerAction(): Promise<
  | { user: User; error: null }
  | { user: null; error: { success: false; error: string } }
> {
  const user = await getServerUser();

  if (!user) {
    return {
      user: null,
      error: {
        success: false,
        error: 'Your session has expired. Please log in again.',
      },
    };
  }

  return { user, error: null };
}
