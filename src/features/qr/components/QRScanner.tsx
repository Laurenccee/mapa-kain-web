// features/qr/components/QRScanner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Html5QrcodeScanner,
  Html5QrcodeScanType,
  Html5QrcodeSupportedFormats,
} from 'html5-qrcode';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  fps?: number;
  qrbox?: number;
}

export function QRScanner({
  onScanSuccess,
  fps = 10,
  qrbox = 250,
}: QRScannerProps) {
  const [scannerError, setScannerError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // 1. Initialize the scanner instance targeted at our div container ID
    const scanner = new Html5QrcodeScanner(
      'qr-reader-target',
      {
        fps: fps,
        qrbox: { width: qrbox, height: qrbox },
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        // Set to true to show camera permission interface built into library
        rememberLastUsedCamera: true,
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
      },
      /* verbose= */ false,
    );

    scannerRef.current = scanner;

    // 2. Start scanning
    scanner.render(
      (decodedText) => {
        // Success handler
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // We leave this empty because the library constantly prints frame-analysis logs
        // which will flood your console. Real errors are caught below.
      },
    );

    // 3. Clean up the camera streams when the component unmounts
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error('Failed to clear QR Scanner during unmount:', err);
        });
      }
    };
  }, [onScanSuccess, fps, qrbox]);

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col gap-4">
      {/* The html5-qrcode library injects its video stream, canvas layers, 
        and built-in camera switching dropdown directly into this ID selector.
      */}
      <div
        id="qr-reader-target"
        className="overflow-hidden rounded-xl border border-border bg-black [&_video]:w-full [&_video]:h-auto [&_button]:bg-secondary [&_button]:text-secondary-foreground [&_button]:px-4 [&_button]:py-2 [&_button]:rounded-md [&_select]:p-2 [&_select]:rounded-md [&_select]:bg-background [&_select]:border"
      />

      {scannerError && (
        <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-md">
          {scannerError}
        </p>
      )}
    </div>
  );
}
