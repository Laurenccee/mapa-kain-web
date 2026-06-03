import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export default function TopSukiSection() {
  return (
    <div className="col-span-1 flex flex-col gap-8 sm:col-span-2">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Top Suki</h1>
          <Button variant="ghost" size="lg">
            View All
          </Button>
        </div>
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src="/placeholder/user_1.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm font-semibold">Juan Dela Cruz</p>
              </div>
              <div className="flex flex-col items-center">
                <p className="text-primary text-sm font-semibold">8</p>
                <p className="text-muted-foreground text-xs">Stamps</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
