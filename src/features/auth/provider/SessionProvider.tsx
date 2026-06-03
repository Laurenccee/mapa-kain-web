import { createClient } from "@/lib/supabase/server";
import AuthProvider from "./AuthProvider";

export default async function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let store = null;

  if (user) {
    const [profileRes, storeRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("stores").select("*").eq("owner_id", user.id).single(),
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
