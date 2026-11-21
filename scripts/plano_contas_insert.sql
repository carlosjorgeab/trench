-- Plano de Contas Simplificado (Resolução CFC 1.418 de 2012)
-- Fonte: https://www.lefisc.com.br/plano_de_contas/html/plano_de_contas_simplificado_2016.htm
-- Tabela: plano_contas

-- Limpar dados existentes (opcional, descomente se necessário)
-- DELETE FROM plano_contas;

-- Inserir dados com parent_id baseado na hierarquia

-- Nível 1
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, NULL, 1, '1', 'ATIVO', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, NULL, 1, '2', 'PASSIVO E PATRIMÔNIO LÍQUIDO', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, NULL, 1, '3', 'RECEITAS, CUSTOS E DESPESAS (CONTAS DE RESULTADO)', NULL, true);

-- Nível 2
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1' LIMIT 1), 2, '1.1', 'ATIVO CIRCULANTE', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1' LIMIT 1), 2, '1.3', 'ATIVO NÃO CIRCULANTE', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2' LIMIT 1), 2, '2.1', 'PASSIVO CIRCULANTE', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2' LIMIT 1), 2, '2.2', 'PASSIVO NÃO CIRCULANTE', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2' LIMIT 1), 2, '2.3', 'PATRIMÔNIO LÍQUIDO', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3' LIMIT 1), 2, '3.1', 'RECEITAS', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3' LIMIT 1), 2, '3.2', 'CUSTOS E DESPESAS', NULL, true);

-- Nível 3
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1' LIMIT 1), 3, '1.1.1', 'Caixa e Equivalentes de Caixa', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1' LIMIT 1), 3, '1.1.2', 'Contas a Receber', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1' LIMIT 1), 3, '1.1.3', 'Estoque', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1' LIMIT 1), 3, '1.1.4', 'Outros Créditos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3' LIMIT 1), 3, '1.3.1', 'Realizável a Longo Prazo', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3' LIMIT 1), 3, '1.3.2', 'Investimentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3' LIMIT 1), 3, '1.3.3', 'Imobilizado', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3' LIMIT 1), 3, '1.3.4', 'Intangível', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.1', 'Fornecedores', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.2', 'Empréstimos e Financiamentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.3', 'Obrigações Fiscais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.4', 'Obrigações Trabalhistas e Sociais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.5', 'Contas a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1' LIMIT 1), 3, '2.1.6', 'Provisões', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.2' LIMIT 1), 3, '2.2.1', 'Financiamentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.2' LIMIT 1), 3, '2.2.2', 'Outras Contas a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3' LIMIT 1), 3, '2.3.1', 'Capital Social', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3' LIMIT 1), 3, '2.3.2', 'Reservas', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3' LIMIT 1), 3, '2.3.3', 'Lucros/Prejuízos Acumulados', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1' LIMIT 1), 3, '3.1.1', 'Receitas de Venda', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1' LIMIT 1), 3, '3.1.2', 'Receitas Financeiras', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1' LIMIT 1), 3, '3.1.3', 'Outras Receitas Operacionais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2' LIMIT 1), 3, '3.2.1', 'Custos dos Produtos, Mercadorias e Serviços Vendidos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2' LIMIT 1), 3, '3.2.2', 'Despesas Operacionais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2' LIMIT 1), 3, '3.2.3', 'Despesas Financeiras', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2' LIMIT 1), 3, '3.2.4', 'Outras Despesas Operacionais', NULL, true);

