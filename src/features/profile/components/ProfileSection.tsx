"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import ProfileStats from "./ProfileStats";

export default function ProfileSection() {
  const { profile } = useAuth();
  return (
    <Card>
      <CardContent className="flex gap-8 px-8 py-4">
        <div className="border-primary rounded-full border-2 border-dashed p-1">
          <Avatar className="size-32">
            <AvatarImage
              src={profile?.avatar_url || undefined}
              alt={profile?.full_name || "Profile Picture"}
            />
            <AvatarFallback>{profile?.full_name?.[0] || "P"}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex w-full flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-xl">{profile?.full_name || "Full Name"}</h2>
            <p className="text-muted-foreground">
              @{profile?.username || "username"}
            </p>
          </div>
          <ProfileStats />
        </div>
      </CardContent>
    </Card>
  );
}
