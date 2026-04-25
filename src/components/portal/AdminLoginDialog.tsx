import { useRef, useState } from "react";
import { X, Lock } from "lucide-react";

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
      <div className="absolute inset-0 bg-black/80" onClick={handleClose} />

      <div className="relative z-10 flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
        
        <div className="relative pt-10 pb-6 px-8 text-center border-b border-slate-100">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase">
            Área Administrativa
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Informe seu login e código para continuar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 py-8 flex flex-col gap-6">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 text-center">
              {error}
            </div>
          )}

          <label className="flex flex-col gap-2">
            <span className="text-base font-bold text-slate-900">Login</span>
            <input
              ref={loginRef}
              type="text"
              placeholder="Digite seu login"
              spellCheck={false}
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-blue-500"
            />
          </label>

          <label className="flex flex-col gap-2 relative">
            <span className="text-base font-bold text-slate-900">Código</span>
            <input
              ref={codigoRef}
              type="text"
              placeholder="Código ou CPF"
              autoComplete="off"
              spellCheck={false}
              className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 text-base text-slate-900 outline-none focus:border-blue-500"
            />
          </label>

          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              className="w-full h-14 rounded-xl bg-blue-600 text-lg font-bold text-white shadow-md hover:bg-blue-700 active:scale-[0.98] transition-transform"
            >
              Confirmar Login
            </button>
            <button
              type="button"
              onClick={handleLimpar}
              className="w-full h-12 rounded-xl border-2 border-slate-200 text-base font-bold text-slate-500 hover:bg-slate-50"
            >
              Limpar Campos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
