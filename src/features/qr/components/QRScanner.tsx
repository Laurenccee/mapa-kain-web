// features/qr/components/QRScanner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Laptop, CameraOff } from 'lucide-react';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
}

export function QRScanner({ onScanSuccess }: QRScannerProps) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrEngineRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isDesktop === null || isDesktop) return;

    const html5QrcodeProvider = new Html5Qrcode('qr-reader-target');
    qrEngineRef.current = html5QrcodeProvider;

    html5QrcodeProvider
      .start(
        { facingMode: 'environment' },
        { fps: 15 },
        (decodedText) => {
          onScanSuccess(decodedText);
        },
        () => {},
      )
      .catch((err) => {
        console.error('Camera initialization failed:', err);
        setCameraError('Could not access the rear camera.');
      });

    return () => {
      if (qrEngineRef.current) {
        const provider = qrEngineRef.current;

        if (provider.isScanning) {
          provider
            .stop()
            .then(() => {
              setTimeout(() => {
                try {
                  provider.clear();
                } catch (e) {
                  console.debug('Scanner container cleared safely.', e);
                }
              }, 0);
            })
            .catch((err) =>
              console.error('Failed to stop scanner smoothly:', err),
            );
        }
      }
    };
  }, [isDesktop, onScanSuccess]);

  if (isDesktop === null) {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center text-white text-sm">
        Loading...
      </div>
    );
  }

  // Desktop View
  if (isDesktop) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="bg-muted p-4 rounded-full mb-4 text-muted-foreground">
          <Laptop className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold tracking-tight mb-2">
          Scanner Unavailable
        </h2>
        <p className="text-sm text-muted-foreground">
          The QR Code scanner is optimized for mobile devices. Please switch to
          your phone to scan.
        </p>
      </div>
    );
  }

  // Mobile View
  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {cameraError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-20 text-white">
          <CameraOff className="h-8 w-8 mb-2 text-destructive" />
          <p className="text-sm">{cameraError}</p>
        </div>
      ) : (
        <>
          {/* Custom QR Target Overlap Layer (Simulating native app scanner view) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
            <div className="w-64 h-64 border-2 border-white/60 rounded-3xl relative">
              {/* Corner Accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary -mt-1 -ml-1 rounded-tl-md" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary -mt-1 -mr-1 rounded-tr-md" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary -mb-1 -ml-1 rounded-bl-md" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary -mb-1 -mr-1 rounded-br-md" />
            </div>
          </div>

          <p className="absolute bottom-16 left-0 right-0 text-center text-white/80 text-sm tracking-wide z-10 font-medium drop-shadow-md">
            Align QR code inside the frame
          </p>
        </>
      )}

      <div
        id="qr-reader-target"
        className="w-full h-full [&_video]:w-full! [&_video]:h-full! [&_video]:object-cover"
      />
    </div>
  );
}
