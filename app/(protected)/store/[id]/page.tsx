import StoreProfile from "@/features/store/components/StoreProfile";
import StoreDetailsCard from "@/features/store/components/StoreDetailsCard";
import TopSukiSection from "@/features/store/components/TopSukiSection";
import MenuSection from "@/features/store/components/MenuSection";

interface StorePageProps {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function StorePage({ params }: StorePageProps) {
  const { id } = await Promise.resolve(params);

  return (
    <section className="flex flex-col px-4 py-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 sm:gap-8">
        <StoreProfile />
        <StoreDetailsCard />

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-7">
          <MenuSection storeId={id} />
          <TopSukiSection />
        </div>
      </div>
    </section>
  );
}
