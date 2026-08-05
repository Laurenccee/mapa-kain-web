"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  ThreeDViewIcon,
  CubeIcon,
  Gps01Icon,
  GpsSignal01Icon,
} from "@hugeicons/core-free-icons";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const activeToggleClassName =
  "bg-primary text-primary hover:bg-primary/90 hover:text-primary";

interface MapControlsProps {
  isTilted: boolean;
  onTiltToggle: (pressed: boolean) => void;
  isLocating: boolean;
  isSearchingLocation: boolean;
  onLocateToggle: () => void;
}

export function MapControls({
  isTilted,
  onTiltToggle,
  isLocating,
  isSearchingLocation,
  onLocateToggle,
}: MapControlsProps) {
  return (
    <div className="absolute right-4 bottom-28 z-50 flex flex-col gap-2">
      <Toggle
        variant="secondary"
        size="lg"
        aria-label="Toggle map tilt"
        pressed={isTilted}
        onPressedChange={onTiltToggle}
        className={cn(
          "aspect-square shadow-md",
          isTilted && activeToggleClassName,
        )}
      >
        <HugeiconsIcon icon={isTilted ? CubeIcon : ThreeDViewIcon} />
      </Toggle>

      <Toggle
        variant="secondary"
        size="lg"
        aria-label="Locate me"
        pressed={isLocating}
        onPressedChange={onLocateToggle}
        className={cn(
          "aspect-square shadow-md",
          isLocating && activeToggleClassName,
        )}
      >
        <HugeiconsIcon
          icon={isLocating ? GpsSignal01Icon : Gps01Icon}
          className={isSearchingLocation ? "animate-rotate" : undefined}
        />
      </Toggle>
    </div>
  );
}
