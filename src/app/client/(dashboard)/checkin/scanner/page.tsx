"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";

// Dynamically import ScannerComponent so html5-qrcode only runs on the client
// This prevents 'navigator is not defined' or 'window is not defined' SSR errors
const ScannerComponent = dynamic(() => import("./ScannerComponent"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-gray-100 animate-pulse rounded-lg flex items-center justify-center">
      <span className="font-body text-sm text-charcoal-light">
        Memuat Kamera...
      </span>
    </div>
  ),
});

export default function ClientQRScannerPage() {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/client/checkin"
          className="p-2 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-charcoal-light"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="font-body text-2xl font-semibold text-charcoal-dark">
            QR Scanner
          </h1>
          <p className="font-body text-sm text-charcoal-light mt-1">
            Arahkan kamera ke QR Code tamu
          </p>
        </div>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 shadow-sm">
        <Suspense fallback={null}>
          <ScannerComponent />
        </Suspense>

        <div className="mt-8 text-center space-y-2">
          <p className="font-body text-xs text-charcoal-light">
            Scanner akan otomatis mendeteksi QR Code dan melakukan check-in.
          </p>
          <p className="font-body text-[10px] text-charcoal-light/60">
            Pastikan memberikan izin akses kamera pada browser Anda.
          </p>
        </div>
      </div>
    </div>
  );
}
