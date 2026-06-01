import BackButton from "@/components/shared/BackButton";
import { cn } from "@/lib/utils";
import React from "react";

export default function QRLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className="bg-background relative flex h-screen w-full flex-col overflow-hidden">
      {children}
    </main>
  );
}
