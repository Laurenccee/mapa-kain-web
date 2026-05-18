'use client';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/features/auth/hooks/use-auth';
import { formatMonthYear } from '@/utils/formatters/date';

export default function ProfileStats() {
  const { profile } = useAuth();

  const totalStamps = 42;
  const memberSince = formatMonthYear(profile?.created_at, 'numeric') || 'N/A';
  const activeRewards = 5;

  return (
    /* Changed 'flex' to 'grid grid-cols-3' to instantly enforce identical card widths */
    <div className="grid grid-cols-3 gap-4 w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardDescription className="text-xs">Total Stamps</CardDescription>
          <CardTitle className="text-base font-bold">{totalStamps}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardDescription className="text-xs">Member Since</CardDescription>
          <CardTitle className="text-base font-bold">{memberSince}</CardTitle>
        </CardHeader>
      </Card>

      <Card className="w-full">
        <CardHeader className="text-center">
          <CardDescription className="text-xs">Active Rewards</CardDescription>
          <CardTitle className="text-base font-bold">{activeRewards}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
