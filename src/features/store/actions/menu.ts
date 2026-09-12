"use server";

import { guardServerAction } from "@/features/auth/utils/serverAuth";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { PostgrestError } from "@supabase/supabase-js";
import { MenuData, MenuSchema } from "../schemas/menuSchema";
import { MenuItemRecord } from "../types/menu";
import { ROUTES } from "@/utils/constants/routes";

export async function deleteMenuImage(path: string, store_id: string) {
  const supabase = await createClient();
  const { error: authError } = await guardServerAction();

  if (authError) return { success: false, message: "Authentication required." };
  if (!path.startsWith(store_id)) {
    return { success: false, message: "Unauthorized access." };
  }

  const { error } = await supabase.storage.from("menu").remove([path]);
  if (error) return { success: false, message: error.message };

  return { success: true };
}

async function prepareMenuMutation(values: MenuData) {
  const { user, error: authError } = await guardServerAction();

  if (!user || authError) {
    return {
      errorResponse: {
        success: false,
        message: "Authentication error. Please log in again.",
      },
    };
  }

  const validatedFields = MenuSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      errorResponse: {
        success: false,
        message: "Validation error. Please check your input.",
        errors: validatedFields.error.format(),
      },
    };
  }

  return {
    user,
    payload: {
      name: values.name,
      description: values.description || null,
      price: values.price,
      image_url: values.menu_image_url || null,
      is_available: Boolean(values.is_available),
    },
  };
}

/**
 * Step 2: Executes mutating database operations (insert/update).
 */
async function executeMenuMutation(
  values: MenuData,
  successMessage: string,
  store_id: string,
  dbOperation: (
    supabase: any,
    payload: any,
  ) => Promise<{ error: PostgrestError | null }>,
) {
  const supabase = await createClient();
  const preparation = await prepareMenuMutation(values);

  if ("errorResponse" in preparation) return preparation.errorResponse;
  const { payload } = preparation;

  try {
    const { error: dbError } = await dbOperation(supabase, payload);

    if (dbError) throw dbError;

    revalidatePath(ROUTES.STORE(store_id));
    return { success: true, message: successMessage };
  } catch (error: any) {
    return {
      success: false,
      message:
        error?.message ||
        "An unexpected error occurred while modifying the menu.",
    };
  }
}

// --- Clean, One-Liner Server Actions ---

export async function createMenuAction(values: MenuData, store_id: string) {
  return executeMenuMutation(
    values,
    "Menu item successfully created!",
    store_id,
    (supabase, payload) =>
      supabase.from("menu_items").insert({ store_id, ...payload }),
  );
}

export async function updateMenuAction(
  values: MenuData,
  menu_id: string,
  store_id: string,
) {
  return executeMenuMutation(
    values,
    "Menu item successfully updated!",
    store_id,
    (supabase, payload) =>
      supabase.from("menu_items").update(payload).eq("id", menu_id),
  );
}

// --- Query Actions ---

export async function getMenuItemsAction(
  store_id: string,
): Promise<{ success: boolean; data: MenuItemRecord[]; message?: string }> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("id, store_id, name, description, price, image_url, is_available")
      .eq("store_id", store_id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;

    const normalizedItems: MenuItemRecord[] = (data ?? []).map((item) => ({
      id: item.id,
      store_id: item.store_id,
      name: item.name,
      description: item.description ?? null,
      price:
        typeof item.price === "number" ? item.price : Number(item.price ?? 0),
      image_url: item.image_url ?? null,
      is_available: Boolean(item.is_available),
    }));

    return {
      success: true,
      data: normalizedItems,
    };
  } catch (error: any) {
    return {
      success: false,
      data: [],
      message:
        error?.message ||
        "An unexpected error occurred while loading menu items.",
    };
  }
}
