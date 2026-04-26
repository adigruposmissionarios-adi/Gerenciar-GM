import { memo } from "react";

export const BannerHeader = memo(function BannerHeader() {
  return (
    <header className="relative w-full overflow-hidden bg-[#fafafa] px-4 py-20 pb-32 sm:py-28 sm:pb-40 border-b border-slate-100">
      {/* Elementos Decorativos de Fundo - Estilo Painel Administrativo */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Watermark ADI Gigante - Sutil em Cinza/Dourado claro */}
        <div className="absolute -top-12 left-0 -z-10 select-none text-[10rem] font-black text-slate-200/40 sm:text-[18rem] md:text-[24rem] leading-none">
          ADI
        </div>
        
        {/* Mapa Mundial à Direita - Como na imagem das configurações */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-right bg-no-repeat bg-contain" />
        
        {/* Vinheta lateral para suavizar o mapa */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#fafafa] via-[#fafafa]/80 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-5xl text-center">
        {/* Logo ADI - Com borda sutil */}
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-xl border border-slate-50 sm:h-32 sm:w-32">
          <img
            src="/adi-logo.png"
            alt="ADI Logo"
            className="h-16 w-16 object-contain sm:h-22 sm:w-22"
            onError={(e) => {
              e.currentTarget.src = "https://placeholder.com/150";
            }}
          />
        </div>

        {/* Tipografia em Tons de Dourado/Escuro para combinar com o banner do admin */}
        <h1 className="flex flex-col gap-2 text-5xl font-black tracking-tighter text-slate-900 sm:text-7xl md:text-8xl">
          <span className="text-slate-800">GRUPOS</span>
          <span className="bg-gradient-to-r from-[#A88B45] to-[#D4AF37] bg-clip-text text-transparent uppercase">
            Missionários
          </span>
        </h1>
        
        <div className="mx-auto mt-8 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-slate-500 sm:text-lg">
          <span>GANHAR</span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span>DISCIPULAR</span>
          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
          <span>ENVIAR</span>
        </div>
      </div>
      
      {/* Detalhe inferior de profundidade */}
      <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-white to-transparent" />
    </header>
  );
});
