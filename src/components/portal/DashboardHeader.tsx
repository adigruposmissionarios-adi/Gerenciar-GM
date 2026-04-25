import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { AdminLoginDialog } from "./AdminLoginDialog";

export function DashboardHeader() {
  const [adminOpen, setAdminOpen] = useState(false);

  return (
    <>
      <section className="flex flex-col items-start justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            ADI GRUPOS MISSIONÁRIOS
          </h2>
          <p className="mt-1 text-sm italic text-muted-foreground sm:text-base">
            Nossa missão é: Ganhar, Discipular e Enviar.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAdminOpen(true)}
          className="rounded-full bg-foreground px-5 text-background hover:bg-foreground/90"
        >
          <Lock className="mr-1 h-3.5 w-3.5" />
          Admin
        </Button>
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
