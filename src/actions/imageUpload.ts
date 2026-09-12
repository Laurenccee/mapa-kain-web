"use server";

import { guardServerAction } from "@/features/auth/utils/serverAuth";
import { createClient } from "@/lib/supabase/server";
import { IMAGE_UPLOAD } from "@/utils/constants/image";

interface UploadConfig {
  bucket: string;
  folderId: string;
  prefix: string;
  file: File;
  oldFilePath?: string | null;
}

function getStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const anchor = "/storage/v1/object/public/";
    const anchorIndex = url.pathname.indexOf(anchor);
    if (anchorIndex === -1) return null;

    const afterAnchor = url.pathname.slice(anchorIndex + anchor.length);
    const slashIndex = afterAnchor.indexOf("/");
    if (slashIndex === -1) return null;

    return afterAnchor.slice(slashIndex + 1);
  } catch {
    return null;
  }
}

async function uploadStorageFile({
  bucket,
  folderId,
  prefix,
  file,
  oldFilePath,
}: UploadConfig): Promise<string> {
  if (
    !IMAGE_UPLOAD.ALLOWED_MIME_TYPES.includes(
      file.type as (typeof IMAGE_UPLOAD.ALLOWED_MIME_TYPES)[number],
    )
  ) {
    throw new Error("Unsupported image type. Use JPEG, PNG, or WebP.");
  }
  if (file.size > IMAGE_UPLOAD.MAX_SIZE_BYTES) {
    throw new Error(
      `Image is too large. Max size is ${IMAGE_UPLOAD.MAX_SIZE_BYTES / (1024 * 1024)}MB.`,
    );
  }

  const supabase = await createClient();
  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${prefix}-${Date.now()}.${ext}`;
  const storagePath = `${folderId}/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(storagePath, file, { contentType: file.type });

  if (uploadError) throw uploadError;

  if (oldFilePath) {
    const path = getStoragePath(oldFilePath);
    if (path) {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (deleteError) throw deleteError;
    }
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
  return data.publicUrl;
}

export async function uploadAvatar(
  file: File,
  oldFilePath?: string | null,
): Promise<string> {
  const { user } = await guardServerAction();
  if (!user?.id) throw new Error("Unauthorized");

  return uploadStorageFile({
    bucket: "avatars",
    folderId: user.id,
    prefix: "avatar",
    file,
    oldFilePath,
  });
}

export async function uploadMenuImage(
  file: File,
  oldFilePath?: string | null,
  store_id?: string,
): Promise<string> {
  if (!store_id) throw new Error("Store ID is required");

  const { user } = await guardServerAction();
  if (!user?.id) throw new Error("Unauthorized");

  return uploadStorageFile({
    bucket: "menu",
    folderId: store_id,
    prefix: "menu",
    file,
    oldFilePath,
  });
}
