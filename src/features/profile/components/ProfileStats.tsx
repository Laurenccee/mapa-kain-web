"use client";

import { useAuth } from "@/features/auth/hooks/use-auth";
import { formatMonthYear } from "@/utils/formatters/date";
import { cn } from "@/lib/utils";

const statLabelClassName =
  "text-accent-foreground text-xs font-medium tracking-wide uppercase sm:text-sm";

const statValueClassName =
  "font-heading text-lg font-semibold leading-none tracking-tight tabular-nums text-primary sm:text-xl";

export default function ProfileStats() {
  const { profile } = useAuth();

  const stats: {
    label: string;
    value: string | number;
    compactValue?: boolean;
  }[] = [
    { label: "Total Stamps", value: 42 },
    {
      label: "Member Since",
      value: formatMonthYear(profile?.created_at, "numeric") || "N/A",
      compactValue: true,
    },
    { label: "Active Rewards", value: 5 },
  ];

  return (
    <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-accent ring-foreground/70 flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-2 py-3.5 text-center sm:px-3 sm:py-4"
        >
          <div className={statLabelClassName}>{stat.label}</div>
          <div
            className={cn(
              statValueClassName,
              stat.compactValue && "text-base sm:text-lg",
            )}
          >
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
