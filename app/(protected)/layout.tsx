import Header from "@/components/layouts/Header";
import React from "react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background relative flex h-screen w-full flex-col">
      <Header />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
