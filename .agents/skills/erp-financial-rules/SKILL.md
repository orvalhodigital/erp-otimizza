---
name: erp-financial-rules
description: >-
  Princípios inegociáveis de engenharia financeira, contas a pagar e receber, liquidações,
  fluxo de caixa, conciliação e idempotência do ERP. Acione esta skill sempre que trabalhar
  em entidades financeiras, regras de pagamento, estornos, cálculo de saldos ou relatórios de caixa.
---

# Regras Financeiras Inegociáveis do ERP

Esta skill define as diretrizes matemáticas, relacionais e de domínio financeiro. O modelo canônico detalhado encontra-se em [docs/domain/financial-model.md](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/domain/financial-model.md).

## 1. Princípios Contábeis e Financeiros Fundamentais
1. **Faturamento não é Recebimento:** Emitir uma venda ou gerar um título a receber (`financial_titles`) reconhece direito de crédito, mas **não** afeta o saldo bancário disponível.
2. **Conta a Receber não Aumenta Caixa Realizado:** O fluxo de caixa realizado só é movimentado quando há liquidação efetivada (`financial_settlements`) vinculada a uma movimentação de conta (`financial_movements`).
3. **Pagamento Efetivado Movimenta Saldo:** Toda entrada ou saída de dinheiro real deve estar associada a uma conta financeira (`financial_accounts`) e gerar um registro imutável em `financial_movements`.
4. **Pagamentos Parciais Suportados:** Um título de R$ 1.000,00 pode receber um pagamento parcial de R$ 400,00, mantendo saldo devedor aberto de R$ 600,00 e status `PARTIALLY_PAID`.
5. **Transferência Interna Não é Receita Nem Despesa:** Movimentações entre contas bancárias da mesma empresa (ex: Conta Corrente -> Aplicação) são neutras para DRE/resultado operacional. Devem ser registradas como par casado (débito em uma, crédito em outra) ou tipo específico `TRANSFER`.
6. **Imutabilidade e Auditoria:** Transações financeiras efetivadas **nunca** sofrem `DELETE` nem `UPDATE` destrutivo de valor. Erros são tratados exclusivamente por meio de estorno auditável (`REVERSAL`) com registro de justificativa, usuário e referência ao movimento original.
7. **Não Misturar Fluxo de Caixa e DRE:** Fluxo de caixa analisa movimentação financeira por data de pagamento (regime de caixa). DRE analisa receita/despesa por data de competência (regime de competência).

## 2. Tipos de Dados e Precisão Numérica
- **Tipo de Banco:** **SEMPRE** utilizar `NUMERIC(14, 2)` (ou `NUMERIC(15, 4)` para taxas unitárias/câmbio). **NUNCA** usar `FLOAT`, `DOUBLE` ou `REAL`.
- **Camada de Aplicação:** Utilizar inteiros representando centavos (`valueInCents: number / bigint`) para cálculos intermediários de precisão, ou bibliotecas de precisão decimal arbitrária, evitando erros de ponto flutuante IEEE 754 (ex: `0.1 + 0.2 !== 0.3`).
- **Arredondamento:** Padrão bancário/comercial Half-Even (ou Round Half Up claramente documentado), garantindo que a soma das parcelas seja rigorosamente igual ao total do título. Eventuais diferenças de centavos residuais são atribuídas à primeira ou última parcela.
- **Moeda e Fuso:** Moeda padrão: `BRL` (Real brasileiro). Datas de negócio no banco: `DATE` (para vencimento e competência) e `TIMESTAMPTZ` (para data/hora exata da transação financeira, com fuso horário UTC ou `America/Sao_Paulo`).

## 3. Recorrências e Idempotência
- **Política de Fim de Mês (Dias 29, 30 e 31):** Se uma assinatura ou contratação recorrente tiver vencimento fixado no dia 31, em meses com menos dias (fevereiro, abril, junho, setembro, novembro), a cobrança deve vencer no **último dia útil/corrido do mês** (ex: 28/29 de fevereiro), voltando ao dia 31 nos meses de 31 dias.
- **Idempotência Obrigatória:** Rotinas de geração de cobranças recorrentes devem utilizar chave de idempotência unívoca (ex: `contract_id` + `period_key` como `2026-11`) protegida por constraint `UNIQUE` no banco de dados para impedir cobranças duplicadas em caso de reexecução de jobs.

## 4. Status e Ciclos de Vida
- **Título (`financial_titles`):** `PENDING` -> `PARTIALLY_PAID` -> `PAID`, ou `CANCELED`, ou `OVERDUE`.
- **Liquidação (`financial_settlements`):** `CONFIRMED` -> `REVERSED`.
- **Movimentação (`financial_movements`):** Registrada e confirmada, estornada somente via contra-lançamento.

## Checklist de Revisão de Código Financeiro
- [ ] Nenhum tipo `float` usado para valores monetários.
- [ ] Chave de idempotência presente em endpoints ou comandos de cobrança recorrente.
- [ ] Saldo recalculado ou garantido por transação atômica (`BEGIN ... COMMIT`).
- [ ] Validação de que valor pago não excede saldo remanescente (exceto se juros/multa discriminados).
- [ ] Testes unitários para pagamentos parciais, estornos e virada de mês em fevereiro.
