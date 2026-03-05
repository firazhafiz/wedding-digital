import type { EventInfo } from "@/types";

interface FooterSectionProps {
  eventInfo: EventInfo | null;
}

export default function FooterSection({ eventInfo }: FooterSectionProps) {
  const groomName = eventInfo?.groom_name || "Mempelai Pria";
  const brideName = eventInfo?.bride_name || "Mempelai Wanita";

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

        <p className="font-body text-white/50 text-sm leading-relaxed mb-12 max-w-sm mx-auto">
          Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila
          Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.
        </p>

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
