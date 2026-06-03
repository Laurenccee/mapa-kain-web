import CreateMenuDialog from "./CreateMenuDialog";
import MenuCard from "./MenuCard";
import { getMenuItemsAction } from "../actions/menu";
import { MenuSectionProps } from "../types/menu";

export default async function MenuSection({ storeId }: MenuSectionProps) {
  const result = await getMenuItemsAction(storeId);
  // Fallback to empty array if data is missing or undefined to prevent crashes
  const menuItems = result.data ?? [];

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
              {result.success
                ? "No menu items yet. Create your first menu item."
                : result.message || "Unable to load menu items right now."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
