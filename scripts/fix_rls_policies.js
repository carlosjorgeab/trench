const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msrpgopzmmntyigbcaug.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_oO6Q-Q04gUw6ffTRwSYvVw_M9SV5k4g'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const policyList = [
  // USUARIOS
  `CREATE POLICY "usuarios_select_own" ON usuarios
    FOR SELECT USING (auth.uid() = id);`,

  `CREATE POLICY "usuarios_select_admin" ON usuarios
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM usuarios u 
        WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
      )
    );`,

  `CREATE POLICY "usuarios_update_own" ON usuarios
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);`,

  // EMPRESAS
  `CREATE POLICY "empresas_select_own" ON empresas
    FOR SELECT USING (
      id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
    );`,

  `CREATE POLICY "empresas_select_admin" ON empresas
    FOR SELECT USING (
      EXISTS (
        SELECT 1 FROM usuarios u 
        WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
      )
    );`,
]

async function execute() {
  console.log('=== CRIANDO POLÍTICAS RLS ===\n')

  for (const policy of policyList) {
    const nameMatch = policy.match(/CREATE POLICY "([^"]+)"/)
    const name = nameMatch ? nameMatch[1] : 'unknown'
    
    console.log(`Criando: ${name}...`)
    const { error } = await supabase.rpc('execute_sql', { sql: policy })
    
    if (error) {
      // Tentar via query direta se RPC não existir
      console.log(`  RPC falhou, tentando direto...`)
      // Não há como executar DDL direto via client, precisa ser no SQL Editor
      console.log(`  ERRO: ${error.message}`)
      console.log(`  Execute manualmente no Supabase SQL Editor:`)
      console.log(policy)
      console.log('')
    } else {
      console.log(`  ✅ Criada`)
    }
  }

  // Verificar políticas criadas
  console.log('\n=== VERIFICANDO POLÍTICAS ===')
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('tablename, policyname, cmd')
    .in('tablename', ['usuarios', 'empresas'])
  
  console.table(policies || [])
}

execute().catch(console.error)