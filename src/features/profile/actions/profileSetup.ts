'use server';

import { createClient } from '@/lib/supabase/server';
import {
  ProfileSetupData,
  ProfileSetupSchema,
  UploadAvatarData,
  UploadAvatarSchema,
} from '../schemas/profileSchemas';
import { revalidatePath } from 'next/cache';
import { guardServerAction } from '@/features/auth/utils/serverAuth';

export async function uploadAvatar(input: UploadAvatarData): Promise<string> {
  const { userId, uri } = UploadAvatarSchema.parse(input);

  const urlPath = new URL(uri).pathname;
  const ext = urlPath.split('.').pop()?.toLowerCase() || 'jpg';
  const storagePath = `${userId}/avatar-${Date.now()}.${ext}`;

  const supabase = await createClient();

  const response = await fetch(uri);
  if (!response.ok) throw new Error('Failed to fetch image source');

  const blob = await response.blob();

  const { error } = await supabase.storage
    .from('avatars')
    .upload(storagePath, blob, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function createProfile(values: ProfileSetupData) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return {
      success: false,
      message: authError.error || 'Authentication error. Please log in again.',
    };
  }

  const validatedFields = ProfileSetupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  try {
    const finalAvatarUrl =
      typeof values.avatar_url === 'string' ? values.avatar_url : '';

    const { error: dbError } = await supabase.from('profiles').insert({
      id: user.id,
      full_name: values.full_name,
      username: values.username,
      phone_number: values.phone_number || null,
      avatar_url: finalAvatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      if (dbError.code === '23505') {
        return { success: false, message: 'This username is already taken.' };
      }
      throw dbError;
    }

    revalidatePath('/', 'layout');
    return { success: true, message: 'Profile successfully created!' };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || 'An unexpected error occurred during profile setup.',
    };
  }
}
