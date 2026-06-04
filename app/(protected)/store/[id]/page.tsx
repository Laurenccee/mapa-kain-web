import StoreProfile from "@/features/store/components/store/StoreProfile";
import StoreDetailsCard from "@/features/store/components/store/StoreDetailsCard";
import TopSukiSection from "@/features/store/components/TopSukiSection";
import MenuSection from "@/features/store/components/menu/MenuSection";
import { Suspense } from "react";
import { MenuSkeleton } from "@/features/store/components/skeleton/MenuSkeleton";
import { getMenuItemsAction } from "@/features/store/actions/menu";

interface StorePageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await Promise.resolve(params);
  const menuItemsPromise = getMenuItemsAction(id);

  return (
    <section className="flex flex-col px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <StoreProfile />
        <StoreDetailsCard />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-7">
          <Suspense
            key={id}
            fallback={<MenuSkeleton shouldShowEditButton={true} />}
          >
            <MenuSection menuItemsPromise={menuItemsPromise} />
          </Suspense>
          <TopSukiSection />
        </div>
      </div>
    </section>
  );
}
