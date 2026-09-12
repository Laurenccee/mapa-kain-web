"use client";

import * as React from "react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { IMAGE_UPLOAD } from "@/utils/constants/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ImageCropDialogProps {
  open: boolean;
  cropSrc: string;
  pendingFileName: string;
  aspect: number;
  isAvatar: boolean;
  maxDimension: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
): Crop {
  return centerCrop(
    makeAspectCrop({ unit: "%", width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight,
  );
}

async function getCroppedFile(
  image: HTMLImageElement,
  crop: Crop,
  originalFileName: string,
  maxDimension: number,
): Promise<File> {
  const canvas = document.createElement("canvas");
  const pixelX = (crop.x / 100) * image.naturalWidth;
  const pixelY = (crop.y / 100) * image.naturalHeight;
  const pixelWidth = (crop.width / 100) * image.naturalWidth;
  const pixelHeight = (crop.height / 100) * image.naturalHeight;

  // Downscale to maxDimension while cropping so oversized photos don't inflate upload/download size
  const scale = Math.min(1, maxDimension / Math.max(pixelWidth, pixelHeight));
  canvas.width = Math.round(pixelWidth * scale);
  canvas.height = Math.round(pixelHeight * scale);

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(
    image,
    pixelX,
    pixelY,
    pixelWidth,
    pixelHeight,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas is empty"));
        const ext = originalFileName.split(".").pop() || "jpg";
        resolve(new File([blob], `cropped.${ext}`, { type: blob.type }));
      },
      "image/jpeg",
      IMAGE_UPLOAD.JPEG_QUALITY,
    );
  });
}

export default function ImageCropDialog({
  open,
  cropSrc,
  pendingFileName,
  aspect,
  isAvatar,
  maxDimension,
  onConfirm,
  onCancel,
}: ImageCropDialogProps) {
  const imgRef = React.useRef<HTMLImageElement>(null);
  const [crop, setCrop] = React.useState<Crop>();

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  };

  const handleConfirm = async () => {
    if (!imgRef.current || !crop) return;
    const croppedFile = await getCroppedFile(
      imgRef.current,
      crop,
      pendingFileName,
      maxDimension,
    );
    onConfirm(croppedFile);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Crop Image</DialogTitle>
        </DialogHeader>
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
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Apply</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
