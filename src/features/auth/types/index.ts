import type { User } from "@supabase/supabase-js";

// Mirrors the exact columns selected in SessionProvider/AuthProvider, not the full DB rows.
export interface AuthProfile {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  is_onboarded: boolean;
  created_at: string;
}

export interface AuthStore {
  id: string;
  name: string;
  description: string | null;
}

export type AuthState = {
  user: User | null;
  profile: AuthProfile | null;
  store: AuthStore | null;
};

export type AuthContextType = AuthState & {
  user_id: string | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  hasStore: boolean;
};

export interface AuthFormProps {
  mode: "sign-in" | "sign-up";
  action: (
    data: any,
  ) => Promise<{ success: boolean; message?: string } | undefined | void>;
  onSuccessRoute: string;
  successMessage: string;
  errorMessage: string;
}
