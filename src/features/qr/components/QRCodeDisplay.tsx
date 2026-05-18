'use client';

import { QRCodeDisplayProps } from '../types/qrTypes';

export function QRCodeDisplay({ svgMarkup }: QRCodeDisplayProps) {
  // Graceful fallback for unauthenticated states or generation failures
  if (!svgMarkup) {
    return (
      <div className="w-full aspect-square bg-muted flex items-center justify-center rounded-md text-sm text-muted-foreground p-4 text-center border border-dashed">
        Unable to load QR code. Please ensure you are logged in.
      </div>
    );
  }

  return (
    <div
      className="w-full aspect-square [&>svg]:w-full [&>svg]:h-auto bg-transparent p-4"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
}
