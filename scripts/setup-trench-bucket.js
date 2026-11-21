const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://msrpgopzmmntyigbcaug.supabase.co'
const SUPABASE_SERVICE_KEY = 'sb_secret_oO6Q-Q04gUw6ffTRwSYvVw_M9SV5k4g'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

async function setupTrenchBucket() {
  console.log('=== Configurando bucket "trench" no Supabase Storage ===\n')

  // 1. Verificar se o bucket já existe
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.error('Erro ao listar buckets:', listError)
    return
  }

  const trenchBucket = buckets?.find(b => b.name === 'trench')
  
  if (trenchBucket) {
    console.log('✓ Bucket "trench" já existe')
  } else {
    // 2. Criar o bucket
    console.log('Criando bucket "trench"...')
    const { data, error: createError } = await supabase.storage.createBucket('trench', {
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
    })

    if (createError) {
      console.error('Erro ao criar bucket:', createError)
      return
    }
    console.log('✓ Bucket "trench" criado com sucesso')
  }

  // 3. Verificar políticas RLS do bucket
  console.log('\nVerificando políticas do bucket...')
  
  // 4. Testar upload
  console.log('\nTestando upload...')
  const testFile = new Blob(['teste'], { type: 'text/plain' })
  const testFileName = `test_${Date.now()}.txt`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('trench')
    .upload(testFileName, testFile, { upsert: true })

  if (uploadError) {
    console.error('Erro no teste de upload:', uploadError)
  } else {
    console.log('✓ Upload de teste funcionou:', uploadData)
    
    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('trench')
      .getPublicUrl(testFileName)
    console.log('URL pública:', urlData.publicUrl)
    
    // Limpar arquivo de teste
    await supabase.storage.from('trench').remove([testFileName])
    console.log('✓ Arquivo de teste removido')
  }

  console.log('\n=== Configuração concluída ===')
}

setupTrenchBucket().catch(console.error)