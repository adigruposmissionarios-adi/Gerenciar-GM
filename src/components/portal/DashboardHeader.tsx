import { useState } from "react";
import { AdminLoginDialog } from "./AdminLoginDialog";

export function DashboardHeader() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <>
      <section className="flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl uppercase">
            ADI Grupos Missionários
          </h2>
          <p className="mt-1 text-base italic font-medium text-slate-500 sm:text-lg">
            Nossa missão é: Ganhar, Discipular e Enviar.
          </p>
        </div>
        
        <button
          onClick={() => setAdminOpen(true)}
          className="rounded-full bg-slate-900 px-8 py-3 text-sm font-black text-white hover:bg-slate-800 transition-all shadow-xl active:scale-95 uppercase tracking-wider"
        >
          ACESSO ADMIN
        </button>
      </section>

      {adminOpen && (
        <AdminLoginDialog 
          open={adminOpen} 
          onClose={() => setAdminOpen(false)} 
        />
      )}
    </>
  );
}
