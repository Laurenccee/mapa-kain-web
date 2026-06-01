import { BareboneQRScanner } from "@/features/qr/components/BareboneQRScanner";

export default function BareboneScannerPage() {
  return (
    <main className="bg-background flex h-full w-full flex-1 items-center justify-center p-4">
      <BareboneQRScanner />
    </main>
  );
}
