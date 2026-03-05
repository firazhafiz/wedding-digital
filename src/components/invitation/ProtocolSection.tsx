"use client";

import { useGsapReveal } from "@/hooks/useGsap";

interface ProtocolItemProps {
  icon: React.ReactNode;
  label: string;
  delay: number;
}

function ProtocolItem({ icon, label, delay }: ProtocolItemProps) {
  const ref = useGsapReveal<HTMLDivElement>({ type: "fade-up", delay });

  return (
    <div ref={ref} className="flex flex-col items-center">
      <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-full bg-gold/5 border border-gold/10 text-gold">
        {icon}
      </div>
      <p className="font-body text-[10px] md:text-xs tracking-[0.2em] uppercase text-charcoal-light text-center leading-relaxed">
        {label}
      </p>
    </div>
  );
}

export default function ProtocolSection() {
  const titleRef = useGsapReveal<HTMLDivElement>({ type: "fade-up" });

  const protocols = [
    {
      label: "Hadir Tepat Waktu",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
    },
    {
      label: "Pakaian Sesuai",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.62 1.97V21a1 1 0 001 1h18a1 1 0 001-1V5.43a2 2 0 00-1.62-1.97z" />
          <path d="M12 5V2" />
          <path d="M12 22V10" />
          <path d="M8 8l4 2 4-2" />
        </svg>
      ),
    },
    {
      label: "Senyum & Salam",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 20v-8m0 0l-4 4m4-4l4 4M20 12c-1.1 0-2-.9-2-2m-2 10c-1.1 0-2-.9-2-2m-8 2c-1.1 0-2-.9-2-2M4 12c1.1 0 2-.9 2-2M12 4c1.1 0 2 .9 2 2m-2-2c-1.1 0-2 .9-2 2" />
          <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z" />
        </svg>
      ),
    },
    {
      label: "Siapkan QR Code",
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M3 3h4v4H3zM17 3h4v4h-4zM3 17h4v4H3zM14 14h3v3h-3zM17 17h4v4h-4zM14 17v4h3" />
          <path d="M7 14h3v3H7zM3 14h1v1M10 10V7h3v3h-3z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-20 lg:py-28 px-6 bg-cream/30">
      <div className="max-w-4xl mx-auto">
        <div ref={titleRef} className="text-center mb-16">
          <p className="font-body text-charcoal-light text-xs tracking-[0.3em] uppercase mb-3">
            Guest Information
          </p>
          <h2 className="font-display text-3xl md:text-5xl text-charcoal-dark mb-6">
            Informasi Tamu
          </h2>
          <p className="font-body text-charcoal-light text-sm max-w-xl mx-auto leading-relaxed">
            Demi kenyamanan dan kelancaran acara, kami mengimbau para tamu
            undangan untuk memperhatikan beberapa hal berikut.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {protocols.map((protocol, index) => (
            <ProtocolItem
              key={index}
              label={protocol.label}
              icon={protocol.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