-- Nível 4
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.1' LIMIT 1), 4, '1.1.1.01', 'Caixa', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.1' LIMIT 1), 4, '1.1.1.02', 'Bancos Conta Movimento', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.2' LIMIT 1), 4, '1.1.2.01', 'Clientes', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.2' LIMIT 1), 4, '1.1.2.02', '(-) Perdas Estimadas com Créditos de Liquidação Duvidosa', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.3' LIMIT 1), 4, '1.1.3.01', 'Mercadorias', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.3' LIMIT 1), 4, '1.1.3.02', 'Produtos Acabados', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.3' LIMIT 1), 4, '1.1.3.03', 'Insumos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.4' LIMIT 1), 4, '1.1.4.01', 'Títulos a Receber', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.4' LIMIT 1), 4, '1.1.4.02', 'Impostos a Recuperar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.1.4' LIMIT 1), 4, '1.1.4.03', 'Outros Valores a Receber', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.1' LIMIT 1), 4, '1.3.1.01', 'Contas a Receber', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.1' LIMIT 1), 4, '1.3.1.02', '(-) Perdas Estimadas com Créditos de Liquidação Duvidosa', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.2' LIMIT 1), 4, '1.3.2.01', 'Participações Societárias', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.2' LIMIT 1), 4, '1.3.2.02', 'Outros Investimentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.01', 'Terrenos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.02', 'Edificações', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.03', 'Máquinas e Equipamentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.04', 'Veículos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.05', 'Móveis e Utensílios', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.3' LIMIT 1), 4, '1.3.3.06', '(-) Depreciação Acumulada', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.4' LIMIT 1), 4, '1.3.4.01', 'Softwares', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '1.3.4' LIMIT 1), 4, '1.3.4.02', '(-) Amortização Acumulada', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.1' LIMIT 1), 4, '2.1.1.01', 'Nacionais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.2' LIMIT 1), 4, '2.1.2.01', 'Empréstimos Bancários', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.2' LIMIT 1), 4, '2.1.2.02', 'Financiamentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.3' LIMIT 1), 4, '2.1.3.01', 'SIMPLES NACIONAL', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.3' LIMIT 1), 4, '2.1.3.02', 'ICMS a Recolher', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.3' LIMIT 1), 4, '2.1.3.03', 'ISSQN a Recolher', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.4' LIMIT 1), 4, '2.1.4.01', 'Salários a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.4' LIMIT 1), 4, '2.1.4.02', 'FGTS a Recolher', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.4' LIMIT 1), 4, '2.1.4.03', 'INSS dos Segurados a Recolher', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.5' LIMIT 1), 4, '2.1.5.01', 'Telefone a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.5' LIMIT 1), 4, '2.1.5.02', 'Energia a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.5' LIMIT 1), 4, '2.1.5.03', 'Aluguel a Pagar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.6' LIMIT 1), 4, '2.1.6.01', 'Provisão de Férias', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.6' LIMIT 1), 4, '2.1.6.02', 'Provisão de 13º Salário', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.1.6' LIMIT 1), 4, '2.1.6.03', 'Provisão de Encargos Sociais sobre Férias e 13º Salário', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.2.1' LIMIT 1), 4, '2.2.1.01', 'Financiamentos Banco A', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.2.2' LIMIT 1), 4, '2.2.2.01', 'Empréstimos de Sócios', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.1' LIMIT 1), 4, '2.3.1.01', 'Capital Subscrito', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.1' LIMIT 1), 4, '2.3.1.02', '(-) Capital a Integralizar', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.2' LIMIT 1), 4, '2.3.2.01', 'Reservas de Capital', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.2' LIMIT 1), 4, '2.3.2.02', 'Reservas de Lucros', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.3' LIMIT 1), 4, '2.3.3.01', 'Lucros Acumulados', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '2.3.3' LIMIT 1), 4, '2.3.3.02', '(-) Prejuízos Acumulados', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.1' LIMIT 1), 4, '3.1.1.01', 'Venda de Produtos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.1' LIMIT 1), 4, '3.1.1.02', 'Venda de Mercadorias', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.1' LIMIT 1), 4, '3.1.1.03', 'Venda de Serviços', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.1' LIMIT 1), 4, '3.1.1.04', '(-) Deduções de Tributos, Abatimentos e Devoluções', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.2' LIMIT 1), 4, '3.1.2.01', 'Receitas de Aplicações Financeiras', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.2' LIMIT 1), 4, '3.1.2.02', 'Juros Ativos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.3' LIMIT 1), 4, '3.1.3.01', 'Receitas de Venda de Imobilizado', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.3' LIMIT 1), 4, '3.1.3.02', 'Receitas de Venda de Investimentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.1.3' LIMIT 1), 4, '3.1.3.03', 'Outras Receitas', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.1' LIMIT 1), 4, '3.2.1.01', 'Custos dos Insumos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.1' LIMIT 1), 4, '3.2.1.02', 'Custos da Mão de Obra', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.1' LIMIT 1), 4, '3.2.1.03', 'Outros Custos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.2' LIMIT 1), 4, '3.2.2.01', 'Despesas Administrativas', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.2' LIMIT 1), 4, '3.2.2.02', 'Despesas com Vendas', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.2' LIMIT 1), 4, '3.2.2.03', 'Outras Despesas Gerais', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.3' LIMIT 1), 4, '3.2.3.01', 'Juros Passivos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.3' LIMIT 1), 4, '3.2.3.02', 'Outras Despesas Financeiras', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.4' LIMIT 1), 4, '3.2.4.01', 'Despesas com Baixa de Imobilizado', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.4' LIMIT 1), 4, '3.2.4.02', 'Despesas com Baixa de Investimentos', NULL, true);
INSERT INTO plano_contas (empresa_id, parent_id, nivel, codigo, nome, tipo, ativo) VALUES (2, (SELECT id FROM plano_contas WHERE codigo = '3.2.4' LIMIT 1), 4, '3.2.4.03', 'Outras Despesas', NULL, true);
