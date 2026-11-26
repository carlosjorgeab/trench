// Script de criacao de usuario admin no Supabase
// Execute com: node scripts/create-admin.js

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Carregar variaveis de ambiente do arquivo .env manualmente
function loadEnv() {
  const envPath = path.resolve(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('ERRO: Arquivo .env nao encontrado.');
    process.exit(1);
  }
  const envText = fs.readFileSync(envPath, 'utf8');
  const lines = envText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.substring(0, eqIndex).trim();
    const value = trimmed.substring(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnv();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('ERRO: Variaveis de ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_KEY sao obrigatorias.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

const ADMIN_EMAIL = 'admin@trench.com';
const ADMIN_PASSWORD = 'Cjl@j2326';
const ADMIN_NOME = 'Administrador';

async function createAdmin() {
  console.log('=== Criacao de Usuario Admin ===\n');

  // 1. Criar usuario na autenticacao
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      nome: ADMIN_NOME,
      tipo: 'admin',
    },
  });

  let userId;

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      console.log('[INFO] Usuario ja existe na autenticacao. Buscando...');
      const { data: users, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) {
        console.log('[ERROR] Ao listar usuarios:', listError.message);
        return;
      }
      const adminUser = users.users.find(u => u.email === ADMIN_EMAIL);
      if (adminUser) {
        userId = adminUser.id;
        console.log('[OK] Usuario encontrado:', userId);
      } else {
        console.log('[ERROR] Usuario admin@trench.com nao encontrado apos listagem.');
        return;
      }
    } else {
      console.log('[ERROR] Ao criar usuario:', authError.message);
      return;
    }
  } else {
    console.log('[OK] Usuario criado na autenticacao:');
    console.log('  ID:', authData.user.id);
    console.log('  Email:', authData.user.email);
    userId = authData.user.id;
  }

  // 2. Buscar ou criar empresa padrao
  let { data: empresaData, error: empresaError } = await supabase
    .from('empresas')
    .select('*')
    .eq('nome', 'Empresa Padrao')
    .single();

  if (empresaError && empresaError.code !== 'PGRST116') {
    console.log('[ERROR] Ao buscar empresa:', empresaError.message);
    return;
  }

  if (!empresaData) {
    const { data: newEmpresa, error: createError } = await supabase
      .from('empresas')
      .insert({
        nome: 'Empresa Padrao',
        cnpj: '00.000.000/0000-00',
        email: 'admin@trench.com',
        ativo: true,
      })
      .select()
      .single();

    if (createError) {
      console.log('[ERROR] Ao criar empresa:', createError.message);
      return;
    }
    empresaData = newEmpresa;
    console.log('[OK] Empresa padrao criada:', empresaData.id);
  } else {
    console.log('[OK] Empresa padrao encontrada:', empresaData.id);
  }

  // 3. Atualizar ou criar registro na tabela usuarios
  if (userId) {
    const { data: existingUser, error: selectError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('[ERROR] Ao buscar usuario:', selectError.message);
      return;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          empresa_id: empresaData.id,
          nome: ADMIN_NOME,
          email: ADMIN_EMAIL,
          perfil: 'admin_sistema',
          ativo: true,
        });

      if (insertError) {
        console.log('[ERROR] Ao criar registro de usuario:', insertError.message);
        return;
      }
      console.log('[OK] Registro de usuario criado na tabela usuarios');
    } else {
      console.log('[OK] Registro de usuario ja existe. Atualizando perfil...');
      const { error: updateError } = await supabase
        .from('usuarios')
        .update({ perfil: 'admin_sistema', empresa_id: empresaData.id, ativo: true })
        .eq('id', userId);
      if (updateError) {
        console.log('[ERROR] Ao atualizar usuario:', updateError.message);
        return;
      }
      console.log('[OK] Perfil atualizado para admin_sistema');
    }
  }

  // 4. Criar permissoes de admin para todos os modulos
  const modulos = [
    'dashboard',
    'financeiro',
    'prestacao',
    'cotacao',
    'cadastros',
    'configuracao',
    'acesso',
  ];

  // Remover permissoes existentes do usuario
  await supabase.from('permissoes').delete().eq('usuario_id', userId);

  for (const modulo of modulos) {
    const { error: permError } = await supabase
      .from('permissoes')
      .insert({
        usuario_id: userId,
        modulo: modulo,
        criar: true,
        alterar: true,
        deletar: true,
        visualizar: true,
      });

    if (permError) {
      console.log('[ERROR] Ao criar permissao para', modulo, ':', permError.message);
    } else {
      console.log('[OK] Permissao criada para modulo:', modulo);
    }
  }

  console.log('\n=== Concluido! ===');
  console.log('Email:', ADMIN_EMAIL);
  console.log('Senha:', ADMIN_PASSWORD);
  console.log('Usuario ID:', userId);
  console.log('Empresa ID:', empresaData.id);
}

createAdmin().catch(console.error);
