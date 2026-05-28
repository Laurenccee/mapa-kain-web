"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatMonthYear } from "@/utils/formatters/date";

export default function ProfileStats() {
  const { profile } = useAuth();

  const totalStamps = 42;
  const memberSince = formatMonthYear(profile?.created_at, "numeric") || "N/A";
  const activeRewards = 5;

  return (
    /* Changed 'flex' to 'grid grid-cols-3' to instantly enforce identical card widths */
    <div className="grid w-full grid-cols-3 gap-4">
      <Card className="bg-primary-foreground w-full">
        <CardHeader className="gap-0 text-center">
          <h1 className="text-sm">Total Stamps</h1>
          <p className="text-base font-bold">{totalStamps}</p>
        </CardHeader>
      </Card>

      <Card className="bg-primary-foreground w-full">
        <CardHeader className="gap-0 text-center">
          <h1 className="text-sm">Member Since</h1>
          <p className="text-base font-bold">{memberSince}</p>
        </CardHeader>
      </Card>

      <Card className="bg-primary-foreground w-full">
        <CardHeader className="gap-0 text-center">
          <h1 className="text-sm">Active Rewards</h1>
          <p className="text-base font-bold">{activeRewards}</p>
        </CardHeader>
      </Card>
    </div>
  );
}
