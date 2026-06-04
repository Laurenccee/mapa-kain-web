import type { User } from "@supabase/supabase-js";

export type AuthState = {
  user: User | null;
  profile: any | null;
  store: any | null;
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
  schema: any;
  action: (
    data: any,
  ) => Promise<{ success: boolean; message?: string } | undefined | void>;
  onSuccessRoute: string;
  successMessage: string;
  errorMessage: string;
}
