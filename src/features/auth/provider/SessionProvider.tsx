import { createClient } from '@/lib/supabase/server';
import AuthProvider from './AuthProvider';

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
  let establishment = null;

  if (user) {
    const [profileRes, establishmentRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase
        .from('establishments')
        .select('*')
        .eq('owner_id', user.id)
        .single(),
    ]);

    profile = profileRes.data;
    establishment = establishmentRes.data;
  }

  const initialData = { user, profile, establishment };

  return <AuthProvider initialData={initialData}>{children}</AuthProvider>;
}
