"use client";

import { useEffect, useRef } from "react";
import { MenuFormData } from "../schemas/menuSchema";
import { toPreviewImageUrl, toPreviewPrice } from "../utils/menuPreviewHelper";
import { MenuPreviewData } from "../types/menu";

interface UseMenuPreviewSyncArgs {
  initialValues: MenuFormData;
  watchedValues: Partial<MenuFormData>;
  onPreviewChange?: (preview: MenuPreviewData) => void;
}

/** Keeps the live menu-item preview (and its object URL) in sync with the form's current values. */
export function useMenuPreviewSync({
  initialValues,
  watchedValues,
  onPreviewChange,
}: UseMenuPreviewSyncArgs) {
  const filePreviewUrlRef = useRef<string | null>(null);
  const lastPickedFileRef = useRef<File | null>(null);

  useEffect(() => {
    return () => {
      if (filePreviewUrlRef.current) {
        URL.revokeObjectURL(filePreviewUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!onPreviewChange) return;

    const values = { ...initialValues, ...watchedValues };
    let previewImage: string;

    if (values.menu_image_url instanceof File) {
      if (values.menu_image_url !== lastPickedFileRef.current) {
        if (filePreviewUrlRef.current) {
          URL.revokeObjectURL(filePreviewUrlRef.current);
        }
        filePreviewUrlRef.current = URL.createObjectURL(values.menu_image_url);
        lastPickedFileRef.current = values.menu_image_url;
      }
      previewImage = filePreviewUrlRef.current ?? "";
    } else {
      lastPickedFileRef.current = null;
      previewImage = toPreviewImageUrl(values.menu_image_url);
    }

    onPreviewChange({
      image_url: previewImage,
      name: values.name?.trim() || "Your menu name",
      price: toPreviewPrice(values.price),
      description:
        values.description?.trim() ||
        "Your menu description will appear here.",
      available: values.is_available ?? true,
    });
  }, [
    onPreviewChange,
    initialValues,
    watchedValues.description,
    watchedValues.menu_image_url,
    watchedValues.is_available,
    watchedValues.name,
    watchedValues.price,
  ]);
}
