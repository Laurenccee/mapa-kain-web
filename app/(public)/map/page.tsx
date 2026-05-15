import 'maplibre-gl/dist/maplibre-gl.css'; // See notes below
import MapDisplay from '@/features/map/components/MapDisplay';

export default function MapPage() {
  return (
    <main className="flex flex-1 w-full">
      <MapDisplay />
    </main>
  );
}
