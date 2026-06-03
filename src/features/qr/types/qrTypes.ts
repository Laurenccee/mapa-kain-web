export interface QRCodeDisplayProps {
  svgMarkup: string | null;
}

export interface GenerateQrCode {
  userId: string | undefined;
  type?: "svg" | "terminal" | "utf8";
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}
