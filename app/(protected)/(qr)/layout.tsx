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
      <header
        className={cn(
          "fixed top-0 right-0 left-0 z-50 w-full bg-transparent px-4 py-3 md:px-6",
          className,
        )}
      >
        <div className="relative mx-auto flex max-w-screen-2xl items-center justify-between">
          {/* Left-aligned content wrapper */}
          <div className="z-10 flex items-center gap-2">
            <BackButton />
          </div>

          {/* Perfectly dead-centered Title */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="text-foreground pointer-events-auto text-lg font-medium tracking-tight">
              My QR Code
            </span>
          </div>
        </div>
      </header>

      {children}
    </main>
  );
}
