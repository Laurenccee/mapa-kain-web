// features/qr/components/QRScanner.tsx
"use client";

import { useCallback, useState } from "react";
import { Laptop, CameraOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { ROUTES } from "@/utils/constants/routes";
import { useQrScanner } from "../hooks/useQrScanner";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const handleDecoded = useCallback(
    (decodedText: string) => {
      setScannedData(decodedText);
      setIsResultDialogOpen(true);
      onScanSuccess(decodedText);
    },
    [onScanSuccess],
  );

  const { isDesktop, cameraError, startScanner, resumeScanning, elementId } =
    useQrScanner(handleDecoded);

  const handleResultDialogOpenChange = (open: boolean) => {
    setIsResultDialogOpen(open);

    if (!open) {
      setScannedData(null);
      resumeScanning();
    }
  };

  if (isDesktop === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-white">
        Loading...
      </div>
    );
  }

  if (isDesktop) {
    return (
      <div className="mx-auto flex h-full w-full max-w-md flex-col items-center justify-center p-6 text-center">
        <div className="bg-muted text-muted-foreground mb-4 rounded-full p-4">
          <Laptop className="h-8 w-8" />
        </div>
        <h2 className="mb-2 text-xl font-bold tracking-tight">
          Scanner Unavailable
        </h2>
        <p className="text-muted-foreground text-sm">
          The QR Code scanner is optimized for mobile devices. Please switch to
          your phone to scan.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {cameraError ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="mb-4 rounded-2xl border border-white/20 bg-black/55 p-4 backdrop-blur">
            <CameraOff className="text-destructive mx-auto mb-2 h-8 w-8" />
            <p className="text-sm text-white/90">{cameraError}</p>
          </div>

          <div className="flex w-full max-w-xs flex-col gap-2">
            <Button
              onClick={() => {
                void startScanner();
              }}
              variant="secondary"
              className="h-12 text-sm font-semibold tracking-[0.12em] uppercase"
            >
              Retry Camera
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-12 text-sm font-semibold tracking-[0.12em] uppercase"
            >
              <Link href={ROUTES.MY_QR}>Go to QR Page</Link>
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="absolute top-24 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-black/45 px-4 py-2 backdrop-blur-sm">
            <p className="text-center text-base tracking-[0.18em] text-white/90 uppercase">
              Scan QR Code
            </p>
          </div>

          <div className="absolute right-0 bottom-16 left-0 z-30 flex justify-center px-6">
            <Button
              asChild
              variant="secondary"
              className="h-14 w-full max-w-xs text-base tracking-[0.14em] uppercase"
            >
              <Link href={ROUTES.MY_QR}>Go to QR Page</Link>
            </Button>
          </div>
        </>
      )}

      <div
        id={elementId}
        className="h-full w-full [&_video]:h-full! [&_video]:w-full! [&_video]:object-cover"
      />

      <Dialog
        open={isResultDialogOpen}
        onOpenChange={handleResultDialogOpenChange}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>QR Code Scanned</DialogTitle>
            <DialogDescription>
              The scanned QR content is shown below.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-muted/50 rounded-md border p-3">
            <p className="text-foreground font-mono text-xs leading-relaxed break-all">
              {scannedData}
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleResultDialogOpenChange(false)}
            >
              Scan Again
            </Button>
            <Button asChild>
              <Link href={ROUTES.MY_QR}>Open My QR</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

