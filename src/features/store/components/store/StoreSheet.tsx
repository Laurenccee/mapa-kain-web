"use client";

import React, { useEffect } from "react";
import NextImage from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClaimedStore } from "../../types/store";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import MenuSheet from "../menu/MenuSheet";
import { useMenuStore } from "../../storage/useMenuStore";

interface StoreSheetProps {
  store: ClaimedStore | null;
  onClose: () => void;
}

export default function StoreSheet({ store, onClose }: StoreSheetProps) {
  const isMobile = useIsMobile();
  const fetchMenu = useMenuStore((state) => state.fetchMenu);
  const currentStoreId = store?.id;

  useEffect(() => {
    if (currentStoreId) {
      fetchMenu(currentStoreId);
    }
  }, [currentStoreId, fetchMenu]);

  return (
    <Sheet open={Boolean(store)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className={
          isMobile
            ? "overflow-y-auto data-[side=bottom]:h-[92dvh] data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:rounded-t-2xl"
            : "w-[92vw] overflow-y-auto data-[side=left]:sm:max-w-120"
        }
      >
        <div className="relative h-60 w-full overflow-hidden">
          <NextImage
            src="/screen.png"
            alt="Store Image"
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover"
            priority={Boolean(store)}
          />
        </div>

        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {store?.name ?? "Building Details"}
          </SheetTitle>
          <SheetDescription>
            {store?.description?.trim() || "No description provided yet."}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 px-4">
          {store && <MenuSheet storeId={store.id} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
