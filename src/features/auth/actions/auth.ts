'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import {
  ForgetPasswordData,
  SignInData,
  SignInSchema,
  SignUpData,
  SignUpSchema,
} from '../schemas/authSchema';

export async function signInAction(values: SignInData) {
  const validatedFields = SignInSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    if (error.message === 'Email not confirmed') {
      await supabase.auth.resend({
        type: 'signup',
        email: validatedFields.data.email,
      });
      return {
        success: false,
        message:
          'Your email is not verified. A new verification link has been sent to your inbox.',
      };
    }
    return { success: false, message: error.message };
  }

  if (!validatedFields.data.rememberMe) {
    const cookieStore = await cookies();
    cookieStore
      .getAll()
      .filter((c) => c.name.startsWith('sb-'))
      .forEach((c) => {
        cookieStore.set(c.name, c.value, {
          path: '/',
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
      });
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signUpAction(values: SignUpData) {
  const validatedFields = SignUpSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: 'Please fill in all required fields.' };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: validatedFields.data.email,
    password: validatedFields.data.password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOutAction() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function forgetPasswordAction(values: ForgetPasswordData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${process.env.SITE_URL}/reset-password`,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function resendVerificationEmailAction(email: string) {
  const supabase = await createClient();
  // Supabase v2+ uses 'resend' for confirmation emails
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  });
  if (error) {
    return { success: false, message: error.message };
  }
  return { success: true };
}
