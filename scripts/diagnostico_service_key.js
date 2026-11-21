const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msrpgopzmmntyigbcaug.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_oO6Q-Q04gUw6ffTRwSYvVw_M9SV5k4g'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

async function runDiagnostics() {
  console.log('=== DIAGNÓSTICO SUPABASE (Service Key) ===\n')

  // 1. Constraints na tabela usuarios
  console.log('1. CONSTRAINTS USUARIOS:')
  const { data: constraints, error: cErr } = await supabase.rpc('get_constraints', { table_name: 'usuarios' })
  if (cErr) {
    // Fallback: query direta
    const { data, error } = await supabase.from('pg_constraint').select('*').eq('conrelid', 'usuarios::regclass')
    console.log(data || error)
  } else {
    console.log(constraints)
  }

  // 2. Todos os usuários com suas empresas
  console.log('\n2. USUÁRIOS E EMPRESAS:')
  const { data: users, error: uErr } = await supabase
    .from('usuarios')
    .select(`
      id, nome, email, empresa_id, ativo, perfil,
      empresas ( id, nome, ativo, tipo )
    `)
    .order('created_at', { ascending: false })

  if (uErr) console.log('ERRO:', uErr)
  else console.table(users?.map(u => ({
    id: u.id,
    nome: u.nome,
    email: u.email,
    perfil: u.perfil,
    ativo: u.ativo,
    empresa_id: u.empresa_id,
    empresa_nome: u.empresas?.[0]?.nome || 'N/A',
    empresa_ativa: u.empresas?.[0]?.ativo || 'N/A',
    empresa_tipo: u.empresas?.[0]?.tipo || 'N/A'
  })) || 'Nenhum usuário')

  // 3. Usuários órfãos (empresa_id inválido)
  console.log('\n3. USUÁRIOS ÓRFÃOS (empresa_id não existe em empresas):')
  const { data: orphans, error: oErr } = await supabase
    .from('usuarios')
    .select('id, nome, email, empresa_id, ativo')
    .not('empresa_id', 'is', null)

  if (!oErr && orphans) {
    for (const u of orphans) {
      const { data: emp } = await supabase.from('empresas').select('id').eq('id', u.empresa_id).maybeSingle()
      if (!emp) {
        console.log(`  ÓRFÃO: ${u.nome} (${u.email}) - empresa_id: ${u.empresa_id}`)
      }
    }
  }

  // 4. Status RLS
  console.log('\n4. STATUS RLS:')
  const { data: rls, error: rErr } = await supabase
    .from('pg_tables')
    .select('schemaname, tablename, rowsecurity')
    .in('tablename', ['usuarios', 'empresas'])
  console.table(rls || rErr)

  // 5. Políticas RLS
  console.log('\n5. POLÍTICAS RLS:')
  const { data: policies, error: pErr } = await supabase
    .from('pg_policies')
    .select('tablename, policyname, permissive, roles, cmd, qual')
    .in('tablename', ['usuarios', 'empresas'])
  console.table(policies || pErr)

  // 6. Testar query exata do app (user-context)
  console.log('\n6. TESTE QUERY APP (simulando anon key):')
  if (users && users.length > 0) {
    const testUser = users[0]
    console.log(`Testando com usuário: ${testUser.nome} (${testUser.id})`)
    
    const { data: appQuery } = await supabase
      .from('usuarios')
      .select('id, nome, email, perfil, ativo, empresa_id')
      .eq('id', testUser.id)
      .eq('ativo', true)
      .maybeSingle()
    console.log('Resultado query usuario:', appQuery)

    if (appQuery?.empresa_id) {
      const { data: empQuery } = await supabase
        .from('empresas')
        .select('nome, tipo, ativo')
        .eq('id', appQuery.empresa_id)
        .maybeSingle()
      console.log('Resultado query empresa:', empQuery)
    }
  }
}

runDiagnostics().catch(console.error)