import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Manually parse .env.local or .env
let envFile = '';
try {
  envFile = fs.readFileSync('.env.local', 'utf-8');
} catch (e) {
  envFile = fs.readFileSync('.env', 'utf-8');
}

const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const SUPABASE_URL = env['VITE_SUPABASE_URL'];
const SUPABASE_KEY = env['VITE_SUPABASE_ANON_KEY'];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const parseCsvLine = (line) => {
  const result = [];
  let inQuotes = false;
  let word = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(word);
      word = '';
    } else {
      word += char;
    }
  }
  result.push(word);
  return result;
};

const run = async () => {
  console.log("Fetching existing GMs to map gm_id...");
  const { data: gms, error: gmError } = await supabase.from('grupos_missionarios').select('id, nome, area_nome');
  if (gmError) {
    console.error("Error fetching GMs:", gmError);
    process.exit(1);
  }
  
  const gmMap = new Map();
  gms.forEach(gm => {
    // Normalization logic: Area 01_GM Nome -> area 01_gm nome
    const key = `${gm.area_nome.trim().toLowerCase()}_${gm.nome.trim().toLowerCase()}`;
    gmMap.set(key, gm.id);
  });

  console.log("Reading relatorios_antigos.csv...");
  const content = fs.readFileSync('relatorios_antigos.csv', 'utf-8');
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const rowsToInsert = [];
  
  // Skip header (line 0)
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 12) continue;
    
    const data_gm = cols[1]?.trim();
    if (!data_gm) continue; // safety check
    
    const area_nome = cols[2]?.replace(/"/g, '').trim();
    const congregacao = cols[3]?.replace(/"/g, '').trim();
    const nome_gm = cols[4]?.replace(/"/g, '').trim();
    const nome_lider = cols[5]?.replace(/"/g, '').trim();
    
    let whatsapp = cols[6]?.replace(/\D/g, '') || '';
    if (whatsapp.length <= 9 && whatsapp.length > 0) {
      whatsapp = `91${whatsapp.length === 8 ? '9' : ''}${whatsapp}`;
    } else if (whatsapp.length === 10 && whatsapp.startsWith('91')) {
      whatsapp = `919${whatsapp.slice(2)}`;
    }
    
    const qtd_membros = parseInt(cols[7]) || 0;
    const visitantes_cristaos = parseInt(cols[8]) || 0;
    const visitantes_nao_cristaos = parseInt(cols[9]) || 0;
    const decisao = parseInt(cols[10]) || 0;
    const reconciliacao = parseInt(cols[11]) || 0;
    
    const key = `${area_nome.toLowerCase()}_${nome_gm.toLowerCase()}`;
    const gm_id = gmMap.get(key) || null;
    
    // Some dates might be malformed string if format is weird, but looking at CSV they are YYYY-MM-DD
    let created_at;
    try {
      created_at = new Date(data_gm).toISOString();
    } catch {
      created_at = new Date().toISOString(); 
    }

    rowsToInsert.push({
      data_gm,
      area_nome,
      gm_id,
      nome_gm,
      congregacao,
      nome_lider,
      whatsapp,
      qtd_membros,
      visitantes_cristaos,
      visitantes_nao_cristaos,
      decisao,
      reconciliacao,
      created_at
    });
  }

  console.log(`Found ${rowsToInsert.length} valid reports to insert.`);
  
  // Insert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < rowsToInsert.length; i += batchSize) {
    const chunk = rowsToInsert.slice(i, i + batchSize);
    const { error } = await supabase.from('relatorios_semanais').insert(chunk);
    if (error) {
      console.error(`Error inserting batch ${i / batchSize}:`, error);
    } else {
      console.log(`Inserted batch ${i / batchSize + 1} (${chunk.length} rows)`);
    }
  }
  
  console.log('Migration of historical reports complete!');
};

run().catch(console.error);
