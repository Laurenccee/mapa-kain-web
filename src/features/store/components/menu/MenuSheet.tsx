"use client";

import { use, useMemo } from "react";
import CreateMenuDialog from "./CreateMenuDialog";
import MenuCard from "./MenuCard";
import { getMenuItemsAction } from "../../actions/menu";

interface MenuSectionProps {
  storeId: string;
}

export default function MenuSection({ storeId }: MenuSectionProps) {
  // ⚡ Industry Practice: Pass the Server Action promise straight to React's use() hook
  // We use useMemo to prevent refetching the exact same promise on simple component rerenders
  const resultPromise = useMemo(() => getMenuItemsAction(storeId), [storeId]);
  const result = use(resultPromise);

  const menuItems = result?.data ?? [];
  const errorMessage = result?.success
    ? ""
    : result?.message || "Unable to load menu items.";

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-foreground text-lg font-semibold">Daily Menu</h1>
          <CreateMenuDialog />
        </div>

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
