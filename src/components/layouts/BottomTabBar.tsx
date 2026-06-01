"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MapingIcon,
  NewsIcon,
  QrCode01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ROUTES } from "@/utils/constants/routes";
import { useMemo } from "react";

const publicNavs = [
  { name: "Map", href: ROUTES.MAP, icon: MapingIcon },
  { name: "Feed", href: ROUTES.FEED, icon: NewsIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { hasStore, isAuthenticated, userId } = useAuth();

  const visibleNavItems = useMemo(() => {
    const items = [...publicNavs];
    if (isAuthenticated) {
      items.push({
        name: "Profile",
        href: ROUTES.PROFILE(userId || ""),
        icon: UserIcon,
      });
    }
    return items;
  }, [isAuthenticated, userId]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 flex w-full max-w-sm -translate-x-1/2 items-center px-4 sm:max-w-md">
      <div className="flex w-full items-center justify-center gap-2 sm:gap-4">
        <nav
          className="border-border bg-card flex flex-3 items-center justify-between gap-1 rounded-xl border p-1.5 shadow-xl backdrop-blur-xl"
          aria-label="Primary Bottom Tab"
        >
          <ul className="flex w-full items-center justify-between gap-1">
            {visibleNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name} className="flex-1">
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg p-2 duration-200",
                      isActive
                        ? "bg-secondary text-foreground"
                        : "text-secondary-foreground hover:bg-secondary/50 hover:text-primary",
                    )}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={2}
                      className={cn(
                        "h-4.5 w-4.5 sm:h-5.5 sm:w-5.5",
                        isActive
                          ? "text-foreground"
                          : "text-secondary-foreground hover:text-primary",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[10px] font-medium sm:text-xs",
                        isActive
                          ? "text-primary"
                          : "text-secondary-foreground hover:text-primary",
                      )}
                    >
                      <span className="text-[10px] font-medium sm:text-xs">
                        {item.name}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {isAuthenticated && (
          <nav
            className="bg-primary flex aspect-square h-full min-h-14.5 items-center justify-center rounded-lg p-2 shadow-xl transition-transform sm:min-h-16.5"
            aria-label="QR Code Actions"
          >
            <Link
              href={hasStore ? "/scanner" : "/qr"}
              aria-label={hasStore ? "Scan QR Code" : "View My QR Code"}
            >
              <HugeiconsIcon
                icon={QrCode01Icon}
                strokeWidth={1.5}
                className="text-primary-foreground h-7 w-7 sm:h-9 sm:w-9"
              />
              <span className="sr-only">QR Code</span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
