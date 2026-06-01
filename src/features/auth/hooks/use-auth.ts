"use client";

import { useContext } from "react";
import { AuthContext } from "../provider/AuthProvider";

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within SessionProvider");
  }

  return {
    ...context,
    isLoading: false,
    isAuthenticated: !!context.user,
    hasProfile: !!context.profile,
    hasStore: !!context.store,

    userId: context.user?.id,

    profile: context.profile,
    store: context.store,
  };
}
