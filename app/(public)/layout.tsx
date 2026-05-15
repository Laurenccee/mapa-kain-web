import Header from '@/components/layouts/Header';
import BottomTabBar from '@/components/layouts/BottomTabBar';
import React from 'react';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-background">
      {/* SignOutButton: 
        - top-4 right-4: Standard padding from the edges
        - z-50: Ensures it stays above the map and other content
      */}
      <Header />

      {/* Main Content:
        - pb-24: Space for the floating bottom bar
      */}
      <main className="pb-24">{children}</main>

      {/* BottomTabBar:
        - bottom-6: Lifted slightly off the edge for that "floating" look
        - left-1/2 -translate-x-1/2: Perfect horizontal centering
        - z-50: Top layer
      */}
      <BottomTabBar />
    </div>
  );
}
