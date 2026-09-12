"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// html5-qrcode is only needed once this route renders.
const QRScanner = dynamic(
  () => import("@/features/qr/components/QRScanner").then((m) => m.QRScanner),
  { ssr: false, loading: () => <Skeleton className="h-full w-full" /> },
);

export default function QrScannerPage() {
  return (
    <main className="bg-background h-screen w-screen overflow-hidden">
      <QRScanner onScanSuccess={(text) => console.log(text)} />
    </main>
  );
}
