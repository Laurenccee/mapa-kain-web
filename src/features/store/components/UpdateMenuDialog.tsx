"use client";

import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UpdateMenuForm from "./UpdateMenuForm";
import MenuCard from "./MenuCard";
import { UpdateMenuDialogProps } from "../types/menu";

type MenuPreviewData = {
  image_url: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
};

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
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<MenuPreviewData>(() =>
    toPreviewData(menuItem),
  );

  useEffect(() => {
    if (isOpen) {
      setPreviewData(toPreviewData(menuItem));
    }
  }, [isOpen, menuItem]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (open) {
      setPreviewData(toPreviewData(menuItem));
    }
  };

  const handleUpdateSuccess = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" variant="default" className="flex-1">
          Edit Menu
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] max-w-sm overflow-y-auto sm:max-w-7xl">
        <div className="grid grid-cols-1 gap-8 py-2 sm:grid-cols-5 sm:gap-16 sm:py-4">
          <div className="flex flex-col gap-6 sm:col-span-2 sm:gap-8">
            <DialogHeader>
              <DialogTitle>Update Menu</DialogTitle>
              <DialogDescription>
                Edit the details below to update this menu item.
              </DialogDescription>
            </DialogHeader>
            <UpdateMenuForm
              menuItem={menuItem}
              onPreviewChange={setPreviewData}
              onSuccess={handleUpdateSuccess}
            />
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
