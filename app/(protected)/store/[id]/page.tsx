"use client";

import { Card, CardContent } from "@/components/ui/card";
import StoreProfile from "@/features/store/components/StoreProfile";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import StoreDetailsCard from "@/features/store/components/StoreDetailsCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { Pen, Plus } from "@hugeicons/core-free-icons";
import MenuCard from "@/features/store/components/MenuCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StorePage() {
  return (
    <section className="flex flex-col px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <StoreProfile />
        <StoreDetailsCard />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-7">
          <div className="col-span-1 grid-cols-4 sm:col-span-5">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h1>Daily Menu</h1>
                <Button size="lg">
                  Add Menu Item
                  <HugeiconsIcon icon={Plus} />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <MenuCard
                  image_url="/placeholder/food_1.png"
                  name="Adobo na Baboy"
                  price={9.99}
                  description="A Pork Adobo dish with a rich and savory sauce, perfect for any meal."
                  available={true}
                />
                <MenuCard
                  image_url="/placeholder/food_2.png"
                  name="Sinigang na Hipon"
                  price={12.99}
                  description="A sour and spicy fish soup with vegetables, a beloved Filipino comfort food."
                  available={false}
                />
                <MenuCard
                  image_url="/placeholder/food_3.png"
                  name="Adobo na Baboy with Rice"
                  price={8.99}
                  description="A Pork Adobo dish served with steamed rice."
                  available={true}
                />
              </div>
            </div>
          </div>
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
        </div>
      </div>
    </section>
  );
}
