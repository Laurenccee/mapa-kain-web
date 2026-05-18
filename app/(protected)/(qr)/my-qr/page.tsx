// app/(protected)/(qr)/my-qr/page.tsx
import { Card, CardContent } from '@/components/ui/card';
import { generateUserQrCode } from '@/features/qr/utils/generateUserQrCode';
import { QRCodeDisplay } from '@/features/qr/components/QRCodeDisplay';
import { getServerUser } from '@/features/auth/utils/serverAuth';
import { SpanStatus } from 'next/dist/trace';

export default async function MyQrPage() {
  const user = await getServerUser();
  const qrSvgMarkup = await generateUserQrCode({ userId: user?.id });

  return (
    <section className="flex flex-1 justify-center items-center w-full px-4 flex-col gap-8">
      <div className="sm:max-w-xs w-full flex flex-col gap-8">
        <Card>
          <CardContent className="flex justify-center items-center">
            <QRCodeDisplay svgMarkup={qrSvgMarkup} />
          </CardContent>
          <div>
            <h1 className="text-center text-xl tracking-tight text-primary">
              Suki QR Code
            </h1>
            <p className="text-center text-muted-foreground">
              Show this to the cashier to earn points
            </p>
          </div>
        </Card>
      </div>
    </section>
  );
}
