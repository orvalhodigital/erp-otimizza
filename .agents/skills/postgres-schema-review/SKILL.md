---
name: postgres-schema-review
description: >-
  Auditoria e revisão de qualidade técnica de esquemas PostgreSQL, DDL, constraints,
  índices, migrations versionadas e integridade relacional do ERP. Acione esta skill
  ao criar ou revisar migrações SQL, índices e diagramas de banco de dados.
---

# PostgreSQL Schema Review & Quality Guidelines

Esta skill orienta a criação, revisão e manutenção de migrações DDL e esquemas relacionais PostgreSQL no ERP. A arquitetura canônica de banco está documentada em [docs/architecture/database.md](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/architecture/database.md).

## 1. Princípios Relacionais Fundamentais
- **Tipos de Chave Primária:** Utilizar `UUID` (gerado por `gen_random_uuid()` no PostgreSQL >= 13) para entidades de negócio externas (clientes, pedidos, contratos), ou `BIGINT GENERATED ALWAYS AS IDENTITY` para tabelas de altíssimo volume interno ou logs sequenciais.
- **Tipos Monetários:** **OBRIGATÓRIO** `NUMERIC(14, 2)` (ou `NUMERIC(15, 4)` para quantidades e taxas). Proibido `FLOAT`, `REAL` ou `DOUBLE PRECISION`.
- **Datas e Horários:**
  - `TIMESTAMPTZ` para instantes no tempo (`created_at`, `updated_at`, `settled_at`).
  - `DATE` para datas de negócio sem hora (`due_date`, `competence_date`, `birth_date`).
- **Nulabilidade:** Colunas devem ser `NOT NULL` por padrão, a menos que a ausência de valor seja um estado de negócio válido e justificado.
- **Integridade Referencial:** Toda chave estrangeira (`FOREIGN KEY`) deve especificar expressamente sua cláusula de integridade (`ON DELETE RESTRICT` como padrão seguro; `CASCADE` apenas para dependências fortes como itens de pedido/contrato).

## 2. Índices e Performance
- Criar índices explicitamente para:
  1. Todas as colunas de chave estrangeira (`FK`).
  2. Colunas utilizadas em filtros frequentes (`status`, `due_date`, `created_at`).
  3. Campos de busca textual normalizada (ex: `cpf_cnpj` limpo, `email`).
  4. Constraints `UNIQUE` com índices parciais onde aplicável (ex: unicidade de documento apenas para registros ativos/não nulos: `CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL AND document IS NOT NULL`).

## 3. Gestão de Migrations
- **Arquivo Único por Mudança:** Migrations devem ser versionadas em ordem sequencial com timestamp ou numeração estrita (ex: `001_init_schema.sql`, `002_create_clients.sql`).
- **Atomicidade:** Toda migration DDL deve rodar dentro de uma transação (`BEGIN ... COMMIT`) quando suportado pelo PostgreSQL.
- **Tabela de Controle:** A tabela `_migrations` armazena `id`, `name`, `checksum`, `applied_at` para garantir execução única e verificar se scripts anteriores foram adulterados.
- **Proibição de Execução Prematura:** Não aplicar migrations em bancos reais se houver decisões críticas de arquitetura em aberto (ex: modelo multiempresa vs. monoempresa, motor de estoque).

## Checklist de Revisão de DDL
- [ ] Chaves primárias e estrangeiras declaradas com tipos consistentes.
- [ ] Campos monetários usam `NUMERIC`.
- [ ] Datas usam `TIMESTAMPTZ` ou `DATE`.
- [ ] Índices adicionados para chaves estrangeiras.
- [ ] Regras de `CHECK` presentes para campos de enum/status ou valores não negativos (ex: `CHECK (amount >= 0)`).
- [ ] Script de rollback ou migração reversível planejado.
