"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import MenuDialog from "./MenuDialog";
import CreateMenu from "./CreateMenu";

export default function CreateMenuDialog() {
  return (
    <MenuDialog
      title="Create Menu"
      description="Fill in the details below to create a new menu item."
      triggerButton={
        <Button size="lg" variant="default">
          Create Menu
          <HugeiconsIcon icon={Plus} />
        </Button>
      }
      renderForm={({ setPreviewData, closeDialog }) => (
        <CreateMenu onPreviewChange={setPreviewData} onSuccess={closeDialog} />
      )}
    />
  );
}
