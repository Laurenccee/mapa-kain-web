'use client';

import * as React from 'react';
import Image from 'next/image';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Camera, Utensils, User } from 'lucide-react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AppImagePickerProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  variant?: 'avatar' | 'menu';
  disabled?: boolean;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

async function getCroppedFile(
  image: HTMLImageElement,
  crop: Crop,
  originalFileName: string,
): Promise<File> {
  const canvas = document.createElement('canvas');
  const pixelX = (crop.x / 100) * image.naturalWidth;
  const pixelY = (crop.y / 100) * image.naturalHeight;
  const pixelWidth = (crop.width / 100) * image.naturalWidth;
  const pixelHeight = (crop.height / 100) * image.naturalHeight;

  canvas.width = pixelWidth;
  canvas.height = pixelHeight;

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelX,
    pixelY,
    pixelWidth,
    pixelHeight,
    0,
    0,
    pixelWidth,
    pixelHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Canvas is empty'));
      const ext = originalFileName.split('.').pop() || 'jpg';
      resolve(new File([blob], `cropped.${ext}`, { type: blob.type }));
    }, 'image/jpeg');
  });
}

export function AppImagePicker<T extends FieldValues>({
  name,
  control,
  label,
  variant = 'avatar',
  disabled = false,
}: AppImagePickerProps<T>) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const imgRef = React.useRef<HTMLImageElement>(null);
  const isAvatar = variant === 'avatar';
  const aspect = isAvatar ? 1 : 16 / 9;

  const [preview, setPreview] = React.useState<string | null>(null);
  const [cropSrc, setCropSrc] = React.useState<string | null>(null);
  const [crop, setCrop] = React.useState<Crop>();
  const [pendingFileName, setPendingFileName] = React.useState('');
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
          e.target.value = '';
        };

        const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
          const { width, height } = e.currentTarget;
          setCrop(centerAspectCrop(width, height, aspect));
        };

        const handleCropConfirm = async () => {
          if (!imgRef.current || !crop) return;
          try {
            const croppedFile = await getCroppedFile(
              imgRef.current,
              crop,
              pendingFileName,
            );
            const previewUrl = URL.createObjectURL(croppedFile);
            if (preview) URL.revokeObjectURL(preview);
            setPreview(previewUrl);
            onChange(croppedFile);
          } finally {
            setIsCropOpen(false);
            if (cropSrc) URL.revokeObjectURL(cropSrc);
            setCropSrc(null);
          }
        };

        const handleCropCancel = () => {
          setIsCropOpen(false);
          if (cropSrc) URL.revokeObjectURL(cropSrc);
          setCropSrc(null);
        };

        return (
          <>
            <Dialog
              open={isCropOpen}
              onOpenChange={(open) => !open && handleCropCancel()}
            >
              <DialogContent showCloseButton={false} className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Crop Image</DialogTitle>
                </DialogHeader>
                {cropSrc && (
                  <div className="flex justify-center overflow-hidden rounded-lg">
                    <ReactCrop
                      crop={crop}
                      onChange={(_, pct) => setCrop(pct)}
                      aspect={aspect}
                      circularCrop={isAvatar}
                      keepSelection
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        ref={imgRef}
                        src={cropSrc}
                        alt="Crop preview"
                        onLoad={handleImageLoad}
                        className="max-h-96 w-auto"
                      />
                    </ReactCrop>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={handleCropCancel}>
                    Cancel
                  </Button>
                  <Button onClick={handleCropConfirm}>Apply</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div
              className={cn(
                'grid w-full gap-2',
                isAvatar && 'items-center justify-center text-center',
              )}
            >
              {label && (
                <Label className="text-xs uppercase tracking-widest text-muted-foreground">
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
                  'relative group cursor-pointer overflow-hidden border-2 border-dashed transition-all hover:bg-secondary/50',
                  'flex flex-col items-center justify-center bg-secondary outline-none focus-within:ring-2 focus-within:ring-ring',
                  isAvatar ? 'h-32 w-32 rounded-2xl' : 'h-48 w-full rounded-xl',
                  hasError ? 'border-destructive' : 'border-border',
                  disabled && 'opacity-50 cursor-not-allowed',
                )}
              >
                {preview || (typeof value === 'string' && value) ? (
                  <Image
                    src={preview || value}
                    alt="Upload preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    {isAvatar ? (
                      <User className="h-8 w-8" />
                    ) : (
                      <Utensils className="h-8 w-8" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Add {isAvatar ? 'Photo' : 'Food Photo'}
                    </span>
                  </div>
                )}

                <div className="absolute bottom-2 right-2 rounded-full border-2 border-background bg-primary p-1.5 shadow-sm">
                  <Camera className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>

              {!hasError && (
                <p className="text-xs text-muted-foreground">
                  {isAvatar
                    ? 'Let owners recognize you'
                    : "Show them what's cooking today!"}
                </p>
              )}

              {hasError && (
                <p className="text-xs font-medium text-destructive">
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
