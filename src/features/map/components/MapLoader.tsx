import { HugeiconsIcon } from "@hugeicons/react";
import { Loader } from "@hugeicons/core-free-icons";

interface MapLoaderProps {
  show: boolean;
}

export function MapLoader({ show }: MapLoaderProps) {
  if (!show) return null;

  return (
    <div className="bg-background/40 absolute inset-0 z-40 flex flex-col items-center justify-center gap-3 backdrop-blur-md transition-opacity duration-300">
      <HugeiconsIcon
        icon={Loader}
        className="text-primary animate-spin"
        size={24}
      />
      <span className="text-muted-foreground text-xs font-medium">
        Locating position and rendering assets...
      </span>
    </div>
  );
}
