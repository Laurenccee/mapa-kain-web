import type { User } from '@supabase/supabase-js';

export type AuthState = {
  user: User | null;
  profile: any | null; // Replace 'any' with your Profile type
  establishment: any | null; // Replace 'any' with your Establishment type
};

export type AuthContextType = AuthState & {
  isLoading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  hasEstablishment: boolean;
};
