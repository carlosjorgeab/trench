// Script de configuracao do Supabase via API REST
// Execute com: node scripts/setup-supabase.js
// Requer: SUPABASE_SERVICE_KEY no .env

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('ERRO: Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY no .env');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=representation'
};

async function api(path, method = 'GET', body = null) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} falhou: ${res.status} ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

async function main() {
  console.log('=== Configuracao Supabase ===\n');

  // 1. Criar as tabelas via SQL (usando o endpoint de SQL)
  const schema = require('fs').readFileSync(
    require('path').join(__dirname, 'supabase-schema.sql'),
    'utf8'
  );

  const sqlRes = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`,
    },
    body: JSON.stringify({ sql: schema })
  });

  if (!sqlRes.ok) {
    console.log('Aviso: nao foi possivel executar SQL via RPC (pode ja existir)');
    console.log(await sqlRes.text());
  } else {
    console.log('Schema criado com sucesso.');
  }

  // 2. Configurar autenticacao (Google OAuth)
  console.log('\n=== Autenticacao ===');
  console.log('Para configurar OAuth (Google, Apple):');
  console.log('Acesse: https://app.supabase/project/' + 
    SUPABASE_URL.match(/https?:\/\/([^.]+)\./)[1] + '/auth/providers');
  console.log('\nHabilite:');
  console.log('- Google OAuth (com Client ID e Client Secret)');
  console.log('- Apple OAuth (opcional)');

  console.log('\n=== Configuracao Concluida ===');
  console.log('Proximos passos:');
  console.log('1. Execute: npm run dev');
  console.log('2. Acesse: http://localhost:3000');
  console.log('3. Cadastre um novo usuario (cadastro abre automaticamente a empresa)');
}

main().catch(err => {
  console.error('ERRO:', err.message);
  process.exit(1);
});