# Modelo Financeiro do Sistema ERP

Este documento detalha as regras matemáticas, contábeis e operacionais que regem o módulo financeiro do ERP.

---

## 1. Princípios Inegociáveis

1. **Faturamento não é Recebimento:**
   - A emissão de uma venda ou de uma cobrança contratual cria um direito creditório formal (título a receber em `financial_titles`).
   - Ela **não** altera o saldo disponível em nenhuma conta bancária nem constitui dinheiro em caixa.
2. **Conta a Receber não Aumenta Caixa Realizado:**
   - Apenas a liquidação efetiva (`financial_settlements`) acompanhada da movimentação bancária (`financial_movements`) converte uma expectativa de receita em saldo disponível.
3. **Pagamento Efetivado Movimenta Saldo Bancário:**
   - Toda entrada ou saída de dinheiro real deve estar associada a uma conta financeira (`financial_accounts`) e gerar um registro imutável em `financial_movements`.
4. **Suporte a Pagamentos Parciais:**
   - Um título de R$ 1.000,00 pode ser liquidado em múltiplas parcelas (ex: R$ 300,00 hoje, R$ 700,00 daqui a 15 dias).
   - O saldo devedor do título é recalculado a cada liquidação (`remaining_amount = original_amount - sum(settlements.amount)`).
   - O status transita para `PARTIALLY_PAID` enquanto houver saldo residual e para `PAID` quando o saldo residual for zerado.
5. **Transferência Interna Não é Receita Nem Despesa:**
   - A movimentação entre contas da mesma empresa (ex: Conta Corrente -> Aplicação de Liquidez Diária) é neutra para o resultado operacional (DRE).
   - Gera um par de movimentações vinculadas: um débito na conta de origem e um crédito na conta de destino com categoria de transferência.
6. **Imutabilidade e Trilha de Auditoria:**
   - Registros de liquidação confirmados **nunca** são excluídos via `DELETE`.
   - Caso um pagamento tenha sido registrado incorretamente (ex: valor errado ou cliente errado), a correção é feita exclusivamente via **Estorno (`REVERSAL`)**, que cria um contra-lançamento e anula a liquidação original mantendo o histórico auditável.
7. **Regime de Caixa vs. Competência:**
   - **Fluxo de Caixa:** Ordenado pela data efetiva de pagamento/movimentação (`movement_date`).
   - **DRE / Resultado:** Ordenado pela data de competência da prestação ou venda (`competence_date`).

---

## 2. Tipos de Dados, Moeda e Precisão

| Aspecto | Especificação Técnica | Justificativa |
| :--- | :--- | :--- |
| **Moeda Padrão** | `BRL` (Real brasileiro) | Padrão nacional brasileiro. |
| **Tipo de Banco** | `NUMERIC(14, 2)` | Evita erros de arredondamento inerentes ao IEEE 754 de tipos float/double. |
| **Camada de Aplicação** | Centavos em número inteiro (`valueInCents`) ou Decimal exato | Garante que somas e rateios não produzam frações residuais imperceptíveis. |
| **Arredondamento** | Padrão Round Half-Even (Bancário) | Minimização de viés estatístico cumulativo na divisão de parcelas. |
| **Datas de Negócio** | `DATE` | Vencimento e competência não dependem de horário de servidor. |
| **Datas de Auditoria** | `TIMESTAMPTZ` | Instantes de execução de transações registrados com precisão de fuso horário. |

---

## 3. Política de Recorrência para Fim de Mês (Dias 29, 30 e 31)

Quando uma contratação recorrente possui vencimento convencionado para o dia 29, 30 ou 31, os meses com menos dias são tratados com a seguinte regra determinística:
- Se o mês de competência possuir menos dias que o dia base de vencimento, a data de vencimento daquele mês será o **último dia do respectivo mês**.
- Exemplo:
  - Contrato assinado com vencimento no dia 31:
    - Janeiro: vence em 31/01.
    - Fevereiro: vence em 28/02 (ou 29/02 em anos bissextos).
    - Março: vence em 31/03.
    - Abril: vence em 30/04.
- Essa regra preserva a intenção de cobrança no encerramento do ciclo mensal sem deslocar o vencimento para o mês subsequente.

---

## 4. Idempotência na Geração de Títulos

A geração automática de cobranças mensais utiliza uma chave de idempotência composta:
$$\text{Idempotency Key} = \text{contract\_id} + \text{"\_"} + \text{YYYY-MM}$$

No banco de dados, a tabela `financial_titles` possui a restrição:
```sql
CONSTRAINT uq_contract_period UNIQUE (contract_id, period_key)
```
Se o job de faturamento for reexecutado ou disparado simultaneamente por múltiplos workers, o banco rejeita a inserção duplicada sem gerar faturamentos redundantes.

---

## 5. Ciclo de Vida e Máquina de Estados

### 5.1 Título Financeiro (`financial_titles`)
```text
           ┌──────────┐
           │ PENDING  │
           └────┬─────┘
                │
     ┌──────────┴──────────┐
     ▼                     ▼
┌──────────────┐     ┌───────────┐
│PARTIALLY_PAID│     │   PAID    │
└──────┬───────┘     └─────┬─────┘
       │                   │
       ▼                   ▼
┌──────────────┐     ┌───────────┐
│     PAID     │     │ REVERSED  │ (via estorno)
└──────────────┘     └───────────┘
```
- `PENDING`: Aberto, aguardando liquidação.
- `PARTIALLY_PAID`: Parcialmente liquidado, com saldo devedor remanescente > 0.
- `PAID`: Totalmente liquidado (saldo devedor = 0).
- `OVERDUE`: Título com `due_date < CURRENT_DATE` e `status IN ('PENDING', 'PARTIALLY_PAID')`.
- `CANCELED`: Título cancelado antes da liquidação.

### 5.2 Liquidação (`financial_settlements`)
- `CONFIRMED`: Baixa registrada com sucesso e saldo bancário creditado/debitado.
- `REVERSED`: Baixa estornada por operação auditada.
