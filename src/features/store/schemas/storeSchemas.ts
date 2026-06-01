import { z } from "zod";

const TimeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)");

const BuildingIdSchema = z
  .string()
  .trim()
  .regex(
    /^bld_-?\d+\.\d{7}_-?\d+\.\d{7}$/,
    "Please select a valid building from the map",
  )
  .refine((value) => !value.startsWith("bld_unk_"), {
    message: "Please select a building from the map",
  });

export const RegisterStoreSchema = z.object({
  name: z.string().min(3, "Store name must be at least 3 characters long"),
  openTime: TimeSchema,
  closeTime: TimeSchema,
  description: z.string().trim().max(1000).optional(),
  buildingId: BuildingIdSchema,
});

export type RegisterStoreData = z.infer<typeof RegisterStoreSchema>;
