"use client";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import ProfileStats from "./ProfileStats";

export default function ProfileSection() {
  const { profile } = useAuth();
  const username = profile?.username || "username";
  const isVerified = profile?.is_onboarded ?? false;

  return (
    <Card className="sm:bg-card sm:ring-foreground/10 gap-0 bg-transparent py-0 ring-0 sm:py-0 sm:ring-1">
      <CardContent className="flex flex-col items-center gap-6 px-0 py-4 sm:flex-row sm:items-center sm:gap-8 sm:p-6">
        <div className="relative shrink-0">
          <div className="border-primary rounded-full border-2 border-dashed p-2">
            <div className="border-primary overflow-hidden rounded-full border-[3px]">
              <Avatar className="size-28 after:hidden sm:size-32">
                <AvatarImage
                  src={profile?.avatar_url || undefined}
                  alt={profile?.full_name || "Profile Picture"}
                />
                <AvatarFallback className="text-2xl">
                  {profile?.full_name?.[0] || "P"}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          {isVerified ? (
            <AvatarBadge className="size-7 sm:size-8 [&>svg]:size-3.5 sm:[&>svg]:size-4">
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                strokeWidth={2}
                aria-hidden
              />
              <span className="sr-only">Verified profile</span>
            </AvatarBadge>
          ) : null}
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-4 sm:gap-5">
          <div className="flex flex-col text-center sm:text-left">
            <h2 className="text-3xl text-balance sm:text-2xl sm:leading-tight">
              {profile?.full_name || "Full Name"}
            </h2>
            <p className="text-muted-foreground text-base sm:text-base">
              <span className="font-medium">@{username}</span>
              {isVerified ? (
                <>
                  <span className="px-1.5" aria-hidden>
                    •
                  </span>
                  <span>Food Enthusiast &amp; Suki Pro</span>
                </>
              ) : null}
            </p>
          </div>
          <ProfileStats />
        </div>
      </CardContent>
    </Card>
  );
}
