import "server-only";

import { unstable_cache } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import type { ClaimedStore } from "../types/store";
import { CLAIMED_STORES_TAG } from "../constants/cache";

interface StoreClaimedBuildingRow {
  id: string;
  name: string;
  description: string | null;
  building_id: string | null;
  open_time: string;
  close_time: string;
}

// Claimed buildings are public, non-user-specific data ("Stores are viewable
// by everyone" RLS policy), so a cookie-less client lets this query be shared
// across every concurrent visitor instead of hitting Supabase per request.
const fetchClaimedStores = unstable_cache(
  async (): Promise<ClaimedStore[]> => {
    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );

    const { data, error } = await supabase
      .from("stores")
      .select("id, name, description, building_id, open_time, close_time")
      .not("building_id", "is", null);

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
  },
  ["claimed-stores"],
  { tags: [CLAIMED_STORES_TAG], revalidate: 60 },
);

export async function getClaimedStores(): Promise<ClaimedStore[]> {
  return fetchClaimedStores();
}

export async function getClaimedBuildingIds(): Promise<string[]> {
  const claimedStores = await getClaimedStores();
  return claimedStores.map((store) => store.building_id);
}
