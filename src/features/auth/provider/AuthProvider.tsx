'use client';

import { createContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthState } from '../types';

export const AuthContext = createContext<AuthState | undefined>(undefined);

export default function AuthProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: AuthState;
}) {
  const [state, setState] = useState<AuthState>(initialData);
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        setState({
          user: null,
          profile: null,
          establishment: null,
        });
      }
      // If signed in or token refreshed, we reload to let the Server Provider
      // re-fetch the Profile/Establishment data for security.
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
