// app/(protected)/(qr)/my-qr/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { generateUserQrCode } from "@/features/qr/utils/generateUserQrCode";
import { QRCodeDisplay } from "@/features/qr/components/QRCodeDisplay";
import { getServerUser } from "@/features/auth/utils/serverAuth";

export default async function MyQrPage() {
  const user = await getServerUser();
  const qrSvgMarkup = await generateUserQrCode({ userId: user?.id });

  return (
    <section className="flex w-full flex-1 flex-col items-center justify-center gap-8 px-8">
      <div className="flex w-full flex-col gap-8 sm:max-w-xs">
        <Card>
          <CardContent className="flex items-center justify-center">
            <QRCodeDisplay svgMarkup={qrSvgMarkup} />
          </CardContent>
          <div>
            <h1 className="text-primary text-center text-xl tracking-tight">
              Suki QR Code
            </h1>
            <p className="text-muted-foreground text-center">
              Show this to the cashier to earn points
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
