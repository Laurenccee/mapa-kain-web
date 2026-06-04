import { Feature, Polygon } from "geojson";

export interface MapDisplayProps {
  mode?: "view" | "select";
  onBuildingSelect?: (result: BuildingSelectionResult | null) => void;
  claimedBuildingIds?: string[];
  selectClaimedOnly?: boolean;
}

export interface BuildingSelectionResult {
  buildingId: string;
  properties: Record<string, unknown>;
  feature: Feature<Polygon>;
}

export interface SelectedBuilding {
  id: string | number;
  properties: Record<string, any>;
}

export interface UseMapLayersOptions {
  onBuildingSelect?: (result: BuildingSelectionResult | null) => void;
  canSelect?: boolean;
  claimedBuildingIds?: string[];
  selectClaimedOnly?: boolean;
}
