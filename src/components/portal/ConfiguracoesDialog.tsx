import { useState, useEffect } from "react";
import { X, Settings, Image as ImageIcon, Map, Landmark, Loader2, Save, Plus, Trash2, Upload, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { useDomain, Area, Congregacao } from "@/hooks/useDomain";
import { useConfig } from "@/hooks/useConfig";
import { SETORES_LIST } from "@/lib/setores";

export function ConfiguracoesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"banner" | "areas" | "congregacoes">("banner");
  const { areas, congregacoes, refetch } = useDomain();
  const queryClient = useQueryClient();
  
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [showSuccess, onClose]);

  if (!open) return null;

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["config"] });
    setShowSuccess(true);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Configurações do Sistema</h2>
              <p className="text-xs font-bold text-slate-400 uppercase">Gestão Administrativa</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
            <X className="h-6 w-6 text-slate-500" />
          </button>
        </div>

        {/* Tabs Body */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r border-slate-100 bg-slate-50/50 p-4 space-y-2 hidden sm:block">
            <TabButton 
              active={activeTab === "banner"} 
              onClick={() => setActiveTab("banner")}
              icon={ImageIcon}
              label="Banner Principal"
            />
            <TabButton 
              active={activeTab === "areas"} 
              onClick={() => setActiveTab("areas")}
              icon={Map}
              label="Setores & Áreas"
            />
            <TabButton 
              active={activeTab === "congregacoes"} 
              onClick={() => setActiveTab("congregacoes")}
              icon={Landmark}
              label="Congregações"
            />
          </div>

          <div className="flex-1 flex flex-col overflow-hidden bg-white relative">
            <div className="p-6 overflow-y-auto">
                {activeTab === "banner" && <BannerTab onSuccess={handleSuccess} />}
                {activeTab === "areas" && <AreasTab areas={areas} onRefetch={refetch} />}
                {activeTab === "congregacoes" && <CongregacoesTab areas={areas} congregacoes={congregacoes} onRefetch={refetch} />}
            </div>

            {/* Success Overlay */}
            {showSuccess && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <div className="text-center">
                    <h4 className="text-xl font-black text-slate-800">Sucesso!</h4>
                    <p className="text-sm font-medium text-slate-500">As alterações foram aplicadas.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
        active 
          ? "bg-slate-900 text-white shadow-lg shadow-slate-200 scale-[1.02]" 
          : "text-slate-500 hover:bg-slate-200/50"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   ABA: BANNER
══════════════════════════════════════════════════════ */
function BannerTab({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { data: config } = useConfig();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const currentUrl = config?.banner_url || "";

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner-${Date.now()}.${fileExt}`;
      
      // 1. Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file);

      if (uploadError) throw new Error("Upload: " + uploadError.message);

      // 2. Get Public URL
      const { data } = supabase.storage.from('banners').getPublicUrl(fileName);
      const publicUrl = data.publicUrl;

      if (!publicUrl) throw new Error("Não foi possível gerar a URL pública.");

      // 3. Update DB with upsert for robustness
      const { error: dbError } = await supabase
        .from("configuracoes")
        .upsert({ id: "banner_url", valor: publicUrl, updated_at: new Date().toISOString() });

      if (dbError) throw new Error("Banco: " + dbError.message);

      setPreview(null);
      setFile(null);
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800">Banner Principal</h3>
        <p className="text-sm text-slate-500">Altere a imagem de fundo do cabeçalho do portal.</p>
      </div>

      <div className="aspect-[21/9] w-full rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden relative group">
        {preview || currentUrl ? (
          <img src={preview || currentUrl} className="w-full h-full object-cover" alt="Banner Preview" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span className="text-xs font-bold uppercase tracking-widest">Sem imagem definida</span>
          </div>
        )}
      </div>

      <form onSubmit={handleUpload} className="flex flex-col gap-4">
        <label className="flex items-center justify-center gap-3 px-6 py-4 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">Escolher nova imagem...</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) {
                setFile(f);
                setPreview(URL.createObjectURL(f));
              }
            }} 
          />
        </label>

        {file && (
          <button 
            type="submit" 
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
            Salvar Novo Banner
          </button>
        )}
      </form>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ABA: AREAS
══════════════════════════════════════════════════════ */
function AreasTab({ areas, onRefetch }: { areas: Area[], onRefetch: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newSetor, setNewSetor] = useState("");

  async function handleSave(areaId: string) {
    const { error } = await supabase
      .from("areas")
      .update({ setor_nome: newSetor })
      .eq("id", areaId);
    
    if (error) alert(error.message);
    else {
      setEditingId(null);
      onRefetch();
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-800">Vincular Áreas a Setores</h3>
        <p className="text-sm text-slate-500">Defina a qual setor cada área pertence.</p>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Nome da Área</th>
              <th className="px-6 py-4">Setor Vinculado</th>
              <th className="px-6 py-4 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {areas.map(a => (
              <tr key={a.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-4 font-bold text-slate-700">{a.nome}</td>
                <td className="px-6 py-4">
                  {editingId === a.id ? (
                    <select 
                      value={newSetor} 
                      onChange={(e) => setNewSetor(e.target.value)}
                      className="h-8 rounded border border-slate-200 text-xs px-2 outline-none focus:border-blue-500"
                    >
                      <option value="">Sem Setor</option>
                      {SETORES_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  ) : (
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${a.setor_nome ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-400"}`}>
                      {a.setor_nome || "Não definido"}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {editingId === a.id ? (
                    <button onClick={() => handleSave(a.id)} className="text-green-600 font-bold hover:underline">Salvar</button>
                  ) : (
                    <button onClick={() => { setEditingId(a.id); setNewSetor(a.setor_nome || ""); }} className="text-blue-600 font-bold hover:underline">Editar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ABA: CONGREGACOES
══════════════════════════════════════════════════════ */
function CongregacoesTab({ areas, congregacoes, onRefetch }: { areas: Area[], congregacoes: Congregacao[], onRefetch: () => void }) {
  const [newNome, setNewNome] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!newNome || !selectedArea) return;
    setLoading(true);
    const { error } = await supabase
      .from("congregacoes")
      .insert({ nome: newNome, area_id: selectedArea });

    if (error) alert(error.message);
    else {
      setNewNome("");
      onRefetch();
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta congregação?")) return;
    const { error } = await supabase.from("congregacoes").delete().eq("id", id);
    if (error) alert(error.message);
    else onRefetch();
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-black text-slate-800">Gerenciar Congregações</h3>
        <p className="text-sm text-slate-500">Adicione novas igrejas locais vinculadas às áreas.</p>
      </div>

      {/* Form Add */}
      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1.5 w-full">
            <label className="text-[10px] font-black uppercase text-slate-500">Nome da Congregação</label>
            <input 
              value={newNome} 
              onChange={(e) => setNewNome(e.target.value)} 
              placeholder="Ex: Monte Sinai"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-500" 
            />
        </div>
        <div className="w-full sm:w-64 space-y-1.5 text-left">
            <label className="text-[10px] font-black uppercase text-slate-500">Vínculo à Área</label>
            <select 
              value={selectedArea} 
              onChange={(e) => setSelectedArea(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500"
            >
                <option value="">Selecione a área...</option>
                {areas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
        </div>
        <button 
          onClick={handleAdd} 
          disabled={loading || !newNome || !selectedArea}
          className="h-10 px-6 rounded-xl bg-slate-900 text-white font-bold text-sm hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Adicionar"}
        </button>
      </div>

      <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-slate-100 sticky top-0">
              <tr>
                <th className="px-6 py-4">Congregação</th>
                <th className="px-6 py-4">Área</th>
                <th className="px-6 py-4 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...congregacoes]
                .sort((a, b) => {
                  const areaA = areas.find(ar => ar.id === a.area_id)?.nome || "";
                  const areaB = areas.find(ar => ar.id === b.area_id)?.nome || "";

                  const getWeight = (name: string) => {
                    if (name.includes("Templo Central")) return -1;
                    const num = name.match(/\d+/);
                    return num ? parseInt(num[0], 10) : 999;
                  };

                  const wA = getWeight(areaA);
                  const wB = getWeight(areaB);

                  if (wA !== wB) return wA - wB;
                  return a.nome.localeCompare(b.nome);
                })
                .map(c => {
                  const area = areas.find(a => a.id === c.area_id);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-700">{c.nome}</td>
                      <td className="px-6 py-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${area?.nome.includes("Templo") ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>
                            {area?.nome || "???"}
                          </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
