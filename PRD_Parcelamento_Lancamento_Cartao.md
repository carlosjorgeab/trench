# PRD: Parcelamento no Lançamento de Contas e Cartão de Crédito

## 1. Visão Geral

Este documento descreve o planejamento e as especificações para implementar a funcionalidade de parcelamento no sistema de lançamento de contas e cartão de crédito.

## 2. Contexto

O sistema já possui suporte parcial a parcelamentos através do campo `total_parcelas` no modelo `Lancamento`. O API route `/api/lancamentos` já suporta criar múltiplas parcelas quando `total_parcelas > 1` usando a função `addMonthsToDateStr`.

Campos existentes: `total_parcelas`, `parcela_atual`, `grupo_parcelamento_id`, `dia_vencimento_cartao`, `fatura_referencia`.

## 3. Requisitos de Parcelamento

### 3.1 Opções de Parcelamento

O usuário deve poder escolher o número de parcelas. As opções rápidas disponíveis são: 1x, 2x, 3x, 4x, 5x, 6x, 10x e 12x. A opção "Personalizado" permite informar qualquer quantidade inteira de 1 a 12.

### 3.2 Cálculo de Datas de Vencimento

As datas devem ser determinadas automaticamente com base no dia de vencimento da conta/cartão.

- Primeira parcela: usar função `calcularVencimentoFatura` com `dia_vencimento` da conta
- Parcelas subsequentes: avançar um mês a cada parcela usando `addMonthsToDateStr`
- Ajuste para dias inválidos (ex: 31 de janeiro -> último dia de fevereiro)

### 3.3 Distribuição de Valor

O valor total é distribuído da seguinte maneira:
1. Valor base por parcela: `Math.floor((valorTotal / totalParcelas) * 100) / 100`
2. Diferença de centavos adicionada à primeira parcela: `Math.round((valorTotal - valorParcelaBase * totalParcelas) * 100) / 100`
3. Primeira parcela recebe: `valorParcelaBase + diferencaCentavos`
4. Parcelas restantes recebem: `valorParcelaBase`

### 3.4 Interface do Usuário

#### Tela de Criação/Edição:

- **Select de parcelas**: escolher uma opção rápida ou "Personalizado" (1 a 12)
- **Preview**: mostrar valores e vencimentos de todas as parcelas antes de confirmar, atualizando quando valor, quantidade ou datas mudarem
- **Informações do cartão**: exibir dia de vencimento quando conta for do tipo cartão

#### Exemplo de preview:
"Parcelamento em 3x de R$ 400,00"
"Primeira parcela: 15/01 | Segunda: 15/02 | Terceira: 15/03"

## 4. Fluxo de Trabalho

### Cenário 1: Parcelamento no cartão de crédito

1. Usuário seleciona conta do tipo "Cartão de Crédito"
2. Preenche descrição, valor, data de lançamento
3. Seleciona número de parcelas (ex: 3x)
4. Sistema calcula datas e valores
5. Confirma e sistema cria `total_parcelas` lançamentos com `grupo_parcelamento_id` igual

### Cenário 2: Parcelamento em conta bancária

1. Usuário seleciona conta do tipo "Bancária"
2. Preenche os dados; o primeiro vencimento usa a data de lançamento
3. Seleciona número de parcelas
4. Sistema cria parcelas com datas baseadas na data de lançamento + meses subsequentes

## 5. Casos de Uso

### Caso 1: Parcelamento de R$ 1.200,00 em 3x

- Valor total: R$ 1.200,00
- Conta: Cartão de Crédito (dia_vencimento: 15)
- Data de lançamento: 20/12/2024
- Parcelas: 3x
- Cálculo: valor base R$ 400,00 cada
- Resultado: 3 lançamentos com vencimentos 15/01, 15/02, 15/03

### Caso 2: Parcelamento de R$ 700,00 em 4x

- Valor total: R$ 700,00
- Conta: Cartão de Crédito (dia_vencimento: 10)
- Data de lançamento: 01/03/2025
- Parcelas: 4x
- Cálculo: valor base R$ 175,00 cada
- Resultado: 4 lançamentos com vencimentos 10/04, 10/05, 10/06, 10/07

## 6. Requisitos Técnicos

### Backend (API Routes)

Validar que `total_parcelas` está entre 1 e 12. Melhorar mensagens de erro. Garantir que `addMonthsToDateStr` lide com dias inválidos.

### Frontend

Modificar `app/financeiro/page.tsx` para adicionar select de parcelas e preview. Integrar cálculo automático baseado no cartão selecionado.

## 7. Considerações Finais

- Máximo de 12 parcelas recomendado
- Preview em tempo real da distribuição
- Validação de impossibilidade de parcelamento
- Código seguir padrões do projeto (TypeScript, Next.js, MUI)