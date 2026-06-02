'use client";';

import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { Pen } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function StoreCard() {
  const { store } = useAuth();
  return (
    <Card className="relative h-48 overflow-hidden bg-transparent">
      <div className="absolute inset-0">
        <Image
          src="/screen.png"
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 896px"
          priority
        />
      </div>
      <div
        aria-hidden="true"
        className="from-primary/95 via-primary/65 absolute inset-0 bg-linear-to-t to-transparent"
      />
      <CardContent className="text-primary-foreground relative z-10 mt-auto flex items-end justify-between space-y-2 px-6">
        <div>
          <h2 className="text-xl font-semibold">{store.name}</h2>
          <p className="text-primary-foreground/90 max-w-prose text-sm">
            More information about the store can go here.
          </p>
        </div>
        <Button variant="secondary" size="lg">
          <HugeiconsIcon icon={Pen} />
          Edit Store Profile
        </Button>
      </CardContent>
    </Card>
  );
}
