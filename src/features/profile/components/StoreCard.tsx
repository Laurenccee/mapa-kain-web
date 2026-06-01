"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";

export default function StoreCard() {
  const { hasStore, store } = useAuth();

  console.log("hasStore", hasStore);

  return (
    <Card className="bg-primary">
      <CardContent className="flex flex-col gap-4 p-4 sm:p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary-foreground font-heading text-lg font-semibold tracking-tight sm:text-xl">
            {hasStore
              ? "Own a Store? Register your Store Today!"
              : "Manage Your Store"}
          </h2>
          <p className="text-primary-foreground/90 text-sm leading-relaxed sm:text-base">
            {hasStore
              ? "Register your store today to join the MapaKain community. Reach more food lovers and reward your most loyal customers with our artisanal Suki program."
              : "Access your merchant dashboard to monitor customer loyalty, update your menu items, and engage with your local community of food lovers."}
          </p>
        </div>
        <Button
          size="lg"
          variant="secondary"
          className="w-full sm:w-fit"
          asChild
        >
          <Link href={hasStore ? `/store/${store.id}` : "/store/register"}>
            {hasStore ? "Go to Dashboard" : "Register Your Store"}
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
