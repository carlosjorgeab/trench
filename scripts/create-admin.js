// Script de criacao de usuario admin no Supabase
// Execute com: node scripts/create-admin.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://msrpgopzmmntyigbcaug.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'sb_secret_oO6Q-Q04gUw6ffTRwSYvVw_M9SV5k4g';

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
  console.log('=== Criacao de Usuário Admin ===\n');

  // 1. Criar usuário na autenticação
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    email_confirm: true,
    user_metadata: {
      nome: ADMIN_NOME,
      tipo: 'admin',
    },
  });

  if (authError) {
    if (authError.message.includes('already registered')) {
      console.log('[INFO] Usuário ja existe na autenticacao. Buscando...');
    } else {
      console.log('[ERROR] Ao criar usuario:', authError.message);
      return;
    }
  } else {
    console.log('[OK] Usuário criado na autenticacao:');
    console.log('  ID:', authData.user.id);
    console.log('  Email:', authData.user.email);
  }

  // 2. Buscar ou criar empresa padrão
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
  const userId = authData?.user?.id;
  if (userId) {
    const { data: existingUser, error: selectError } = await supabase
      .from('usuario')
      .select('*')
      .eq('id', userId)
      .single();

    if (selectError && selectError.code !== 'PGRST116') {
      console.log('[ERROR] Ao buscar usuario:', selectError.message);
      return;
    }

    if (!existingUser) {
      const { error: insertError } = await supabase
        .from('usuario')
        .insert({
          id: userId,
          empresa_id: empresaData.id,
          nome: ADMIN_NOME,
          email: ADMIN_EMAIL,
          ativo: true,
        });

      if (insertError) {
        console.log('[ERROR] Ao criar registro de usuario:', insertError.message);
        return;
      }
      console.log('[OK] Registro de usuario criado na tabela usuarios');
    } else {
      console.log('[OK] Registro de usuario ja existe');
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

  for (const modulo of modulos) {
    const { error: permError } = await supabase
      .from('permissoes')
      .upsert({
        usuario_id: userId,
        modulo: modulo,
        criar: true,
        alterar: true,
        deletar: true,
      }, {
        onConflict: 'usuario_id,modulo',
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
}

createAdmin().catch(console.error);