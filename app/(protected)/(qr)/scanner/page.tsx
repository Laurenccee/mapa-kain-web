"use client";

import { QRScanner } from "@/features/qr/components/QRScanner";

export default function QrScannerPage() {
  return (
    <main className="bg-background h-screen w-screen overflow-hidden">
      <QRScanner onScanSuccess={(text) => console.log(text)} />
    </main>
  );
}
