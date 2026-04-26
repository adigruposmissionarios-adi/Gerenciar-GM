import { memo } from "react";

export const BannerHeader = memo(function BannerHeader() {
  return (
    <div className="relative overflow-hidden bg-white px-6 py-12 sm:px-12 sm:py-20">
      {/* Decorative background - Mapa SVG */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none select-none">
        <svg
          className="h-full w-full"
          viewBox="0 0 800 400"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 200 L120 180 L180 220 L250 190 L320 230 L400 200 L480 230 L550 190 L620 220 L680 180 L750 200"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="50" cy="200" r="3" fill="currentColor" />
          <circle cx="750" cy="200" r="3" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          {/* Logo / Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold tracking-wider text-amber-700 uppercase border border-amber-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
            </span>
            Igreja Evangelica Assembleia de Deus
          </div>

          {/* Main Title */}
          <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl md:text-7xl">
            GRUPOS <span className="text-blue-600">MISSIONÁRIOS</span>
          </h1>

          <p className="max-w-2xl text-lg font-medium text-slate-500 sm:text-xl">
            Nossa missão é: Ganhar, Discipular e Enviar
          </p>

          {/* Background Watermark - O ADI que você pediu para manter */}
          <div className="absolute -top-12 left-1/2 -z-10 -translate-x-1/2 select-none text-[8rem] font-black text-slate-100/40 sm:text-[12rem] md:text-[16rem]">
            ADI
          </div>
        </div>
      </div>
    </div>
  );
});
