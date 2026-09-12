"use client";

import * as React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Camera, Utensils, User } from "lucide-react";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

import { cn } from "@/lib/utils";
import { IMAGE_UPLOAD } from "@/utils/constants/image";
import { Label } from "@/components/ui/label";

// react-image-crop is only needed once a file is picked.
const ImageCropDialog = dynamic(() => import("./ImageCropDialog"), {
  ssr: false,
});

interface AppImagePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  variant?: "avatar" | "menu";
  disabled?: boolean;
}

export function AppImagePicker<T extends FieldValues>({
  name,
  control,
  label,
  variant = "avatar",
  disabled = false,
}: AppImagePickerProps<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isAvatar = variant === "avatar";
  const aspect = isAvatar ? 1 : 16 / 9;
  const maxDimension = isAvatar
    ? IMAGE_UPLOAD.AVATAR_MAX_DIMENSION
    : IMAGE_UPLOAD.MENU_MAX_DIMENSION;

  const [preview, setPreview] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [pendingFileName, setPendingFileName] = React.useState("");
  const [isCropOpen, setIsCropOpen] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState }) => {
        const hasError = !!fieldState.error;

        const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setCropSrc(URL.createObjectURL(file));
          setPendingFileName(file.name);
          setIsCropOpen(true);
          e.target.value = "";
        };

        const handleCropConfirm = async (croppedFile: File) => {
          const previewUrl = URL.createObjectURL(croppedFile);
          if (preview) URL.revokeObjectURL(preview);
          setPreview(previewUrl);
          onChange(croppedFile);
          setIsCropOpen(false);
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        };

        const handleCropCancel = () => {
          setIsCropOpen(false);
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        };

        return (
          <>
            {cropSrc && (
              <ImageCropDialog
                open={isCropOpen}
                cropSrc={cropSrc}
                pendingFileName={pendingFileName}
                aspect={aspect}
                isAvatar={isAvatar}
                maxDimension={maxDimension}
                onConfirm={handleCropConfirm}
                onCancel={handleCropCancel}
              />
            )}

            <div
              className={cn(
                "grid w-full gap-2",
                isAvatar && "items-center justify-center text-center",
              )}
            >
              {label && (
                <Label className="text-muted-foreground text-xs tracking-widest uppercase">
                  {label}
                </Label>
              )}

              <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                disabled={disabled}
              />

              <div
                onClick={() => inputRef.current?.click()}
                className={cn(
                  "group hover:bg-secondary/50 relative cursor-pointer overflow-hidden border-2 border-dashed transition-all",
                  "bg-secondary focus-within:ring-ring flex flex-col items-center justify-center outline-none focus-within:ring-2",
                  isAvatar ? "h-32 w-32 rounded-xl" : "h-48 w-full rounded-xl",
                  hasError ? "border-destructive" : "border-border",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                {preview || (typeof value === "string" && value) ? (
                  <Image
                    src={preview || value}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground z-40 flex flex-col items-center gap-2">
                    {isAvatar ? (
                      <User className="h-8 w-8" />
                    ) : (
                      <Utensils className="h-8 w-8" />
                    )}
                    <span className="text-[10px] font-bold tracking-widest uppercase">
                      Add {isAvatar ? "Photo" : "Food Photo"}
                    </span>
                  </div>
                )}

                <div className="border-background bg-primary absolute right-2 bottom-2 rounded-full border-2 p-1.5 shadow-sm">
                  <Camera className="text-primary-foreground h-3 w-3" />
                </div>
              </div>

              {!hasError && (
                <p className="text-muted-foreground text-xs">
                  {isAvatar
                    ? "Let owners recognize you"
                    : "Show them what's cooking today!"}
                </p>
              )}

              {hasError && (
                <p className="text-destructive text-xs font-medium">
                  {fieldState.error?.message}
                </p>
              )}
            </div>
          </>
        );
      }}
    />
  );
}
