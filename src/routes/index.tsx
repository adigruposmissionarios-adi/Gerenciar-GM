import { createFileRoute } from "@tanstack/react-router";
import { BannerHeader } from "@/components/portal/BannerHeader";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StatsCards } from "@/components/portal/StatsCards";
import { ActionButtons } from "@/components/portal/ActionButtons";
import { Top10Table } from "@/components/portal/Top10Table";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "ADI Grupos Missionários — Ganhar, Discipular e Enviar" },
      {
        name: "description",
        content:
          "Portal institucional dos Grupos Missionários da ADI. Acompanhe GM's, reuniões, decisões e reconciliações da semana.",
      },
    ],
  }),
});

function Index() {
  return (
    <div className="min-h-screen bg-surface">
      <BannerHeader />

      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-6 sm:gap-8 lg:gap-10">
          <DashboardHeader />
          <StatsCards />
          <ActionButtons />
          <Top10Table />
        </div>
      </main>

      <footer className="border-t border-border/60 bg-card/60">
        <div className="mx-auto max-w-6xl px-6 py-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ADI Grupos Missionários — Ganhar, Discipular e Enviar.
        </div>
      </footer>
    </div>
  );
}
