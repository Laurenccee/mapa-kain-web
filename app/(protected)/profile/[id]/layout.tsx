import BottomTabBar from "@/components/layouts/BottomTabBar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain pb-[calc(6.5rem+1.5rem+env(safe-area-inset-bottom,0px))]">
        {children}
      </main>
      <BottomTabBar />
    </div>
  );
}
