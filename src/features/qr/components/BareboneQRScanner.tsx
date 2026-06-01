"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { Button } from "@/components/ui/button";

const SCANNER_ELEMENT_ID = "barebone-qr-reader";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function BareboneQRScanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);

  const [status, setStatus] = useState("Starting camera...");
  const [error, setError] = useState<string | null>(null);
  const [decodedText, setDecodedText] = useState<string | null>(null);

  const stopScanner = useCallback(async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    isStartingRef.current = false;

    if (scanner) {
      try {
        if (scanner.isScanning) {
          await scanner.stop();
        }
      } catch (stopError) {
        console.debug("Unable to stop scanner cleanly:", stopError);
      }

      try {
        await scanner.clear();
      } catch (clearError) {
        console.debug("Unable to clear scanner cleanly:", clearError);
      }
    }

    const target = document.getElementById(SCANNER_ELEMENT_ID);
    if (target) {
      target.innerHTML = "";
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (isStartingRef.current || scannerRef.current?.isScanning) return;

    setError(null);
    setDecodedText(null);
    setStatus("Starting camera...");

    await stopScanner();
    isStartingRef.current = true;

    const scanner = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (text) => {
          console.log("Barebone QR result:", text);
          setDecodedText(text);
          setStatus("Scan complete");
          void stopScanner();
        },
        () => {
          // Ignore per-frame decode failures while scanning.
        },
      );

      setStatus("Scanning...");
    } catch (startError) {
      setStatus("Camera error");
      setError(toErrorMessage(startError));
      await stopScanner();
    } finally {
      isStartingRef.current = false;
    }
  }, [stopScanner]);

  useEffect(() => {
    void startScanner();

    return () => {
      void stopScanner();
    };
  }, [startScanner, stopScanner]);

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-4">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Barebone QR Scanner</h1>
        <p className="text-muted-foreground text-sm">{status}</p>
      </header>

      <div
        id={SCANNER_ELEMENT_ID}
        className="min-h-72 overflow-hidden rounded-md border bg-black"
      />

      {decodedText ? (
        <div className="rounded-md border p-3">
          <p className="text-muted-foreground text-xs">Decoded text</p>
          <p className="font-mono text-sm break-all">{decodedText}</p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/5 p-3">
          <p className="text-sm text-red-500">{error}</p>
        </div>
      ) : null}

      <div className="flex gap-2">
        <Button
          onClick={() => {
            void startScanner();
          }}
        >
          Start / Scan Again
        </Button>

        <Button
          variant="outline"
          onClick={() => {
            setStatus("Scanner stopped");
            void stopScanner();
          }}
        >
          Stop
        </Button>
      </div>
    </section>
  );
}
