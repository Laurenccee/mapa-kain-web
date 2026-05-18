// app/(protected)/scan/page.tsx
'use client';

import { QRScanner } from '@/features/qr/components/QRScanner';

export default function QrScannerPage() {
  return (
    <main className="w-screen h-screen bg-background overflow-hidden">
      <QRScanner onScanSuccess={(text) => console.log(text)} />
    </main>
  );
}
