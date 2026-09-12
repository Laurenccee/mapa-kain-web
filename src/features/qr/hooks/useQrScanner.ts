"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

const SCANNER_ELEMENT_ID = "qr-reader-target";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

/** Owns the html5-qrcode engine lifecycle (start/stop/retry) for a single scanner instance. */
export function useQrScanner(onDecoded: (decodedText: string) => void) {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState("Starting camera...");

  const qrEngineRef = useRef<Html5Qrcode | null>(null);
  const onDecodedRef = useRef(onDecoded);
  const scanLockRef = useRef(false);
  const isStartingRef = useRef(false);

  useEffect(() => {
    onDecodedRef.current = onDecoded;
  }, [onDecoded]);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearScannerTarget = useCallback(() => {
    const target = document.getElementById(SCANNER_ELEMENT_ID);
    if (target) target.innerHTML = "";
  }, []);

  const stopScanner = useCallback(async () => {
    const provider = qrEngineRef.current;
    qrEngineRef.current = null;
    isStartingRef.current = false;

    if (provider) {
      try {
        if (provider.isScanning) {
          await provider.stop();
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);

        if (
          !message.includes("not running") &&
          !message.includes("removechild") &&
          !message.includes("not a child")
        ) {
          console.error("Failed to stop scanner smoothly:", err);
        }
      }

      try {
        await provider.clear();
      } catch (err) {
        const message =
          err instanceof Error ? err.message.toLowerCase() : String(err);

        if (
          !message.includes("removechild") &&
          !message.includes("not a child")
        ) {
          console.debug("Scanner clear skipped:", err);
        }
      }
    }

    if (!qrEngineRef.current || qrEngineRef.current === provider) {
      clearScannerTarget();
    }
  }, [clearScannerTarget]);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      if (scanLockRef.current) return;
      scanLockRef.current = true;

      setScanStatus("QR detected");
      onDecodedRef.current(decodedText);

      void stopScanner();
    },
    [stopScanner],
  );

  const startScanner = useCallback(async () => {
    if (isDesktop === null || isDesktop) return;
    if (isStartingRef.current || qrEngineRef.current?.isScanning) return;

    setCameraError(null);
    setScanStatus("Starting camera...");
    scanLockRef.current = false;

    await stopScanner();
    isStartingRef.current = true;

    const provider = new Html5Qrcode(SCANNER_ELEMENT_ID, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });

    qrEngineRef.current = provider;

    const scanConfig = {
      fps: 6,
      qrbox: { width: 250, height: 250 },
    };

    try {
      await provider.start(
        { facingMode: "environment" },
        scanConfig,
        handleScanSuccess,
        () => {
          // Ignore per-frame decode failures while scanning.
        },
      );

      setScanStatus("Scanning...");
    } catch (err) {
      console.error("Camera initialization failed:", err);
      setScanStatus("Camera error");
      setCameraError(toErrorMessage(err));
      await stopScanner();
    } finally {
      isStartingRef.current = false;
    }
  }, [handleScanSuccess, isDesktop, stopScanner]);

  const resumeScanning = useCallback(() => {
    scanLockRef.current = false;
    void startScanner();
  }, [startScanner]);

  useEffect(() => {
    if (isDesktop === null || isDesktop) return;

    void startScanner();

    return () => {
      void stopScanner();
    };
  }, [isDesktop, startScanner, stopScanner]);

  return {
    isDesktop,
    cameraError,
    scanStatus,
    startScanner,
    resumeScanning,
    elementId: SCANNER_ELEMENT_ID,
  };
}
