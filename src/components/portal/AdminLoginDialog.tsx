import { useRef, useState } from "react";
import { X, ShieldCheck } from "lucide-react";

type AdminLoginDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function AdminLoginDialog({ open, onClose }: AdminLoginDialogProps) {
  const loginRef = useRef<HTMLInputElement>(null);
  const codigoRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  if (!open) return null;

  function handleClose() {
    setError("");
    onClose();
  }

  function handleLimpar() {
    if (loginRef.current) loginRef.current.value = "";
    if (codigoRef.current) codigoRef.current.value = "";
    setError("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const login = loginRef.current?.value;
    const codigo = codigoRef.current?.value;

    if (!login || !codigo) {
      setError("Por favor, preencha todos os campos.");
      return;
    }

    if (login === "ADI" && codigo === "GM2026") {
      sessionStorage.setItem("admin_auth", "true");
      setError("");
      handleClose();
      window.location.href = "/admin";
    } else {
      setError("Login ou código incorretos. Tente novamente.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop mais elegante */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" onClick={handleClose} />

      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-[2.5rem] border border-white/20 bg-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)]">
        
        <div className="relative pt-12 pb-8 px-10 text-center border-b border-slate-50 bg-slate-50/50">
          <button
            onClick={handleClose}
            className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all hover:text-slate-600 active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200">
            <ShieldCheck className="h-8 w-8" />
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Administração
          </h2>
          <p className="mt-2 text-sm font-bold text-slate-400 uppercase tracking-widest">
            Identificação de Segurança
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 flex flex-col gap-8">
          {error && (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm font-bold text-red-600 text-center animate-shake">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Login</span>
              <input
                ref={loginRef}
                type="text"
                placeholder="USUÁRIO"
                spellCheck={false}
                autoComplete="off"
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-base font-bold text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-inner"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Código de Acesso</span>
              <input
                ref={codigoRef}
                type="text"
                placeholder="••••••"
                autoComplete="off"
                spellCheck={false}
                className="h-14 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 text-base font-bold text-slate-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-inner"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <button
              type="submit"
              className="w-full h-16 rounded-2xl bg-slate-900 text-lg font-black text-white shadow-xl shadow-slate-200 transition-all hover:bg-slate-800 active:scale-[0.98] uppercase tracking-wider"
            >
              Entrar no Painel
            </button>
            <button
              type="button"
              onClick={handleLimpar}
              className="w-full h-12 rounded-2xl text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Limpar Campos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
