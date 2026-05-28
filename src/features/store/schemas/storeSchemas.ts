import { z } from "zod";

// Validates the GeoJSON Polygon geometry returned by Turf/MapLibre
const GeoJsonPolygonSchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z.array(z.array(z.array(z.number()))), // Polygon coordinates structure
});

export const RegisterStoreSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters long"),
  openTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  closeTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  description: z.string().optional(),
  
  // Map Selection details passed from the MapDisplay selection state
  mapSelection: z.object({
    buildingId: z.string().min(1, "Please select your store building on the map"),
    latitude: z.number(),
    longitude: z.number(),
    geometry: GeoJsonPolygonSchema,
    properties: z.record(z.string(), z.any()).optional(),
  }),
});

export type RegisterStoreData = z.infer<typeof RegisterStoreSchema>;
