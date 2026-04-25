import { memo } from "react";

export const BannerHeader = memo(function BannerHeader() {
  return (
    <div className="relative overflow-hidden bg-white px-6 py-8 sm:py-16 border-b border-slate-100">
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase border border-slate-200">
            Igreja Evangelica Assembleia de Deus
          </div>

          <h1 className="mb-2 text-3xl font-black tracking-tight text-slate-900 sm:text-5xl">
            GRUPOS <span className="text-blue-600">MISSIONÁRIOS</span>
          </h1>

          <p className="text-base font-medium text-slate-500">
            Gerenciar · Calcular · Enviar
          </p>
        </div>
      </div>
    </div>
  );
});
