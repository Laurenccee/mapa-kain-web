import Header from '@/components/layouts/Header';
import BottomTabBar from '@/components/layouts/BottomTabBar';
import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // h-dvh prevents the whole page from scrolling and tracks mobile toolbar resizing
    <div className="relative h-dvh w-full flex flex-col bg-background">
      <Header />

      {/* flex-1 makes this container grow to fill all available space */}
      <main className="flex-1">{children}</main>

      <BottomTabBar />
    </div>
  );
}
