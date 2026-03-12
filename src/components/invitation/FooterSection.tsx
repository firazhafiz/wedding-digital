"use client";

import type { EventInfo } from "@/types";

interface FooterSectionProps {
  eventInfo: EventInfo | null;
}

export default function FooterSection({ eventInfo }: FooterSectionProps) {
  const groomName = eventInfo?.groom_name || "Mempelai Pria";
  const brideName = eventInfo?.bride_name || "Mempelai Wanita";

  const handleShareWA = () => {
    const coupleNames = `${groomName.split(" ")[0]} & ${brideName.split(" ")[0]}`;
    const currentUrl =
      typeof window !== "undefined" ? window.location.href : "";
    const text = `Assalamualaikum,\n\nMari bersama-sama mendoakan dan merayakan pernikahan *${coupleNames}*.\n\nBuka undangan: ${currentUrl}\n\nTerima kasih 🙏`;
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="py-20 lg:py-28 px-6 bg-charcoal-dark text-center relative overflow-hidden">
      {/* Subtle gold gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-gold/30 to-transparent" />

      <div className="max-w-lg mx-auto relative z-10">
        <p className="font-body text-white/50 text-xs md:text-md tracking-[0.3em] uppercase mb-6">
          Thank You
        </p>

        <h2 className="font-script text-gold-light text-3xl md:text-4xl mb-2">
          {groomName}
        </h2>
        <p className="font-display text-gold/60 text-xl md:text-2xl mb-2">&</p>
        <h2 className="font-script text-gold-light text-3xl md:text-4xl mb-8">
          {brideName}
        </h2>

        {/* Ornamental */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-px bg-linear-to-r from-transparent to-gold/30" />
          <div className="w-1.5 h-1.5 rotate-45 bg-gold/40" />
          <div className="w-12 h-px bg-linear-to-l from-transparent to-gold/30" />
        </div>

        <p className="font-body text-white/50 text-sm leading-relaxed mb-8 max-w-sm mx-auto">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>

        {/* WA Share Button */}
        <button
          onClick={handleShareWA}
          className="inline-flex items-center gap-2 px-5 py-2.5 mb-12 rounded-full bg-emerald-600/90 hover:bg-emerald-600 text-white transition-all text-xs font-body tracking-wider uppercase"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Bagikan Undangan
        </button>

        {/* Ayat */}
        <div className="border-t border-gold/10 pt-8">
          <p className="font-script text-gold/60 text-lg mb-3">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا
          </p>
          <p className="font-body text-white/50 text-xs italic">
            &quot;Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan
            untukmu istri-istri dari jenismu sendiri&quot;
          </p>
          <p className="font-body text-white/30 text-[10px] mt-1">
            — QS. Ar-Rum: 21
          </p>
        </div>

        {/* Dynamic Footer Credit */}
        <div className="mt-20 pt-8 border-t border-white/5 opacity-50">
          <p className="font-body text-[10px] tracking-widest text-white/40 uppercase">
            {eventInfo?.footer_text || "Created with Love"}
          </p>
        </div>
      </div>
    </footer>
  );
}
