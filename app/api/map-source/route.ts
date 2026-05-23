import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://tiles.openfreemap.org/planet', {
      headers: {
        'User-Agent': 'MapaKain/1.0 (contact@mapakain.app)',
      },
      next: { revalidate: 3600 }, // Cache the fetch response in Next.js for 1 hour
    });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch from OpenFreeMap: ${res.statusText}`, {
        status: res.status,
      });
    }

    const data = await res.json();

    return NextResponse.json(data, {
      headers: {
        // Cache the response at the edge/CDN level for 1 hour
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching OpenFreeMap planet source:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
