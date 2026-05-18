export interface QRCodeDisplayProps {
  svgMarkup: string | null;
}

export interface QrColorOptions {
  dark?: string; // Hex code for modules/blocks (e.g., "#7c3aed" for purple)
  light?: string; // Hex code for background (e.g., "#ffffff")
}

export interface GenerateQrCode {
  userId: string | undefined;
  type?: 'svg' | 'terminal' | 'utf8';
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}
