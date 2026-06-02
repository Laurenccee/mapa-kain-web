import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/features/auth/hooks/use-auth";
import React from "react";

export default function StoreProfile() {
  const { store, profile } = useAuth();

  console.log("store", store);
  console.log("profile", profile);
  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="col-span-1 flex flex-col gap-2">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Good Day! {profile?.full_name}!
        </h1>
        <p>How is {store?.name} doing today?</p>
      </div>
    </div>
  );
}
