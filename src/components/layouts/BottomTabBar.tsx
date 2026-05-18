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

const publicNavs = [
  { name: 'Map', href: ROUTES.MAP, icon: MapingIcon },
  { name: 'Feed', href: '/notifications', icon: NewsIcon },
];

export default function BottomTabBar() {
  const pathname = usePathname();
  const { hasEstablishment, isAuthenticated } = useAuth();

  const visibleNavItems = [
    ...publicNavs,
    ...(isAuthenticated
      ? [{ name: 'Profile', href: ROUTES.PROFILE_SETUP, icon: UserIcon }]
      : []),
  ];

  return (
    <div className="fixed bottom-6 left-1/2 z-50 w-full max-w-sm sm:max-w-md flex items-center -translate-x-1/2 px-4">
      <div className="flex items-center gap-2 sm:gap-4 justify-center w-full">
        {/* Main Navigation Tab */}
        <nav className="flex flex-3 gap-1 items-center justify-between rounded-xl border border-border bg-card backdrop-blur-xl p-1.5">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'relative flex flex-1 flex-col items-center justify-center rounded-lg gap-0.5 p-2 hover:bg-secondary transition-all duration-200',
                  isActive && 'bg-secondary',
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
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* QR Code Action Tab */}
        {isAuthenticated && (
          <nav className="flex aspect-square items-center justify-center p-2 h-full min-h-14.5 sm:min-h-16.5 rounded-lg bg-primary transition-transform">
            <Link href={hasEstablishment ? '/scan' : '/my-qr'} className="">
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
