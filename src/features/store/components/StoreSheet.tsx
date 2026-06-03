"use client";

import React, { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import Image from "next/image";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClaimedStore } from "../types/claimedStore";

interface StoreSheetProps {
  currentStoreData?: ClaimedStore | null;
  storeId?: string;
  children: React.ReactNode;
}

export default function StoreSheet({
  storeId,
  currentStoreData,
  children,
}: StoreSheetProps) {
  const isMobile = useIsMobile();
  const router = useRouter();

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        const params = new URLSearchParams(window.location.search);
        params.delete("storeId");
        router.push(`?${params.toString()}`, { scroll: false });
      }
    },
    [router],
  );

  return (
    <Sheet open={Boolean(storeId)} onOpenChange={handleSheetOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "left"}
        className={
          isMobile
            ? "overflow-y-auto data-[side=bottom]:h-[92dvh] data-[side=bottom]:max-h-[92dvh] data-[side=bottom]:rounded-t-2xl"
            : "w-[92vw] overflow-y-auto data-[side=left]:sm:max-w-120 data-[side=right]:sm:max-w-120"
        }
      >
        <Image
          src="/screen.png"
          alt="Store Image"
          style={{ objectFit: "cover" }}
          className="w-full"
          width={400}
          height={300}
        />
        <SheetHeader>
          <SheetTitle className="text-xl font-bold">
            {currentStoreData?.name ?? "Building Details"}
          </SheetTitle>
          <SheetDescription>
            {currentStoreData?.description?.trim() ||
              "No description provided yet."}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
