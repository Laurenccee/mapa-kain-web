"use client";

import React from "react";
import { cn } from "@/lib/utils";
import SignOutButton from "../shared/SignOutButton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { ThemeToggle } from "../shared/ThemeToggle";
import { Button } from "../ui/button";
import Link from "next/link";
import { ROUTES } from "@/utils/constants/routes";
import { usePathname } from "next/navigation";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const isMapPage = pathname === "/map";

  return (
    <header
      className={cn(
        isMapPage
          ? "border-b-border fixed bg-transparent"
          : "bg-card border-b-border sticky",
        "top-0 right-0 left-0 z-50 h-16 w-full px-4 py-3 md:px-6",
        className,
      )}
    >
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg tracking-tight">OnSpot</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated ? (
            <SignOutButton />
          ) : (
            <Button asChild className="h-9 px-4">
              <Link href={ROUTES.SIGN_IN}>Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
