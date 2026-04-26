import { AdminLoginDialog } from "./AdminLoginDialog";

interface DashboardHeaderProps {
  onOpenLogin: () => void;
  activeDialog: string | null;
  onClose: () => void;
}

export function DashboardHeader({ onOpenLogin, activeDialog, onClose }: DashboardHeaderProps) {
  const isAdminOpen = activeDialog === "admin";

  return (
    <>
      <section className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl uppercase">
            ADI Grupos Missionários
          </h2>
          <p className="mt-1 text-sm italic text-slate-500 sm:text-base">
            Nossa missão é: Ganhar, Discipular e Enviar.
          </p>
        </div>
        
        {!activeDialog && (
          <button
            onClick={onOpenLogin}
            className="rounded-full bg-slate-900 px-6 py-2.5 text-xs font-bold text-white hover:bg-slate-800 transition-colors shadow-md active:scale-95"
          >
            ACESSO ADMIN
          </button>
        )}
      </section>

      {isAdminOpen && (
        <AdminLoginDialog 
          open={isAdminOpen} 
          onClose={onClose} 
        />
      )}
    </>
  );
}
