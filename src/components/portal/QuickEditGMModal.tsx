import { useState } from "react";
import { Loader2, ShieldCheck, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useDomain } from "@/hooks/useDomain";

function formatCPF(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
  return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9)}`;
}

function formatPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

const FAIXAS = ["Kids", "Teen", "Jovem", "Adulto", "Misto"];

export function QuickEditGMModal({
  gm,
  onClose,
  onSave
}: {
  gm: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    nome: gm.nome || "", lider: gm.lider || "",
    cpf_lider: formatCPF(gm.cpf_lider ?? ""),
    email_lider: gm.email_lider ?? "",
    whatsapp_lider: formatPhone(gm.whatsapp_lider ?? ""),
    faixa_etaria: gm.faixa_etaria ?? "",
    area_nome: gm.area_nome ?? "",
    congregacao_nome: gm.congregacao_nome ?? "",
    endereco: gm.endereco ?? "",
    data_fundacao: gm.data_fundacao ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { areas, congregacoes } = useDomain();
  
  const areaOptions = areas.map(a => a.nome);
  const selectedAreaObj = areas.find(a => a.nome === form.area_nome);
  const congregacaoOptions = selectedAreaObj 
    ? congregacoes.filter(c => c.area_id === selectedAreaObj.id).map(c => c.nome)
    : [];

  if (!gm) return null;

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    if (name === "cpf_lider") { setForm(p => ({ ...p, cpf_lider: formatCPF(value) })); return; }
    if (name === "whatsapp_lider") { setForm(p => ({ ...p, whatsapp_lider: formatPhone(value) })); return; }
    setForm(p => ({ ...p, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const { error: err } = await supabase
      .from("grupos_missionarios")
      .update({
        nome: form.nome, lider: form.lider,
        cpf_lider: form.cpf_lider.replace(/\D/g, ""),
        email_lider: form.email_lider,
        whatsapp_lider: form.whatsapp_lider.replace(/\D/g, ""),
        faixa_etaria: form.faixa_etaria,
        area_nome: form.area_nome,
        congregacao_nome: form.congregacao_nome,
        endereco: form.endereco,
        data_fundacao: form.data_fundacao || null,
      })
      .eq("id", gm.id);

    if (err) { setError("Erro ao salvar: " + err.message); setSaving(false); return; }
    onSave();
    onClose();
  }

  const inp = "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500";
  const sel = inp + " appearance-none pr-8";
  const lbl = "text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1 block";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="text-lg font-black text-slate-800">Editando GM: {gm.nome}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors"><X className="h-5 w-5 text-slate-500"/></button>
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold">{error}</div>}
          
          <form id="edit-gm-form" onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className={lbl}>Nome do GM *</label><input required name="nome" value={form.nome} onChange={handleChange} className={inp} /></div>
            <div><label className={lbl}>Nome do Líder *</label><input required name="lider" value={form.lider} onChange={handleChange} className={inp} /></div>
            <div><label className={lbl}>CPF do Líder</label><input name="cpf_lider" value={form.cpf_lider} onChange={handleChange} placeholder="000.000.000-00" className={inp} /></div>
            <div><label className={lbl}>WhatsApp</label><input name="whatsapp_lider" value={form.whatsapp_lider} onChange={handleChange} placeholder="(00) 00000-0000" className={inp} /></div>
            <div><label className={lbl}>E-mail</label><input type="email" name="email_lider" value={form.email_lider} onChange={handleChange} placeholder="email@exemplo.com" className={inp} /></div>
            <div>
              <label className={lbl}>Faixa Etária</label>
              <select name="faixa_etaria" value={form.faixa_etaria} onChange={handleChange} className={sel}>
                <option value="">Selecione…</option>
                {FAIXAS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Área</label>
              <select name="area_nome" value={form.area_nome} onChange={handleChange} className={sel}>
                <option value="">Selecione…</option>
                {areaOptions.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Congregação</label>
              <select name="congregacao_nome" value={form.congregacao_nome} onChange={handleChange} className={sel}>
                <option value="">Selecione…</option>
                {congregacaoOptions.length > 0 ? (
                  congregacaoOptions.map(c => <option key={c} value={c}>{c}</option>)
                ) : (
                  form.area_nome ? <option value="" disabled>Nenhuma cadastrada</option> : null
                )}
              </select>
            </div>
            <div className="sm:col-span-2"><label className={lbl}>Endereço</label><input name="endereco" value={form.endereco} onChange={handleChange} className={inp} /></div>
            <div><label className={lbl}>Data de Fundação</label><input type="date" name="data_fundacao" value={form.data_fundacao} onChange={handleChange} className={inp} /></div>
          </form>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 shrink-0 flex gap-3 justify-end items-center">
          <button onClick={onClose} className="px-5 py-2 rounded-lg font-bold text-slate-600 hover:bg-slate-200 transition-colors">Cancelar</button>
          <button form="edit-gm-form" type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="h-4 w-4 animate-spin"/> : <ShieldCheck className="w-4 h-4" />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
