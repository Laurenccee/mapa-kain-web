"use client";

import MenuCard from "./MenuCard";
import { getMenuItemsAction } from "../../actions/menu";
import { useEffect, useState } from "react";
import { MenuItemRecord } from "../../types/menu";
import { MenuSkeleton } from "../skeleton/MenuSkeleton";

interface MenuSectionProps {
  storeId: string;
}

export default function MenuSection({ storeId }: MenuSectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItemRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setMenuItems([]);
    setErrorMessage("");
    getMenuItemsAction(storeId).then((result) => {
      if (result.success) {
        setMenuItems(result.data);
      } else {
        setErrorMessage(result.message || "Unable to load menu items.");
      }
      setIsLoading(false);
    });
  }, [storeId]);

  if (isLoading) {
    return <MenuSkeleton shouldShowEditButton={false} type="sheet" />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <h1 className="text-foreground text-lg font-semibold">Daily Menu</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {menuItems.map((menuItem) => (
            <MenuCard
              key={menuItem.id}
              image_url={menuItem.image_url ?? ""}
              name={menuItem.name}
              price={menuItem.price}
              description={menuItem.description ?? ""}
              available={menuItem.is_available}
              menuItem={menuItem}
            />
          ))}

          {menuItems.length === 0 && (
            <div className="text-muted-foreground col-span-full rounded-md border border-dashed p-6 text-center text-sm">
              {errorMessage ||
                "No menu items yet. Create your first menu item."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
