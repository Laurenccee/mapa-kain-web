'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import SignOutButton from '../shared/SignOutButton';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { ThemeToggle } from '../shared/ThemeToggle';
import { Button } from '../ui/button';
import Link from 'next/link';
import { ROUTES } from '@/utils/constants/routes';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isMapPage = pathname === '/map';

  return (
    <header
      className={cn(
        isMapPage
          ? 'fixed bg-transparent border-b-border'
          : 'sticky bg-card border-b-border',
        'w-full top-0 left-0 right-0 z-50 h-16 px-4 md:px-6 py-3',
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg tracking-tight">OnSpot</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <Button asChild className="px-4 h-9">
              <Link href={ROUTES.SIGN_IN}>Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
