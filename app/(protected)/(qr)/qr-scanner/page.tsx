// app/(protected)/scan/page.tsx
'use client';

import { useState } from 'react';
import { QRScanner } from '@/features/qr/components/QRScanner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function QrScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  //   const handleScanSuccess = async (decodedText: string) => {
  //     // Prevent simultaneous twin-scans while processing a single request
  //     if (isProcessing) return;

  //     setIsProcessing(true);
  //     setScanResult(decodedText);
  //     setStatusMessage(null);

  //     try {
  //       // 1. Parse out the userId from the absolute scanned URL string
  //       // Expected format: http://domain.com/user/[userId]
  //       const urlParts = decodedText.split('/user/');
  //       const scannedUserId = urlParts;

  //       if (!scannedUserId) {
  //         throw new Error('Invalid QR Code structure.');
  //       }

  //       // 2. Submit data to your secure authentication-guarded server action
  //       const result = await awardStampAction(scannedUserId);

  //       if (result.success) {
  //         setStatusMessage({
  //           success: true,
  //           message: 'Stamp successfully awarded!',
  //         });
  //       } else {
  //         setStatusMessage({
  //           success: false,
  //           message: result.error || 'Failed to award stamp.',
  //         });
  //       }
  //     } catch (err: any) {
  //       setStatusMessage({
  //         success: false,
  //         message: err.message || 'An error occurred.',
  //       });
  //     } finally {
  //       setIsProcessing(false);
  //     }
  //   };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 gap-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-serif">
            Scan Stamp Code
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Render our custom client scanning viewport hook */}
          {/* {!statusMessage?.success && (
            <QRScanner onScanSuccess={handleScanSuccess} />
          )} */}

          {/* User Feedback Interface */}
          {isProcessing && (
            <p className="text-center text-sm text-muted-foreground animate-pulse">
              Processing transaction, holding connection open...
            </p>
          )}

          {statusMessage && (
            <div
              className={`p-4 rounded-xl border text-center text-sm font-medium ${
                statusMessage.success
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              {statusMessage.message}
              {statusMessage.success && (
                <button
                  onClick={() => setStatusMessage(null)}
                  className="mt-3 block w-full text-xs underline cursor-pointer text-center"
                >
                  Scan Next Customer
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
