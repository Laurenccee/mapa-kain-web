import { createClient } from "@/lib/supabase/server";
import AuthProvider from "./AuthProvider";
import type { AuthProfile, AuthStore } from "../types";

export default async function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: AuthProfile | null = null;
  let store: AuthStore | null = null;

  if (user) {
    const [profileRes, storeRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url, is_onboarded, created_at")
        .eq("id", user.id)
        .single(),
      supabase
        .from("stores")
        .select("id, name, description")
        .eq("owner_id", user.id)
        .single(),
    ]);

    profile = profileRes.data;
    store = storeRes.data;
  }

  return (
    <AuthProvider initialData={{ user, profile, store }}>
      {children}
    </AuthProvider>
  );
}
