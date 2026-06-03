"use server";

import { guardServerAction } from "@/features/auth/utils/serverAuth";
import { createClient } from "@/lib/supabase/server";
import { MenuData, MenuSchema } from "../schemas/menuSchema";
import { MenuItemRecord } from "../types/menu";

export async function uploadMenuImage(
  file: File,
  oldFilePath?: string | null,
  store_id?: string,
): Promise<string> {
  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const storagePath = `${store_id}/menu-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("menu")
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  if (oldFilePath) {
    const oldPath = oldFilePath.split("/").pop();
    if (oldPath) {
      await supabase.storage.from("menu").remove([`${store_id}/${oldPath}`]);
    }
  }

  const { data } = supabase.storage.from("menu").getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function createMenuAction(values: MenuData, store_id: string) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (!user || authError) {
    return {
      success: false,
      message: "Authentication error. Please log in again.",
    };
  }

  const validatedFields = MenuSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation error. Please check your input.",
      errors: validatedFields.error?.format(),
    };
  }

  try {
    const { error: storeError } = await supabase.from("menu_items").insert({
      store_id: store_id,
      name: values.name,
      description: values.description,
      price: values.price,
      image_url: values.menu_image_url,
      is_available: values.is_available,
    });

    if (storeError) {
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

export async function updateMenuAction(values: MenuData, menu_id: string) {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (!user || authError) {
    return {
      success: false,
      message: "Authentication error. Please log in again.",
    };
  }

  const validatedFields = MenuSchema.safeParse(values);
  if (!validatedFields.success) {
    return {
      success: false,
      message: "Validation error. Please check your input.",
      errors: validatedFields.error?.format(),
    };
  }

  try {
    const { error: storeError } = await supabase
      .from("menu_items")
      .update({
        name: values.name,
        description: values.description,
        price: values.price,
        image_url: values.menu_image_url,
        is_available: values.is_available,
      })
      .eq("id", menu_id);

    if (storeError) {
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

export async function getMenuItemsAction(
  store_id: string,
): Promise<{ success: boolean; data: MenuItemRecord[]; message?: string }> {
  const supabase = await createClient();

  const { user, error: authError } = await guardServerAction();

  if (!user || authError) {
    return {
      success: false,
      data: [],
      message: "Authentication error. Please log in again.",
    };
  }

  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .eq("store_id", store_id)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

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
  } catch (error) {
    return {
      success: false,
      data: [],
      message:
        (error as Error).message ||
        "An unexpected error occurred while loading menu items.",
    };
  }
}
