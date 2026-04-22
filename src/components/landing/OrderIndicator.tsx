"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function OrderIndicator() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkOrder = async () => {
      const savedId = localStorage.getItem("pendingOrderId");
      if (!savedId) {
        setIsVisible(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${savedId}`);
        if (res.status === 404) {
          // If order is deleted by admin, clear local storage
          localStorage.removeItem("pendingOrderId");
          localStorage.removeItem("pendingPaymentUrl");
          setIsVisible(false);
          return;
        }

        const result = await res.json();
        if (result.data?.payment_status === "paid") {
          // If order is already paid, clear local storage
          localStorage.removeItem("pendingOrderId");
          localStorage.removeItem("pendingPaymentUrl");
          setIsVisible(false);
          return;
        }

        setOrderId(savedId);
        setIsVisible(true);
      } catch (err) {
        console.error("Indicator check error:", err);
      }
    };

    checkOrder();
    
    // Also listen for storage changes (in case of multi-tab)
    window.addEventListener("storage", checkOrder);
    return () => window.removeEventListener("storage", checkOrder);
  }, []);

  if (!isVisible || !orderId) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-10 duration-500">
      <Link
        href={`/order/success?id=${orderId}`}
        className={cn(
          "flex items-center gap-3 bg-charcoal-dark/90 backdrop-blur-md border border-gold/30 p-2 pl-4 rounded-full shadow-2xl",
          "hover:bg-charcoal transition-all group hover:scale-105 active:scale-95"
        )}
      >
        <div className="flex flex-col items-start leading-none pr-1">
          <span className="text-[10px] font-bold text-gold uppercase tracking-[0.2em] mb-1">
            Pesanan Pending
          </span>
          <span className="text-xs font-body text-white/90">
            Lanjutkan Pembayaran
          </span>
        </div>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gold rounded-full animate-ping opacity-20" />
          <div className="relative w-10 h-10 rounded-full bg-gold flex items-center justify-center text-charcoal-dark shadow-inner">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
