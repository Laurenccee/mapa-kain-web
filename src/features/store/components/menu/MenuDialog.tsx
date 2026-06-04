"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MenuCard from "./MenuCard";
import { MenuDialogBaseProps, MenuPreviewData } from "../../types/menu";

const DEFAULT_PREVIEW: MenuPreviewData = {
  image_url: "",
  name: "Your menu name",
  price: 0,
  description: "Your menu description will appear here.",
  available: true,
};

export default function MenuDialog({
  triggerButton,
  title,
  description,
  initialPreview,
  renderForm,
}: MenuDialogBaseProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<MenuPreviewData>(
    initialPreview || DEFAULT_PREVIEW,
  );

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setPreviewData(initialPreview || DEFAULT_PREVIEW);
    }
  };

  const closeDialog = () => setIsOpen(false);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogContent className="max-h-[90dvh] max-w-sm overflow-y-auto sm:max-w-7xl">
        <div className="grid grid-cols-1 gap-8 py-2 sm:grid-cols-5 sm:gap-16 sm:py-4">
          <div className="flex flex-col gap-6 sm:col-span-2 sm:gap-8">
            <DialogHeader>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            {renderForm({ setPreviewData, closeDialog })}
          </div>

          <div className="col-span-1 flex flex-col gap-6 sm:col-span-3 sm:gap-8">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
              <DialogDescription>
                This is how your menu item will appear to customers.
              </DialogDescription>
            </DialogHeader>

            <div className="sm:bg-muted flex h-full min-h-72 items-center justify-center sm:min-h-130 sm:rounded-md sm:border sm:p-6">
              <div className="w-full max-w-sm">
                <MenuCard
                  image_url={previewData.image_url}
                  name={previewData.name}
                  price={previewData.price}
                  description={previewData.description}
                  available={previewData.available}
                  showEditButton={false}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
