import { memo } from "react";

export const BannerHeader = memo(function BannerHeader() {
  return (
    <header className="relative w-full overflow-hidden bg-slate-900 px-4 py-20 pb-32 sm:py-28 sm:pb-40">
      {/* Background Decorativo - Camadas de Identidade */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Mapa Mundial sutil */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-center bg-no-repeat" />
        
        {/* Watermark ADI Gigante */}
        <div className="absolute -top-12 left-1/2 -z-10 -translate-x-1/2 select-none text-[8rem] font-black text-white/[0.03] sm:text-[14rem] md:text-[20rem]">
          ADI
        </div>
        
        {/* Gradients de profundidade */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-900" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-10 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-[0_0_50px_rgba(255,255,255,0.2)] sm:h-28 sm:w-28">
          <img
            src="/adi-logo.png"
            alt="ADI Logo"
            className="h-14 w-14 object-contain sm:h-20 sm:w-20"
            onError={(e) => {
              e.currentTarget.src = "https://placeholder.com/100";
            }}
          />
        </div>

        <h1 className="text-4xl font-black tracking-tighter text-white sm:text-6xl md:text-7xl">
          GRUPOS <span className="text-blue-500">MISSIONÁRIOS</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-lg font-bold uppercase tracking-[0.2em] text-slate-400 sm:text-xl">
          Gerenciar <span className="mx-2 text-slate-600">•</span> Calcular <span className="mx-2 text-slate-600">•</span> Enviar
        </p>
      </div>
      
      {/* Detalhe de curva inferior para suavizar a transicao */}
      <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-white to-transparent" />
    </header>
  );
});
