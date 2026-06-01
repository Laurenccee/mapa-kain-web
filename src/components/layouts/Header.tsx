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
import BackButton from "../shared/BackButton";

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  const IS_STICKY_HEADER = [
    ROUTES.MAP,
    ROUTES.PROFILE_SETUP,
    ROUTES.PROFILE_EDIT,
    ROUTES.SIGN_IN,
    ROUTES.STORE_REGISTER,
    ROUTES.QR_SCAN,
  ];

  const WITH_BACK_BUTTON = [
    ROUTES.QR_SCAN,
    ROUTES.MY_QR,
    ROUTES.STORE_REGISTER,
  ];

  return (
    <header
      className={cn(
        IS_STICKY_HEADER.includes(pathname)
          ? "border-b-border fixed bg-transparent"
          : "bg-card border-b-border sticky",
        "top-0 right-0 left-0 z-50 h-16 w-full px-4 py-3 md:px-6",
        className,
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {WITH_BACK_BUTTON.includes(pathname) && <BackButton />}
        <div className="flex items-center gap-2">
          <Link href={ROUTES.ROOT} className="text-lg tracking-tight">
            MapaKain
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!WITH_BACK_BUTTON.includes(pathname) && (
            <>
              {isAuthenticated ? (
                <SignOutButton />
              ) : (
                <Button asChild className="h-9 px-4">
                  <Link href={ROUTES.SIGN_IN}>Sign In</Link>
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
