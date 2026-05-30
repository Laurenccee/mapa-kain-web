"use client";

import { Card, CardHeader } from "@/components/ui/card";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatMonthYear } from "@/utils/formatters/date";

const statLabelClassName =
  "text-muted-foreground text-[10px] font-medium tracking-wide uppercase sm:text-xs";

const statValueClassName =
  "font-heading text-lg leading-none font-semibold tracking-tight tabular-nums sm:text-xl";

export default function ProfileStats() {
  const { profile } = useAuth();

  const stats = [
    { label: "Total Stamps", value: 42 },
    {
      label: "Member Since",
      value: formatMonthYear(profile?.created_at, "numeric") || "N/A",
    },
    { label: "Active Rewards", value: 5 },
  ] as const;

  return (
    <div className="grid w-full grid-cols-3 gap-2 sm:gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          size="sm"
          className="bg-primary-foreground w-full py-0"
        >
          <CardHeader className="gap-1 px-2 py-3 text-center sm:gap-1.5 sm:px-3 sm:py-4">
            <p className={statLabelClassName}>{stat.label}</p>
            <p className={statValueClassName}>{stat.value}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
