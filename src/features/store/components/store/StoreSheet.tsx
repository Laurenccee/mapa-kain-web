"use client";

import React, { Suspense, useEffect, useState } from "react";
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
import { MenuSkeleton } from "../skeleton/MenuSkeleton";
import { MenuItemRecord } from "../../types/menu";
import { getMenuItemsAction } from "../../actions/menu";

interface StoreSheetProps {
  store: ClaimedStore | null;
  onClose: () => void;
}

export default function StoreSheet({ store, onClose }: StoreSheetProps) {
  const isMobile = useIsMobile();

  const [menuCache, setMenuCache] = useState<Record<string, MenuItemRecord[]>>(
    {},
  );
  const [loadingStores, setLoadingStores] = useState<Record<string, boolean>>(
    {},
  );
  const [errorMessages, setErrorMessages] = useState<Record<string, string>>(
    {},
  );

  const currentStoreId = store?.id;

  useEffect(() => {
    if (!currentStoreId) return;

    if (menuCache[currentStoreId]) return;

    setLoadingStores((prev) => ({ ...prev, [currentStoreId]: true }));

    getMenuItemsAction(currentStoreId).then((result) => {
      if (result.success) {
        setMenuCache((prev) => ({ ...prev, [currentStoreId]: result.data }));
      } else {
        setErrorMessages((prev) => ({
          ...prev,
          [currentStoreId]: result.message || "Unable to load menu items.",
        }));
      }
      setLoadingStores((prev) => ({ ...prev, [currentStoreId]: false }));
    });
  }, [currentStoreId, menuCache]);

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
        <div className="px-4">
          {store && (
            <MenuSheet
              menuItems={menuCache[store.id] || []}
              isLoading={loadingStores[store.id] ?? !menuCache[store.id]}
              errorMessage={errorMessages[store.id]}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
