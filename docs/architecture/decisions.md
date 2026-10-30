# Registro de Decisões Arquiteturais (ADRs)

Este documento registra as principais decisões técnicas tomadas para o Sistema ERP, seus contextos e suas justificativas.

---

## ADR 001: Adoção de Monólito Modular com Next.js (App Router)

- **Status:** Aceito
- **Contexto:** Necessidade de construir um ERP ágil, de fácil manutenção e com suporte completo a transações financeiras consistentes.
- **Decisão:** Adotar Next.js com App Router em um único monólito modular, estruturado em pastas de domínio (`src/modules/*`).
- **Consequências:**
  - *Positivas:* Menor sobrecarga operacional, transações ACID nativas no banco, facilidade de refatoração e compartilhamento de tipagem TypeScript entre cliente e servidor.
  - *Negativas:* Necessidade de disciplina rigorosa para manter as fronteiras de módulos desacopladas.

---

## ADR 002: PostgreSQL Direto via Driver `pg` sem ORM Pesado

- **Status:** Aceito
- **Contexto:** Sistemas financeiros exigem controle absoluto sobre consultas SQL, bloqueios transacionais (`SELECT FOR UPDATE`), índices e precisão de arredondamento. ORMs pesados (ex: Prisma, TypeORM) frequentemente geram queries ineficientes, dificultam migrações complexas e adicionam sobrecarga de abstração.
- **Decisão:** Utilizar o driver nativo `pg` com pool de conexões gerenciado, SQL explícito e migrations DDL versionadas com tabela de controle `_migrations`.
- **Consequências:**
  - *Positivas:* Transparência completa do SQL executado, controle estrito de tipos e constraints, facilidade de inspeção de planos de execução (`EXPLAIN ANALYZE`).
  - *Negativas:* Escrita manual de queries e mapeamento de resultados para tipos TypeScript.

---

## ADR 003: Representação Numérica de Valores Monetários (`NUMERIC` no Banco e Centavos na Aplicação)

- **Status:** Aceito
- **Contexto:** Tipos de ponto flutuante (`FLOAT`, `DOUBLE`, `REAL`) causam imprecisões inaceitáveis em cálculos financeiros (ex: `0.1 + 0.2 = 0.30000000000000004`).
- **Decisão:** No banco de dados, todas as colunas monetárias usam `NUMERIC(14, 2)`. Na camada de aplicação, operações de rateio e soma podem ser representadas em centavos inteiros (`bigint` ou `number`) ou bibliotecas de precisão decimal arbitrária com arredondamento padronizado Half-Even / Round Half Up.
- **Consequências:**
  - *Positivas:* Erro zero de arredondamento em balanços e extratos financeiros.
  - *Negativas:* Conversões explícitas entre formato formatado (BRL), centavos e `NUMERIC` na camada de persistência.

---

## ADR 004: Imutabilidade Histórica de Preços em Vendas e Contratos

- **Status:** Aceito
- **Contexto:** Se o preço de um produto ou serviço for reajustado no catálogo, vendas passadas e contratos já vigentes não podem ter seus valores alterados retroativamente.
- **Decisão:** Tabelas de transação (`sale_items`, `contract_items`, `financial_titles`) gravam snapshots dos valores negociados (`unit_price`, `quantity`, `total_amount`), desacoplando-se permanentemente da tabela de produtos após o fechamento.
- **Consequências:**
  - *Positivas:* Rastreabilidade histórica e fidelidade jurídica e contábil.
  - *Negativas:* Duplicação intencional de dados de valor no momento da transação.

---

## ADR 005: Idempotência Obrigatória na Geração de Cobranças Recorrentes

- **Status:** Aceito
- **Contexto:** Jobs periódicos de faturamento que falham no meio da execução podem ser reexecutados e gerar cobranças duplicadas para o mesmo cliente e mês.
- **Decisão:** Cada cobrança periódica possui uma chave de unicidade (`contract_id` + `period_key`, ex: `contract-123_2026-11`), resguardada por restrição `UNIQUE` no banco de dados.
- **Consequências:**
  - *Positivas:* Impossibilidade física de duplicar boletos ou títulos financeiros no mesmo período contratual.
  - *Negativas:* Exigência de composição explícita de `period_key` em toda rotina de faturamento.

---

## ADR 006: Proibição de Deleção Física em Transações Financeiras (Auditoria via Estorno)

- **Status:** Aceito
- **Contexto:** Transações bancárias e liquidações não podem ser apagadas fisicamente, sob pena de corromper a reconciliação e o histórico fiscal.
- **Decisão:** Movimentações de caixa e liquidações são imutáveis. Erros operacionais são corrigidos exclusivamente por contra-lançamento de estorno (`REVERSAL`), vinculado ao registro original e com justificativa obrigatória.
- **Consequências:**
  - *Positivas:* Trilha de auditoria 100% íntegra para fins fiscais e de auditoria interna.
  - *Negativas:* Consultas de saldo devem considerar contra-lançamentos ou saldos consolidados de forma consistente.
