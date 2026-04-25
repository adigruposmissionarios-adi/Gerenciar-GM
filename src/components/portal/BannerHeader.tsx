import { useConfig } from "@/hooks/useConfig";

export function BannerHeader() {
  const { data: config } = useConfig();
  const bannerUrl = config?.banner_url;

  if (bannerUrl) {
    return (
      <header className="w-full border-b border-gold/30 bg-[#f8e5b4] overflow-hidden">
        <div className="relative w-full" style={{ aspectRatio: '3 / 1' }}>
          <img 
            key={bannerUrl}
            src={`${bannerUrl}?v=${Date.now()}`} 
            alt="Banner Principal" 
            className="absolute inset-0 w-full h-full object-cover object-center animate-in fade-in duration-700"
          />
        </div>
      </header>
    );
  }

  return (
    <header
      className="relative overflow-hidden border-b border-gold/30"
      style={{ background: "var(--gradient-banner)" }}
    >
      {/* Watermark ADI */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-4 top-1/2 -translate-y-1/2 select-none text-[12rem] font-black leading-none tracking-tighter text-gold-deep/10 sm:text-[16rem] md:text-[22rem]"
      >
        ADI
      </div>

      {/* Decorative world map (top-right) */}
      <svg
        aria-hidden
        viewBox="0 0 800 400"
        className="pointer-events-none absolute -right-10 -top-10 h-64 w-[28rem] text-gold-deep/25 sm:h-80 sm:w-[36rem]"
        fill="currentColor"
      >
        {Array.from({ length: 380 }).map((_, i) => {
          const x = (i * 53) % 800;
          const y = (i * 97) % 400;
          const r = ((i % 5) + 1) * 0.9;
          return <circle key={i} cx={x} cy={y} r={r} />;
        })}
      </svg>

      <div className="relative mx-auto max-w-6xl px-6 py-12 sm:py-16 md:py-20">
        {/* Logo placeholder */}
        <div className="mx-auto mb-8 flex w-fit flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-gold-deep/40 bg-white/60 shadow-card backdrop-blur-sm">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-gold-deep" fill="currentColor">
              <path d="M12 2c-1 3-3 5-6 6 2 1 4 3 5 6 1-3 3-5 6-6-2-1-4-3-5-6zm0 12c-.6 1.8-1.8 3-3.5 3.5 1.2.6 2.3 1.7 2.9 3 .6-1.3 1.7-2.4 2.9-3-1.7-.5-2.9-1.7-3.3-3.5z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-gold-deep/80 sm:text-xs">
            ASSEMBLEIA DE DEUS
          </p>
        </div>

        <div className="relative text-center">
          <h1
            className="text-4xl font-black tracking-tight text-gold-deep drop-shadow-sm sm:text-6xl md:text-7xl lg:text-8xl"
            style={{ textShadow: "0 2px 0 oklch(1 0 0 / 0.4)" }}
          >
            GRUPOS MISSIONÁRIOS
          </h1>
          <p className="mt-4 text-base font-medium tracking-[0.2em] text-gold-foreground/80 sm:text-lg md:text-xl">
            Ganhar <span className="text-gold-deep">•</span> Discipular{" "}
            <span className="text-gold-deep">•</span> Enviar
          </p>
        </div>
      </div>
    </header>
  );
}
