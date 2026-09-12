"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import StoreSheet from "@/features/store/components/store/StoreSheet";
import { MAPS } from "@/utils/constants/maps";
import type { ClaimedStore } from "@/features/store/types/store";

export default function NearYouSection() {
  const [stores, setStores] = useState<ClaimedStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStore, setActiveStore] = useState<ClaimedStore | null>(null);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const cachedLoc = localStorage.getItem(MAPS.CACHE_KEY);
        if (!cachedLoc) {
          setIsLoading(false);
          return;
        }

        const { timestamp } = JSON.parse(cachedLoc);
        if (Date.now() - timestamp > MAPS.ONE_DAY) {
          setIsLoading(false);
          return;
        }

        const supabase = createClient();
        const { data, error } = await supabase
          .from("stores")
          .select("id, name, description, building_id, open_time, close_time")
          .not("building_id", "is", null);

        if (error) throw error;

        setStores(data as ClaimedStore[]);
      } catch (err) {
        console.error("Failed to load stores:", err);
        setError("Failed to load stores");
      } finally {
        setIsLoading(false);
      }
    };

    loadStores();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="mt-3 h-6 w-32" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Could not load stores</p>
      </Card>
    );
  }

  if (stores.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">
          No canteens available.{" "}
          <a href="/map" className="font-medium text-primary hover:underline">
            Browse all stores
          </a>
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="mb-4 font-serif text-lg">Near You</h3>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <div
            key={store.id}
            className="group cursor-pointer rounded-lg border p-4 transition-shadow hover:shadow-md"
            onClick={() => setActiveStore(store)}
          >
            <div className="bg-secondary/20 h-48 w-full overflow-hidden rounded-md">
              <img
                src="/placeholder/store.jpg"
                alt={store.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="mt-3">
              <h4 className="truncate font-medium">{store.name}</h4>
              <p className="text-muted-foreground truncate text-sm">
                {store.description || "No description available"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full text-sm"
              onClick={(e) => {
                e.stopPropagation();
                setActiveStore(store);
              }}
            >
              View Menu
            </Button>
          </div>
        ))}
      </div>

      <StoreSheet store={activeStore} onClose={() => setActiveStore(null)} />
    </Card>
  );
}
