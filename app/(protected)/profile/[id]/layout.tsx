import BottomTabBar from "@/components/layouts/BottomTabBar";
import React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background relative flex h-screen w-full flex-col">
      <main className="flex-1">{children}</main>
      <BottomTabBar />
    </div>
  );
}
