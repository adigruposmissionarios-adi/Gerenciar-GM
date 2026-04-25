import { useState } from "react";
import { X, Lock, Check, Eraser } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

type AdminLoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminLoginDialog({ open, onClose }: AdminLoginDialogProps) {
  const navigate = useNavigate();
  const [login, setLogin] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  function handleClose() {
    setLogin("");
    setCodigo("");
    setError("");
    onClose();
  }

  function handleLimpar() {
    setLogin("");
    setCodigo("");
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login || !codigo) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (login === "ADI" && codigo === "GM2026") {
      sessionStorage.setItem("admin_auth", "true");
      setError("");
      handleClose();
      navigate({ to: "/admin" });
    } else {
      setError("Login ou código incorretos. Tente novamente.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        
        {/* Header / Title */}
        <div className="relative pt-10 pb-6 px-8 text-center border-b border-slate-100">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-muted-foreground hover:bg-surface hover:text-foreground transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Área Administrativa
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe seu login e código para continuar.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6">
          {error && (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive text-center">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-base font-bold text-foreground">Login</span>
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              placeholder="Digite seu login"
              spellCheck={false}
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-blue-500"
            />
          </label>

          <label className="flex flex-col gap-2 relative">
            <span className="text-base font-bold text-slate-900">Código</span>
            <input
              required
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Código ou CPF"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-lg font-bold text-white shadow-md hover:bg-blue-700"
            >
              <Check className="h-5 w-5" />
              Confirmar
            </button>
            <button
              type="button"
              onClick={handleLimpar}
              className="flex-1 flex h-14 items-center justify-center gap-2 rounded-xl bg-destructive px-4 text-lg font-bold text-white shadow-md transition-all hover:brightness-110"
            >
              <Eraser className="h-5 w-5" />
              Limpar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
