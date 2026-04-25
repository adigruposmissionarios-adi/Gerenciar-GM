import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [key, val] = line.split('=');
  if (key && val) acc[key] = val;
  return acc;
}, {});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function runMigration() {
  console.log("Iniciando migração...");

  // 1. Limpar tabelas de domínio
  console.log("Limpando tabelas de testes...");
  await supabase.from('congregacoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('areas').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Criar as 34 Áreas Oficiais
  const areasParaInserir = ["Templo Central", ...Array.from({ length: 33 }, (_, i) => `Área ${String(i + 1).padStart(2, "0")}`)];
  console.log(`Inserindo ${areasParaInserir.length} Áreas Oficiais...`);
  
  const { data: areasCriadas, error: errAreas } = await supabase
    .from('areas')
    .insert(areasParaInserir.map(nome => ({ nome })))
    .select();

  if (errAreas) {
    console.error("Erro inserindo áreas:", errAreas);
    return;
  }

  // 3. Extrair as Congregações cadastradas nos GMs
  console.log("Buscando GMs...");
  const { data: gms, error: errGms } = await supabase
    .from('grupos_missionarios')
    .select('area_nome, congregacao_nome');

  if (errGms) {
    console.error("Erro buscando GMs:", errGms);
    return;
  }

  const congregacoesSet = new Map(); // key = "Area|Cong", value = obj
  gms.forEach(gm => {
    if (gm.area_nome && gm.congregacao_nome) {
      const key = `${gm.area_nome}|${gm.congregacao_nome}`;
      if (!congregacoesSet.has(key)) {
        congregacoesSet.set(key, { area_nome: gm.area_nome, congregacao_nome: gm.congregacao_nome });
      }
    }
  });

  const congregacoesParaInserir = Array.from(congregacoesSet.values()).map(c => {
    const areaDb = areasCriadas.find(a => a.nome === c.area_nome);
    if (!areaDb) return null;
    return {
      nome: c.congregacao_nome,
      area_id: areaDb.id
    };
  }).filter(Boolean);

  console.log(`Inserindo ${congregacoesParaInserir.length} Congregações extraídas dos cadastros reais...`);
  
  // Inserir congregações
  const { error: errCong } = await supabase
    .from('congregacoes')
    .insert(congregacoesParaInserir);

  if (errCong) {
    console.error("Erro ao inserir congregações:", errCong);
    return;
  }

  console.log("Migração concluída com sucesso!");
}

runMigration().catch(console.error);
