import "server-only";

import { unstable_noStore } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ClaimedStore } from "../types/store";

interface StoreClaimedBuildingRow {
  id: string;
  name: string;
  description: string | null;
  building_id: string | null;
  open_time: string;
  close_time: string;
}

export async function getClaimedStores(): Promise<ClaimedStore[]> {
  unstable_noStore();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stores")
    .select("id, name, description, building_id, open_time, close_time");

  if (error) {
    console.error("Failed to fetch claimed stores:", error.message);
    return [];
  }

  const rows = (data ?? []) as StoreClaimedBuildingRow[];
  const claimedStores = rows.filter(
    (store): store is ClaimedStore =>
      typeof store.building_id === "string" && store.building_id.length > 0,
  );

  const uniqueByBuilding = new Map<string, ClaimedStore>();
  for (const store of claimedStores) {
    uniqueByBuilding.set(store.building_id, store);
  }

  return Array.from(uniqueByBuilding.values());
}

export async function getClaimedBuildingIds(): Promise<string[]> {
  const claimedStores = await getClaimedStores();
  return claimedStores.map((store) => store.building_id);
}
