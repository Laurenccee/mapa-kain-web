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

    user: context.user,
    userId: context.user?.id,
  };
}
