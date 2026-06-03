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
import { Button } from "@/components/ui/button";
import { Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import CreateMenuForm from "./CreateMenuForm";
import MenuCard from "./MenuCard";

type MenuPreviewData = {
  image_url: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
};

const DEFAULT_PREVIEW_DATA: MenuPreviewData = {
  image_url: "",
  name: "Your menu name",
  price: 0,
  description: "Your menu description will appear here.",
  available: true,
};

export default function CreateMenuDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [previewData, setPreviewData] = useState<MenuPreviewData>({
    ...DEFAULT_PREVIEW_DATA,
  });

  const resetPreview = () => {
    setPreviewData({ ...DEFAULT_PREVIEW_DATA });
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) {
      resetPreview();
    }
  };

  const handleCreateSuccess = () => {
    resetPreview();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" variant="default">
          Create Menu
          <HugeiconsIcon icon={Plus} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-7xl">
        <div className="grid grid-cols-1 gap-8 py-2 sm:grid-cols-5 sm:gap-16 sm:py-4">
          <div className="flex flex-col gap-6 sm:col-span-2 sm:gap-8">
            <DialogHeader>
              <DialogTitle>Create Menu</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new menu item.
              </DialogDescription>
            </DialogHeader>
            <CreateMenuForm
              onPreviewChange={setPreviewData}
              onSuccess={handleCreateSuccess}
            />
          </div>
          <div className="col-span-1 flex flex-col gap-6 sm:col-span-3 sm:gap-8">
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
              <DialogDescription>
                This is how your menu item will appear to customers.
              </DialogDescription>
            </DialogHeader>
            <div className="sm:bg-muted sm:bordersm:min-h-130 flex h-full min-h-72 items-center justify-center sm:rounded-md sm:p-6">
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
