"use client";

import {
  createContext,
  useEffect,
  useState,
  ReactNode,
  useRef,
  useMemo,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { AuthContextType, AuthState } from "../types";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

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

  useEffect(() => {
    setState(initialData);
    if (initialData.user) setIsLoading(false);
  }, [initialData]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
          if (session.user.id !== state.user?.id) {
            setIsLoading(true);

            const [profileRes, storeRes] = await Promise.all([
              supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single(),
              supabase
                .from("stores")
                .select("*")
                .eq("owner_id", session.user.id),
            ]);

            setState({
              user: session.user,
              profile: profileRes.data ?? null,
              store: storeRes.data ?? null,
            });
          } else if (!ssrDataConsumed.current) {
            ssrDataConsumed.current = true;
          }
        } else if (event === "SIGNED_OUT") {
          setState({
            user: null,
            profile: null,
            store: null,
          });
        }

        setIsLoading(false);
      },
    );

    return () => subscription.unsubscribe();
  }, [supabase, state.user?.id]);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      ...state,
      isLoading,
      user_id: state.user?.id,
      isAuthenticated: !!state.user,
      hasProfile: !!state.profile,
      hasStore: !!state.store,
    }),
    [state, isLoading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
