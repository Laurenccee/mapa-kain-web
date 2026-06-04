import CreateMenuDialog from "./CreateMenuDialog";
import MenuCard from "./MenuCard";
import { MenuSectionProps } from "../../types/menu";
import UpdateMenuDialog from "./UpdateMenuDialog";
import { use } from "react";

export default function MenuSection({ menuItemsPromise }: MenuSectionProps) {
  const result = use(menuItemsPromise);
  const menuItems = result.data;

  return (
    <div className="col-span-1 grid-cols-4 sm:col-span-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1>Daily Menu</h1>
          <CreateMenuDialog />
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {menuItems.map((menuItem) => (
            <MenuCard
              key={menuItem.id}
              image_url={menuItem.image_url ?? ""}
              name={menuItem.name}
              price={menuItem.price}
              description={menuItem.description ?? ""}
              available={menuItem.is_available}
              menuItem={menuItem}
              actionButton={<UpdateMenuDialog menuItem={menuItem} />}
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
