'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MapingIcon,
  NewsIcon,
  QrCode01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ROUTES } from '@/utils/constants/routes';
import { useMemo } from 'react';

const publicNavs = [
  { name: 'Map', href: ROUTES.MAP, icon: MapingIcon },
  { name: 'Feed', href: ROUTES.FEED, icon: NewsIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { hasEstablishment, isAuthenticated, userId } = useAuth();

  const visibleNavItems = useMemo(() => {
    const items = [...publicNavs];
    if (isAuthenticated) {
      items.push({
        name: 'Profile',
        href: ROUTES.USER(userId || ''),
        icon: UserIcon,
      });
    }
    return items;
  }, [isAuthenticated, userId]);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm sm:max-w-md flex items-center -translate-x-1/2 px-4">
      <div className="flex items-center gap-2 sm:gap-4 justify-center w-full">
        <nav
          className="flex flex-3 gap-1 items-center justify-between rounded-xl border border-border bg-card backdrop-blur-xl p-1.5"
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
                      'relative flex flex-1 flex-col items-center justify-center rounded-lg gap-0.5 p-2 duration-200',
                      isActive
                        ? 'bg-secondary text-foreground'
                        : 'text-secondary-foreground hover:bg-secondary/50 hover:text-primary',
                    )}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      strokeWidth={2}
                      className={cn(
                        'w-4.5 h-4.5 sm:w-5.5 sm:h-5.5',
                        isActive
                          ? 'text-foreground'
                          : 'text-secondary-foreground hover:text-primary',
                      )}
                    />
                    <span
                      className={cn(
                        'text-[10px] sm:text-xs font-medium',
                        isActive
                          ? 'text-primary'
                          : 'text-secondary-foreground hover:text-primary',
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
            className="flex aspect-square items-center justify-center p-2 h-full min-h-14.5 sm:min-h-16.5 rounded-lg bg-primary transition-transform"
            aria-label="QR Code Actions"
          >
            <Link
              href={hasEstablishment ? '/scan' : '/my-qr'}
              aria-label={hasEstablishment ? 'Scan QR Code' : 'View My QR Code'}
            >
              <HugeiconsIcon
                icon={QrCode01Icon}
                strokeWidth={1.5}
                className="text-primary-foreground w-7 h-7 sm:w-9 sm:h-9"
              />
              <span className="sr-only">QR Code</span>
            </Link>
          </nav>
        )}
      </div>
    </div>
  );
}
