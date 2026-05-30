"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import ProfileStats from "./ProfileStats";

export default function ProfileSection() {
  const { profile } = useAuth();
  return (
    <Card className="sm:bg-card sm:ring-foreground/10 gap-0 bg-transparent py-0 ring-0 sm:gap-4 sm:py-4 sm:ring-1">
      <CardContent className="flex flex-col items-center gap-4 px-0 py-4 sm:flex-row sm:items-start sm:px-8">
        <div className="border-primary w-fit rounded-full border-2 border-dashed p-1">
          <Avatar className="size-24 sm:size-32">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || "Profile Picture"}
            />
            <AvatarFallback>{profile?.full_name?.[0] || "P"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex w-full flex-col items-center gap-4 sm:items-stretch">
          <div className="flex flex-col gap-0.5 text-center sm:gap-1 sm:text-left">
            <h2 className="text-2xl text-balance sm:text-3xl">
              {profile?.full_name || "Full Name"}
            </h2>
            <p className="text-muted-foreground text-sm font-medium tracking-wide sm:text-base">
              @{profile?.username || "username"}
            </p>
          </div>
          <ProfileStats />
        </div>
      </CardContent>
    </Card>
  );
}
