import { z } from "zod";

const isBrowser = typeof window !== "undefined";

export const MenuSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(255),
  description: z.string().trim().max(1000).optional(),
  price: z
    .union([z.string(), z.number()])
    .transform((value, ctx) => {
      if (typeof value === "number") {
        return value;
      }

      const normalized = value.replace(/,/g, "").trim();
      const parsed = Number(normalized);

      if (normalized === "" || !Number.isFinite(parsed)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Price must be a number",
        });
        return z.NEVER;
      }

      return parsed;
    })
    .refine((value) => value >= 0, {
      message: "Price cannot be negative",
    }),
  menu_image_url: z
    .union([
      z.string(),
      z.custom<File>(
        (val) => isBrowser && val instanceof File,
        "Invalid file format",
      ),
    ])
    .optional(),
  is_available: z.boolean(),
});

export type MenuData = z.output<typeof MenuSchema>;
export type MenuFormData = z.input<typeof MenuSchema>;
