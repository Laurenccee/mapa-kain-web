'use client';

import { useAuth } from '@/features/auth/hooks/use-auth';

export default function Feed() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="space-y-6 pb-20">
      {/* 1. Near You Section - Visible to All */}
      {/* <NearYouSection /> */}

      {/* 2. Top Carinderias Section - Visible to All */}
      {/* <TopRatedSection /> */}

      {/* 3. Favorites Section - Context Gated */}
      <div className="px-4">
        <h3 className="font-serif text-lg mb-3">My Favorites</h3>
        {/* {isAuthenticated ? (
          <FavoritesSection />
        ) : (
          <FavoritesTeaser />
        )} */}
      </div>
    </main>
  );
}
