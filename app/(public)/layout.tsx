import Header from '@/components/layouts/Header';
import BottomTabBar from '@/components/layouts/BottomTabBar';
import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-screen prevents the whole page from scrolling
    <main className="relative h-screen w-full flex flex-col bg-background overflow-hidden">
      <Header />

      {/* flex-1 makes this container grow to fill all available space */}
      <main className="flex-1 relative">{children}</main>

      <BottomTabBar />
    </main>
  );
}
