"use client";

import React, { useMemo } from "react";
import MenuForm from "./MenuForm";
import { UpdateMenuFormProps } from "../../types/menu";
import { updateMenuAction } from "../../actions/menu";
import { MenuFormData } from "../../schemas/menuSchema";

const toFormValues = (
  menuItem: UpdateMenuFormProps["menuItem"],
): MenuFormData => ({
  name: menuItem.name ?? "",
  description: menuItem.description ?? "",
  price: String(menuItem.price ?? 0),
  menu_image_url: menuItem.image_url ?? "",
  is_available: menuItem.is_available,
});

export default function UpdateMenu({
  menuItem,
  onPreviewChange,
  onSuccess,
}: UpdateMenuFormProps) {
  const initialValues = useMemo(
    () => toFormValues(menuItem),
    [
      menuItem.id,
      menuItem.name,
      menuItem.description,
      menuItem.price,
      menuItem.image_url,
      menuItem.is_available,
    ],
  );

  return (
    <MenuForm
      key={menuItem.id}
      mode="update"
      storeId={menuItem.store_id}
      itemId={menuItem.id}
      initialValues={initialValues}
      previousImageUrl={menuItem.image_url}
      onPreviewChange={onPreviewChange}
      onSuccess={onSuccess}
      submitAction={updateMenuAction}
    />
  );
}
