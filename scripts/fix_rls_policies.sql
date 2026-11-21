-- Fix RLS Policies - Execute no Supabase SQL Editor
-- ou rode via: node scripts/fix_rls_policies.js

-- ============================================
-- POLÍTICAS PARA USUARIOS
-- ============================================

-- 1. Usuário lê próprio registro
CREATE POLICY "usuarios_select_own" ON usuarios
  FOR SELECT USING (auth.uid() = id);

-- 2. Admin_sistema lê todos
CREATE POLICY "usuarios_select_admin" ON usuarios
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );

-- 3. Usuário atualiza próprio registro
CREATE POLICY "usuarios_update_own" ON usuarios
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS PARA EMPRESAS
-- ============================================

-- 1. Usuário lê sua própria empresa
CREATE POLICY "empresas_select_own" ON empresas
  FOR SELECT USING (
    id IN (SELECT empresa_id FROM usuarios WHERE id = auth.uid())
  );

-- 2. Admin_sistema lê todas
CREATE POLICY "empresas_select_admin" ON empresas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM usuarios u 
      WHERE u.id = auth.uid() AND u.perfil = 'admin_sistema'
    )
  );

-- ============================================
-- VERIFICAR
-- ============================================
SELECT * FROM pg_policies WHERE tablename IN ('usuarios', 'empresas');