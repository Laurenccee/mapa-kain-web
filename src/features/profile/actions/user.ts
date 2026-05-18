'use server';

import { createClient } from '@/lib/supabase/server';

export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function fetchUserProfileAction(userId: string) {
  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new Error(error.message);

    const qrCodeUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/user/${userId}/${data.created_at}`;

    return { success: true, data: { qrCodeUrl } };
  } catch (error) {
    return { success: false, error: 'Failed to fetch' };
  }
}
