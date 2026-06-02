"use client";

import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface MenuCardProps {
  image_url: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
}

export default function MenuCard({
  image_url,
  name,
  price,
  description,
  available: initialAvailable,
}: MenuCardProps) {
  const [available, setAvailable] = useState(initialAvailable);

  return (
    <Card className="relative col-span-1 overflow-hidden pt-0">
      <Badge
        className={`absolute top-4 right-4 z-10 transition-all duration-200 ${!available ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {available ? "Available" : "Not Available"}
      </Badge>
      <Image src={image_url} alt={name} width={300} height={200} />
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{name}</h2>
          <p className="text-primary line-clamp-1 text-base font-semibold">
            ${price.toFixed(2)}
          </p>
        </div>
        <p className="text-muted-foreground line-clamp-2 truncate text-xs">
          {description}
        </p>
      </CardContent>
      <CardFooter className="flex items-center gap-4">
        <Button variant="default" size="lg" className="flex-1">
          Edit Menu
        </Button>
        <Switch
          id="menu-availability"
          checked={available}
          onCheckedChange={setAvailable}
        />
      </CardFooter>
    </Card>
  );
}
