'use client';

import { createContext, useEffect, useState, ReactNode, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AuthState } from '../types';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export const AuthContext = createContext<AuthState | undefined>(undefined);

export default function AuthProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData: AuthState;
}) {
  const [state, setState] = useState<AuthState>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData.user);
  const supabase = createClient();

  const ssrDataConsumed = useRef(false);

  // Keeps the Client State in sync when Server Components push down a fresh layout tree
  useEffect(() => {
    setState(initialData);
    if (initialData.user) setIsLoading(false);
  }, [initialData]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          // If the user changed or it's a completely brand new session login
          if (session.user.id !== state.user?.id) {
            setIsLoading(true);

            // Fetch the missing custom database relationships asynchronously on the client layer
            const [profileRes, establishmentRes] = await Promise.all([
              supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single(),
              supabase
                .from('establishments')
                .select('*')
                .eq('owner_id', session.user.id)
                .single(),
            ]);

            setState({
              user: session.user,
              profile: profileRes.data ?? null,
              establishment: establishmentRes.data ?? null,
            });
          } else if (!ssrDataConsumed.current) {
            ssrDataConsumed.current = true;
          }
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            establishment: null,
          });
        }

        setIsLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase, state.user?.id]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
