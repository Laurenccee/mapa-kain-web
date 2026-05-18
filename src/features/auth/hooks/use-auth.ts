'use client';

import { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within SessionProvider');
  }

  return {
    ...context,
    isLoading: false,
    isAuthenticated: !!context.user,
    hasProfile: !!context.profile,
    hasEstablishment: !!context.establishment,

    userId: context.user?.id,

    profile: context.profile,
    establishment: context.establishment,
  };
}
