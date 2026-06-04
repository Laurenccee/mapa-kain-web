"use client";

import MenuCard from "./MenuCard";
import { MenuSkeleton } from "../skeleton/MenuSkeleton";
import { useMenuStore } from "../../storage/useMenuStore";
import { MenuSheetProps } from "../../types/menu";

const EMPTY_ARRAY: any[] = [];

export default function MenuSheet({ storeId }: MenuSheetProps) {
  const menuItems = useMenuStore(
    (state) => state.cache[storeId] || EMPTY_ARRAY,
  );
  const isLoading = useMenuStore(
    (state) => state.loadingStates[storeId] ?? true,
  );
  const errorMessage = useMenuStore((state) => state.errorMessages[storeId]);

  if (isLoading && menuItems.length === 0) {
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
