const DEFAULT_PREVIEW_IMAGE = "/placeholder/food_1.png";

export function toPreviewImageUrl(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  if (value instanceof File) {
    return URL.createObjectURL(value);
  }

  return DEFAULT_PREVIEW_IMAGE;
}

export function toPreviewPrice(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(/,/g, "").trim());

    return Number.isFinite(normalized) ? normalized : 0;
  }

  return 0;
}
