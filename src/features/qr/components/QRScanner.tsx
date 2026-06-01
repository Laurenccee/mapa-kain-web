// features/qr/components/QRScanner.tsx
"use client";

import { useEffect, useRef, useState } from "react";
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

  const clearScannerTarget = () => {
    const target = document.getElementById("qr-reader-target");
    if (target) target.innerHTML = "";
  };

  const resumeScannerAfterDialog = () => {
    const provider = qrEngineRef.current;
    if (!provider || !provider.isScanning) return;

    try {
      provider.resume();
    } catch (err) {
      console.debug("Scanner resume skipped:", err);
    }
  };

  const handleResultDialogOpenChange = (open: boolean) => {
    setIsResultDialogOpen(open);

    if (!open) {
      scanLockRef.current = false;
      setScannedData(null);
      setScanStatus("Scanning automatically...");
      resumeScannerAfterDialog();
    }
  };

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

  useEffect(() => {
    if (isDesktop === null || isDesktop) return;

    clearScannerTarget();
    setCameraError(null);
    setScanStatus("Starting camera...");
    setScannedData(null);
    setIsResultDialogOpen(false);
    scanLockRef.current = false;

    const html5QrcodeProvider = new Html5Qrcode("qr-reader-target", {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      useBarCodeDetectorIfSupported: false,
      verbose: false,
    });
    qrEngineRef.current = html5QrcodeProvider;
    let isMounted = true;

    const startScanner = async () => {
      try {
        await html5QrcodeProvider.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: (viewfinderWidth, viewfinderHeight) => {
              const edge = Math.floor(
                Math.min(viewfinderWidth, viewfinderHeight) * 0.72,
              );
              return { width: edge, height: edge };
            },
          },
          (decodedText) => {
            if (scanLockRef.current) return;
            scanLockRef.current = true;

            console.log("Scanned QR:", decodedText);
            setScanStatus("QR detected");
            setScannedData(decodedText);
            setIsResultDialogOpen(true);
            onScanSuccessRef.current(decodedText);

            try {
              html5QrcodeProvider.pause(true);
            } catch (err) {
              console.debug("Scanner pause skipped:", err);
            }
          },
          () => {},
        );

        if (isMounted) {
          setScanStatus("Scanning automatically...");
        }

        if (!isMounted && html5QrcodeProvider.isScanning) {
          await html5QrcodeProvider.stop().catch(() => undefined);
          try {
            html5QrcodeProvider.clear();
          } catch {
            // Ignore clear errors for stale strict-mode runs.
          }
        }
      } catch (err) {
        if (!isMounted) return;
        console.error("Camera initialization failed:", err);
        setScanStatus("Camera unavailable");
        setCameraError("Could not access the rear camera.");
      }
    };

    void startScanner();

    return () => {
      isMounted = false;

      const provider = qrEngineRef.current;
      qrEngineRef.current = null;

      if (!provider) return;

      const safeClear = () => {
        try {
          provider.clear();
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

        clearScannerTarget();
      };

      const stopAndClear = async () => {
        if (provider.isScanning) {
          await provider.stop().catch((err) => {
            const message =
              err instanceof Error ? err.message.toLowerCase() : String(err);

            if (
              !message.includes("not running") &&
              !message.includes("removechild") &&
              !message.includes("not a child")
            ) {
              console.error("Failed to stop scanner smoothly:", err);
            }
          });
        }

        safeClear();
      };

      void stopAndClear();
    };
  }, [isDesktop]);

  if (isDesktop === null) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-sm text-white">
        Loading...
      </div>
    );
  }

  // Desktop View
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

  // Mobile View
  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {cameraError ? (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center text-white">
          <div className="mb-4 rounded-2xl border border-white/20 bg-black/55 p-4 backdrop-blur">
            <CameraOff className="text-destructive mx-auto mb-2 h-8 w-8" />
            <p className="text-sm text-white/90">{cameraError}</p>
          </div>

          <Button
            asChild
            variant="secondary"
            className="w-full max-w-xs text-sm font-semibold tracking-[0.14em] uppercase"
          >
            <Link href={ROUTES.MY_QR}>Go to QR Page</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative h-[92vw] max-h-88 w-[92vw] max-w-88 rounded-[2rem] shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>

          <div className="absolute top-24 left-1/2 z-30 -translate-x-1/2 rounded-lg bg-black/45 px-4 py-2 backdrop-blur-sm">
            <p className="text-center text-base tracking-[0.18em] text-white/90 uppercase">
              Scan QR Code
            </p>
            <p className="mt-1 text-center text-[11px] tracking-wide text-white/70">
              {scanStatus}
            </p>
          </div>

          <div className="absolute right-0 bottom-8 left-0 z-30 flex justify-center px-6">
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

      <style jsx>{`
        :global(#qr-reader-target #qr-shaded-region) {
          border: 0 !important;
          background: transparent !important;
          outline: none !important;
        }

        :global(#qr-reader-target #qr-shaded-region > div) {
          border: 0 !important;
          box-shadow: none !important;
        }
      `}</style>
    </div>
  );
}
