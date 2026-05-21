"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/features/auth/hooks/use-auth";

export default function ProfileSection() {
  const { profile } = useAuth();
  console.log("Profile data:", profile);
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Avatar className="size-32">
        <AvatarImage
          src={profile?.avatar_url || undefined}
          alt={profile?.full_name || "Profile Picture"}
        />
        <AvatarFallback>{profile?.full_name?.[0] || "P"}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-center">
        <h2 className="text-xl">{profile?.full_name || "Full Name"}</h2>
        <p className="text-muted-foreground">
          @{profile?.username || "username"}
        </p>
      </div>
    </div>
  );
}
