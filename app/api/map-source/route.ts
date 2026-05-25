// Location: src/app/api/.../route.ts (ROUTES.MAP_SOURCE)
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://tiles.openfreemap.org/planet", {
      headers: {
        "User-Agent": "MapaKain/1.0 (contact@mapakain.app)",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return new NextResponse(
        `Failed to fetch from OpenFreeMap: ${res.statusText}`,
        {
          status: res.status,
        },
      );
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
        // ✅ Instructs MapLibre that this payload contains public configuration specifications
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching OpenFreeMap planet source:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
