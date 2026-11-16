// Script de migracao AppWrite -> Supabase
// Mantido para referencia historica. Use scripts/setup-supabase.js para configurar o Supabase.

const ENDPOINT = 'https://cloud.appwrite.io/v1';
const PROJECT_ID = '6a944cb259b1c7d5d5f9';
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('ERRO: Defina APPWRITE_API_KEY no .env');
    console.error('Gere uma API Key em: https://cloud.appwrite.io/project/' + PROJECT_ID + '/settings/api-keys');
    process.exit(1);
}

console.log('=== Script de Migracao (AppWrite -> Supabase) ===');
console.log('Este script nao e mais utilizado.');
console.log('Use scripts/setup-supabase.js para configurar o Supabase.');
console.log('Use scripts/supabase-schema.sql para o schema do banco.');