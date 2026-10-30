# Estratégia de Testes e Pirâmide de Qualidade

Este documento define a metodologia, os tipos e os critérios de aceitação para testes automatizados no Sistema ERP.

---

## 1. Princípios da Pirâmide de Testes

Adotamos uma abordagem focada em testes rápidos e determinísticos com [Vitest](https://vitest.dev/), estruturados em três níveis:

```text
       / \
      / E2E \       --> Playwright (Fluxos críticos de ponta a ponta na UI)
     /-------\
    / Integração\   --> Vitest + PostgreSQL Test DB (Migrações, Queries, Repositórios)
   /-------------\
  /   Unitários   \ --> Vitest (Regras de Negócio, Cálculo de Centavos, Idempotência)
 /-----------------\
```

---

## 2. Divisão das Suítes de Teste

### 2.1 Testes Unitários (`tests/unit/`)
- **Foco:** Funções puras, validação de schemas Zod, cálculos financeiros de centavos e arredondamento, validação de dígitos de CPF/CNPJ, regras de transição de status e cálculo de vencimento em fim de mês.
- **Isolamento:** Executam sem dependência de banco de dados ou rede externa, garantindo tempo de execução inferior a 2 segundos para centenas de testes.

### 2.2 Testes de Integração (`tests/integration/`)
- **Foco:** Camada de acesso a dados (`src/lib/db/`), execução do runner de migrações, transações com `BEGIN ... COMMIT` e integridade de chaves estrangeiras.
- **Ambiente:** Executam contra um banco de dados dedicado e isolado (`DATABASE_URL_TEST`), garantindo que os dados de teste nunca se misturem aos de desenvolvimento.

### 2.3 Testes End-to-End (`tests/e2e/`)
- **Foco:** Simulação de navegação do usuário real (login, cadastro de cliente, lançamento de venda, baixa de título e atualização de saldo).
- **Ferramenta:** Playwright (a ser implementado na Fase 9 após o desenvolvimento das interfaces visuais).

---

## 3. Matriz de Cenários Prioritários a Testar

| Domínio | Cenário de Teste | Camada | Critério de Aceite |
| :--- | :--- | :--- | :--- |
| **Clientes** | Validação de CPF válido e inválido | Unitário | Rejeita dígitos verificadores incorretos; aceita documento normalizado. |
| **Clientes** | Validação de CNPJ válido e inválido | Unitário | Rejeita dígitos verificadores incorretos; aceita documento normalizado. |
| **Financeiro** | Divisão de parcelas com centavos ímpares | Unitário | A soma das parcelas rateadas bate centavo por centavo com o total do título. |
| **Financeiro** | Recorrência em 31/01 para fevereiro | Unitário | Em ano comum resulta em 28/02; em ano bissexto resulta em 29/02. |
| **Financeiro** | Idempotência de cobrança recorrente | Integração | Segunda tentativa de inserção do par `(contract_id, period_key)` dispara erro de violação de unicidade. |
| **Financeiro** | Pagamento parcial | Unitário/Integração | Reduz `remaining_amount`, atualiza `paid_amount` e transita status para `PARTIALLY_PAID`. |
| **Financeiro** | Estorno de liquidação | Integração | Restaura saldo devedor do título, gera movimento de contrapartida e marca liquidação como `REVERSED`. |
| **Financeiro** | Transferência entre contas | Integração | Cria movimento a débito na origem e a crédito no destino com valores idênticos. |
| **Catálogo** | Snapshot de preço em venda | Integração | Alterar preço base do produto não afeta `unit_price` gravado em `sale_items`. |

---

## 4. Execução dos Testes

```bash
# Executa todos os testes da suíte
npm run test

# Executa em modo watch (reexecuta ao salvar arquivos)
npm run test:watch
```
