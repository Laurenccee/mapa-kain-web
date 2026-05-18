import QRCode from 'qrcode';
import { GenerateQrCode } from '../types/qrTypes';

export async function generateUserQrCode({
  userId,
  type = 'svg',
  margin = 0,
  errorCorrectionLevel = 'M',
}: GenerateQrCode): Promise<string | null> {
  if (!userId) return null;

  const baseUrl = process.env.SITE_URL || 'http://localhost:3000';
  const qrCodeUrl = `${baseUrl}/user/${userId}`;

  console.log('Generating QR code for URL:', qrCodeUrl);

  try {
    return await QRCode.toString(qrCodeUrl, {
      type: type,
      margin: margin,
      errorCorrectionLevel: errorCorrectionLevel,
      color: {
        dark: '#00613C',
        light: '#00000000',
      },
    });
  } catch (err) {
    console.error(`Failed to generate QR code for user ${userId}:`, err);
    return null;
  }
}
