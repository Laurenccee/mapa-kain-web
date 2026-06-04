"use server";

import { createClient } from "@/lib/supabase/server";
import {
  ProfileSetupData,
  ProfileSetupSchema,
} from "../schemas/profileSchemas";
import { revalidatePath } from "next/cache";
import { guardServerAction } from "@/features/auth/utils/serverAuth";
import { PostgrestError } from "@supabase/supabase-js";

export async function deleteAvatar(path: string) {
  const supabase = await createClient();
  const { user, error: authError } = await guardServerAction();

  if (authError) return { success: false, message: "Authentication required." };
  if (!path.startsWith(user.id))
    return { success: false, message: "Unauthorized access." };

  const { error } = await supabase.storage.from("avatars").remove([path]);
  if (error) return { success: false, message: error.message };

  return { success: true };
}

async function prepareProfileMutation(values: ProfileSetupData) {
  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return {
      errorResponse: {
        success: false,
        message:
          authError.error || "Authentication error. Please log in again.",
      },
    };
  }

  const validatedFields = ProfileSetupSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      errorResponse: {
        success: false,
        message: "Please fill in all required fields.",
        errors: validatedFields.error.format(),
      },
    };
  }

  const finalAvatarUrl =
    typeof values.avatar_url === "string" ? values.avatar_url : "";

  return {
    user,
    payload: {
      full_name: values.full_name,
      username: values.username,
      phone_number: values.phone_number || null,
      avatar_url: finalAvatarUrl || null,
      updated_at: new Date().toISOString(),
    },
  };
}

async function executeProfileMutation(
  values: ProfileSetupData,
  successMessage: string,
  dbOperation: (
    supabase: any,
    user: any,
    payload: any,
  ) => Promise<{ error: PostgrestError | null }>,
) {
  const supabase = await createClient();
  const preparation = await prepareProfileMutation(values);

  if ("errorResponse" in preparation) return preparation.errorResponse;
  const { user, payload } = preparation;

  try {
    const { error: dbError } = await dbOperation(supabase, user, payload);

    if (dbError) {
      if (dbError.code === "23505") {
        return { success: false, message: "This username is already taken." };
      }
      throw dbError;
    }

    revalidatePath("/", "layout");
    return { success: true, message: successMessage };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message || "An unexpected error occurred during profile setup.",
    };
  }
}

export async function createProfile(values: ProfileSetupData) {
  return executeProfileMutation(
    values,
    "Profile successfully created!",
    (supabase, user, payload) =>
      supabase.from("profiles").insert({ id: user.id, ...payload }),
  );
}

export async function editProfile(values: ProfileSetupData) {
  return executeProfileMutation(
    values,
    "Profile successfully updated!",
    (supabase, user, payload) =>
      supabase.from("profiles").update(payload).eq("id", user.id),
  );
}
