import "server-only";

import { unstable_noStore } from "next/cache";

import { createClient } from "@/lib/supabase/server";

interface StoreClaimedBuildingRow {
  building_id: string | null;
}

export async function getClaimedBuildingIds(): Promise<string[]> {
  unstable_noStore();

  const supabase = await createClient();
  const { data, error } = await supabase.from("stores").select("building_id");

  if (error) {
    console.error("Failed to fetch claimed building IDs:", error.message);
    return [];
  }

  const claimedBuildingIds = (data as StoreClaimedBuildingRow[])
    .map((store) => store.building_id)
    .filter(
      (buildingId): buildingId is string =>
        typeof buildingId === "string" && buildingId.length > 0,
    );

  return Array.from(new Set(claimedBuildingIds));
}
