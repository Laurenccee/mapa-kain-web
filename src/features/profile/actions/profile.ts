"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import { revalidatePath } from "next/cache";
import { guardServerAction } from "@/features/auth/utils/serverAuth";

export async function uploadAvatar(
  file: File,
  oldFilePath?: string | null,
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const { user } = await guardServerAction();
  const storagePath = `${user?.id}/avatar-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  if (oldFilePath) {
    const oldPath = oldFilePath.split("/").pop();
    if (oldPath) {
      await supabase.storage.from("avatars").remove([`${user?.id}/${oldPath}`]);
    }
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function deleteAvatar(path: string) {
  const supabase = await createClient();
  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return { success: false, message: "Authentication required." };
  }

  if (!path.startsWith(user.id)) {
    return { success: false, message: "Unauthorized access." };
  }

  const { error } = await supabase.storage.from("avatars").remove([path]);

  if (error) return { success: false, message: error.message };

  return { success: true };
}

export async function createProfile(values: ProfileSetupData) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return {
      success: false,
      message: authError.error || "Authentication error. Please log in again.",
    };
  }

  const validatedFields = ProfileSetupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Please fill in all required fields." };
  }

  try {
    const finalAvatarUrl =
      typeof values.avatar_url === "string" ? values.avatar_url : "";

    const { error: dbError } = await supabase.from("profiles").insert({
      id: user.id,
      full_name: values.full_name,
      username: values.username,
      phone_number: values.phone_number || null,
      avatar_url: finalAvatarUrl || null,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      if (dbError.code === "23505") {
        return { success: false, message: "This username is already taken." };
      }
      throw dbError;
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Profile successfully created!" };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || "An unexpected error occurred during profile setup.",
    };
  }
}

export async function editProfile(values: ProfileSetupData) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return {
      success: false,
      message: authError.error || "Authentication error. Please log in again.",
    };
  }

  const validatedFields = ProfileSetupSchema.safeParse(values);
  if (!validatedFields.success) {
    return { success: false, message: "Please fill in all required fields." };
  }

  try {
    const finalAvatarUrl =
      typeof values.avatar_url === "string" ? values.avatar_url : "";

    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        full_name: values.full_name,
        username: values.username,
        phone_number: values.phone_number || null,
        avatar_url: finalAvatarUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (dbError) {
      if (dbError.code === "23505") {
        return { success: false, message: "This username is already taken." };
      }
      throw dbError;
    }

    revalidatePath("/", "layout");
    return { success: true, message: "Profile successfully created!" };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || "An unexpected error occurred during profile setup.",
    };
  }
}
