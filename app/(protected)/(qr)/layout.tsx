import BackButton from '@/components/shared/BackButton';
import { cn } from '@/lib/utils';
import React from 'react';

export default function QRLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="relative h-screen w-full flex flex-col bg-background overflow-hidden">
      <header
        className={cn(
          'fixed w-full top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 bg-transparent',
          className,
        )}
      >
        <div className="mx-auto relative flex max-w-screen-2xl justify-between items-center">
          {/* Left-aligned content wrapper */}
          <div className="flex items-center gap-2 z-10">
            <BackButton />
          </div>

          {/* Perfectly dead-centered Title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-lg tracking-tight font-medium text-foreground pointer-events-auto">
              My QR Code
            </span>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
