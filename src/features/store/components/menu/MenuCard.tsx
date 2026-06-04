"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePathname } from "next/navigation";
import { MenuCardProps, MenuItemRecord } from "../../types/menu";

export default function MenuCard({
  image_url,
  name,
  price,
  description,
  available: initialAvailable,
  showEditButton,
  menuItem,
  actionButton,
}: MenuCardProps) {
  const [available, setAvailable] = useState(initialAvailable);
  const imageSrc = image_url || "/placeholder/food_1.png";

  const pathname = usePathname();
  const IN_STORE = pathname.includes("/store/");
  const shouldShowEditButton = showEditButton ?? IN_STORE;

  useEffect(() => {
    setAvailable(initialAvailable);
  }, [initialAvailable]);

  return (
    <Card className="relative col-span-1 overflow-hidden pt-0">
      <Badge
        className={`absolute top-4 right-4 z-10 transition-all duration-200 ${!available ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
      >
        {available ? "Available" : "Not Available"}
      </Badge>
      <div className="relative aspect-video w-full">
        <Image
          src={imageSrc}
          alt={name || "Menu image"}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 340px"
        />
      </div>
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
      {shouldShowEditButton && actionButton && (
        <CardFooter>{actionButton}</CardFooter>
      )}
    </Card>
  );
}
