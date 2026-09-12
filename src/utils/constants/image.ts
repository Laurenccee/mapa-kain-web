export const IMAGE_UPLOAD = {
  // Mirrors `serverActions.bodySizeLimit` in next.config.ts
  MAX_SIZE_BYTES: 5 * 1024 * 1024,
  ALLOWED_MIME_TYPES: ["image/jpeg", "image/png", "image/webp"] as const,
  AVATAR_MAX_DIMENSION: 512,
  MENU_MAX_DIMENSION: 1600,
  JPEG_QUALITY: 0.8,
};
