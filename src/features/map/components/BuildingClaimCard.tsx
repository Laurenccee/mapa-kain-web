import { useRouter } from "next/navigation";

interface BuildingClaimCardProps {
  building: { id: string | number; properties: Record<string, any> } | null;
  onClose: () => void;
}

export function BuildingClaimCard({
  building,
  onClose,
}: BuildingClaimCardProps) {
  const router = useRouter();
  if (!building) return null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 absolute bottom-32 left-1/2 z-30 w-full max-w-sm -translate-x-1/2 px-4 duration-300">
      <div className="bg-background/90 border-border flex flex-col gap-4 rounded-2xl border p-5 shadow-2xl backdrop-blur-md dark:bg-zinc-900/90">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-foreground text-sm font-semibold">
              {building.properties.name || "Unnamed Building"}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-xs">
              OSM Building ID:{" "}
              <span className="text-primary font-mono">{building.id}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium"
          >
            Cancel
          </button>
        </div>

        <button
          onClick={() => router.push(`/claim?buildingId=${building.id}`)}
          className="bg-primary text-primary-foreground hover:bg-primary/95 w-full cursor-pointer rounded-xl px-4 py-2.5 text-xs font-medium transition-all active:scale-[0.98]"
        >
          Claim Building to Open Store
        </button>
      </div>
    </div>
  );
}
