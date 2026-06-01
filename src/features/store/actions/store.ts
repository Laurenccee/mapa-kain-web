"use server";

import { createClient } from "@/lib/supabase/server";
import {
  RegisterStoreData,
  RegisterStoreSchema,
} from "../schemas/storeSchemas";
import { guardServerAction } from "@/features/auth/utils/serverAuth";

export async function registerStoreAction(values: RegisterStoreData) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (authError) {
    return {
      success: false,
      message: authError.error || "Authentication error. Please log in again.",
    };
  }

  const validatedFields = RegisterStoreSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation error. Please check your input.",
      errors: validatedFields.error?.format(),
    };
  }

  try {
    const { error: storeError } = await supabase.from("stores").insert({
      owner_id: user.id,
      name: values.name,
      open_time: values.openTime,
      close_time: values.closeTime,
      description: values.description,
      building_id: values.buildingId,
    });

    if (storeError) {
      if (storeError.code === "23505") {
        return {
          success: false,
          message:
            "A store with this name already exists. Please choose another name.",
        };
      }
      throw storeError;
    }
  } catch (error) {
    return {
      success: false,
      message:
        (error as Error).message ||
        "An unexpected error occurred. Please try again.",
    };
  }
}
