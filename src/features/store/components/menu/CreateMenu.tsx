"use client";

import React from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import MenuForm from "./MenuForm";
import { CreateMenuFormProps } from "../../types/menu";
import { createMenuAction } from "../../actions/menu";
import { MenuFormData } from "../../schemas/menuSchema";

const INITIAL_VALUES: MenuFormData = {
  name: "",
  description: "",
  price: "0",
  menu_image_url: "",
  is_available: true,
};

export default function CreateMenu({
  onPreviewChange,
  onSuccess,
}: CreateMenuFormProps) {
  const { store } = useAuth();

  return (
    <MenuForm
      mode="create"
      storeId={store?.id || ""}
      initialValues={INITIAL_VALUES}
      onPreviewChange={onPreviewChange}
      onSuccess={onSuccess}
      submitAction={createMenuAction}
    />
  );
}
