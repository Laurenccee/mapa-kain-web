// features/qr/components/QRScanner.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
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

const SCANNER_ELEMENT_ID = "qr-reader-target";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("Starting camera...");
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false);

  const qrEngineRef = useRef<Html5Qrcode | null>(null);
  const onScanSuccessRef = useRef(onScanSuccess);
  const scanLockRef = useRef(false);
  const isStartingRef = useRef(false);

  useEffect(() => {
    onScanSuccessRef.current = onScanSuccess;
  }, [onScanSuccess]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearScannerTarget = useCallback(() => {
    const target = document.getElementById(SCANNER_ELEMENT_ID);
    if (target) target.innerHTML = "";
  }, []);

  const stopScanner = useCallback(async () => {
    const provider = qrEngineRef.current;
    qrEngineRef.current = null;
    isStartingRef.current = false;

    if (provider) {
      try {
        if (provider.isScanning) {
          await provider.stop();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);

        if (
          !message.includes("not running") &&
          !message.includes("removechild") &&
          !message.includes("not a child")
        ) {
          console.error("Failed to stop scanner smoothly:", err);
        }
      }

      try {
        await provider.clear();
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);

        if (
          !message.includes("removechild") &&
          !message.includes("not a child")
        ) {
          console.debug("Scanner clear skipped:", err);
        }
      }
    }

    if (!qrEngineRef.current || qrEngineRef.current === provider) {
      clearScannerTarget();
    }
  }, [clearScannerTarget]);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;

      console.log("Scanned QR:", decodedText);
      setScanStatus("QR detected");
      setScannedData(decodedText);
      setIsResultDialogOpen(true);
      onScanSuccessRef.current(decodedText);

      void stopScanner();
    },
    [stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (isDesktop === null || isDesktop) return;
    if (isStartingRef.current || qrEngineRef.current?.isScanning) return;

    setCameraError(null);
    setScanStatus("Starting camera...");
    scanLockRef.current = false;

    await stopScanner();
    isStartingRef.current = true;

    const provider = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    qrEngineRef.current = provider;

    const scanConfig = {
      fps: 6,
      qrbox: { width: 250, height: 250 },
    };

    try {
      await provider.start(
        { facingMode: "environment" },
        scanConfig,
        handleScanSuccess,
        () => {
          // Ignore per-frame decode failures while scanning.
        },
      );

      setScanStatus("Scanning...");
    } catch (err) {
      console.error("Camera initialization failed:", err);
      setScanStatus("Camera error");
      setCameraError(toErrorMessage(err));
      await stopScanner();
    } finally {
      isStartingRef.current = false;
    }
  }, [handleScanSuccess, isDesktop, stopScanner]);

  const resumeScannerAfterDialog = useCallback(() => {
    void startScanner();
  }, [startScanner]);

  const handleResultDialogOpenChange = (open: boolean) => {
    setIsResultDialogOpen(open);

    if (!open) {
      scanLockRef.current = false;
      setScannedData(null);
      resumeScannerAfterDialog();
    }
  };

  useEffect(() => {
    if (isDesktop === null || isDesktop) return;

    setScannedData(null);
    setIsResultDialogOpen(false);
    void startScanner();

    return () => {
      void stopScanner();
    };
  }, [isDesktop, startScanner, stopScanner]);

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

  const isActivelyScanning = scanStatus === "Scanning...";

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
        id="qr-reader-target"
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
