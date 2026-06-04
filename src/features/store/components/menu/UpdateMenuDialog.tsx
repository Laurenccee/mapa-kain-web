"use client";

import React, { useMemo } from "react";
import { Button } from "@/components/ui/button";

import MenuDialog from "./MenuDialog";
import UpdateMenu from "./UpdateMenu";
import { MenuPreviewData, UpdateMenuDialogProps } from "../../types/menu";

const toPreviewData = (
  menuItem: UpdateMenuDialogProps["menuItem"],
): MenuPreviewData => ({
  image_url: menuItem.image_url ?? "",
  name: menuItem.name || "Your menu name",
  price: menuItem.price ?? 0,
  description:
    menuItem.description?.trim() || "Your menu description will appear here.",
  available: menuItem.is_available,
});

export default function UpdateMenuDialog({ menuItem }: UpdateMenuDialogProps) {
  const initialPreview = useMemo(
    () => toPreviewData(menuItem),
    [
      menuItem.id,
      menuItem.image_url,
      menuItem.name,
      menuItem.price,
      menuItem.description,
      menuItem.is_available,
    ],
  );
  return (
    <MenuDialog
      title="Update Menu"
      description="Edit the details below to update this menu item."
      initialPreview={initialPreview}
      triggerButton={
        <Button size="lg" variant="default" className="flex-1">
          Edit Menu
        </Button>
      }
      renderForm={({ setPreviewData, closeDialog }) => (
        <UpdateMenu
          menuItem={menuItem}
          onPreviewChange={setPreviewData}
          onSuccess={closeDialog}
        />
      )}
    />
  );
}
