# Arquitetura do Banco de Dados: Esquema Relacional e Dicionário de Dados

## 1. Visão Geral e Estratégia de Persistência

O Sistema ERP utiliza o **PostgreSQL** como motor relacional primário, aproveitando seu sistema de tipos avançado, integridade referencial rigorosa, constraints expressivas e conformidade com transações ACID completas.

### Convenções de Modelagem:
1. **Nomenclatura:** Tabelas e colunas em inglês, no padrão `snake_case`. Nomes de tabelas no plural (ex: `clients`, `financial_titles`).
2. **Identificadores Primários (PK):** `UUID` v4 gerado nativamente via `gen_random_uuid()` no PostgreSQL, conferindo independência de ordenação externa e segurança contra enumeração.
3. **Datas e Instantes:**
   - `TIMESTAMPTZ` para auditoria (`created_at`, `updated_at`, `deleted_at`, `settled_at`).
   - `DATE` para datas de negócio puras (`due_date`, `competence_date`, `start_date`).
4. **Precisão Numérica:**
   - Valores monetários: `NUMERIC(14, 2)`.
   - Quantidades e taxas percentuais: `NUMERIC(12, 4)`.
   - Proibição estrita de tipos `FLOAT`, `REAL` ou `DOUBLE PRECISION`.
5. **Integridade Referencial:**
   - Padrão para entidades independentes: `ON DELETE RESTRICT`.
   - Dependências fortes (ex: itens de venda pertencentes a uma venda): `ON DELETE CASCADE`.

---

## 2. Dicionário de Dados das Entidades Propostas

### 2.1 Módulo Administrativo e Segurança

#### Tabela: `users`
Armazena os operadores do sistema com credenciais seguras e papel de acesso.
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'OPERATOR' CHECK (role IN ('ADMIN', 'FINANCE', 'SALES', 'OPERATOR')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_users_email ON users(email);
```

#### Tabela: `audit_logs`
Trilha de auditoria imutável para eventos críticos de segurança e alterações financeiras.
```sql
CREATE TABLE audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    entity_name VARCHAR(60) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'REVERSAL', 'LOGIN')),
    old_data JSONB,
    new_data JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_name, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
```

---

### 2.2 Módulo de Clientes

#### Tabela: `clients`
Cadastro unificado de clientes PF e PJ com suporte a soft delete.
```sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(2) NOT NULL CHECK (type IN ('PF', 'PJ')),
    name VARCHAR(200) NOT NULL,
    trade_name VARCHAR(200),
    document VARCHAR(14), -- Apenas dígitos (11 para CPF, 14 para CNPJ)
    email VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMPTZ
);
-- Unicidade parcial: apenas para clientes ativos e com documento informado
CREATE UNIQUE INDEX uq_clients_document_active ON clients(document) WHERE deleted_at IS NULL AND document IS NOT NULL;
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_clients_status ON clients(status);
```

---

### 2.3 Módulo de Catálogo (Produtos e Serviços)

#### Tabela: `products`
Catálogo unificado para produtos simples, serviços e cabeçalho de produtos variáveis.
```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('SIMPLE_PRODUCT', 'VARIABLE_PRODUCT', 'SERVICE')),
    name VARCHAR(200) NOT NULL,
    sku VARCHAR(60),
    unit VARCHAR(10) DEFAULT 'UN',
    base_price NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (base_price >= 0),
    billing_period VARCHAR(20) DEFAULT 'ONE_TIME' CHECK (billing_period IN ('ONE_TIME', 'MONTHLY', 'YEARLY')),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_products_sku ON products(sku) WHERE sku IS NOT NULL;
CREATE INDEX idx_products_type ON products(type);
```

#### Tabela: `product_variants`
Variações específicas de atributos para produtos variáveis (ex: tamanho, cor).
```sql
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- Ex: "Azul / G"
    sku VARCHAR(60) NOT NULL,
    attributes JSONB NOT NULL DEFAULT '{}',
    price NUMERIC(14, 2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX uq_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
```

---

### 2.4 Módulo de Vendas e Contratos

#### Tabela: `sales`
Registro de orçamentos e vendas comerciais pontuais.
```sql
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code BIGINT GENERATED ALWAYS AS IDENTITY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'CONFIRMED', 'CANCELED')),
    total_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sales_client ON sales(client_id);
CREATE INDEX idx_sales_date ON sales(sale_date);
```

#### Tabela: `sale_items`
Itens da venda com snapshot imutável de valores e referências.
```sql
CREATE TABLE sale_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    description VARCHAR(250) NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(14, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_sale_items_sale ON sale_items(sale_id);
```

#### Tabela: `contracts`
Compromissos de fornecimento contínuo e assinaturas.
```sql
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    title VARCHAR(200) NOT NULL,
    billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('ONE_TIME', 'MONTHLY', 'YEARLY')),
    due_day SMALLINT NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'ACTIVE', 'SUSPENDED', 'CANCELED', 'COMPLETED')),
    total_recurring_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (total_recurring_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contracts_client ON contracts(client_id);
CREATE INDEX idx_contracts_status ON contracts(status);
```

#### Tabela: `contract_items`
Itens e serviços contratados sob o regime recorrente.
```sql
CREATE TABLE contract_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE RESTRICT,
    variant_id UUID REFERENCES product_variants(id) ON DELETE RESTRICT,
    description VARCHAR(250) NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(14, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(14, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_contract_items_contract ON contract_items(contract_id);
```

---

### 2.5 Módulo Financeiro

#### Tabela: `financial_accounts`
Contas bancárias, caixas físicos e aplicações da empresa.
```sql
CREATE TABLE financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL, -- Ex: "Banco do Brasil - C/C", "Caixa Geral"
    bank_name VARCHAR(100),
    account_type VARCHAR(30) NOT NULL DEFAULT 'CHECKING' CHECK (account_type IN ('CHECKING', 'SAVINGS', 'CASH', 'INVESTMENT')),
    initial_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    current_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabela: `financial_categories`
Plano de contas gerencial para categorização de receitas e despesas.
```sql
CREATE TABLE financial_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'TRANSFER')),
    parent_id UUID REFERENCES financial_categories(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_financial_cat_parent ON financial_categories(parent_id);
```

#### Tabela: `financial_titles`
Títulos de crédito a pagar e a receber (obrigações e direitos).
```sql
CREATE TABLE financial_titles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('RECEIVABLE', 'PAYABLE')),
    client_id UUID REFERENCES clients(id) ON DELETE RESTRICT,
    sale_id UUID REFERENCES sales(id) ON DELETE RESTRICT,
    contract_id UUID REFERENCES contracts(id) ON DELETE RESTRICT,
    category_id UUID NOT NULL REFERENCES financial_categories(id) ON DELETE RESTRICT,
    period_key VARCHAR(30), -- Ex: "2026-11" para idempotência em recorrências
    title_number VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    original_amount NUMERIC(14, 2) NOT NULL CHECK (original_amount > 0),
    paid_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    remaining_amount NUMERIC(14, 2) NOT NULL CHECK (remaining_amount >= 0),
    due_date DATE NOT NULL,
    competence_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PARTIALLY_PAID', 'PAID', 'CANCELED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
-- Idempotência estrita: impede duas cobranças para o mesmo contrato e período
CREATE UNIQUE INDEX uq_contract_period ON financial_titles(contract_id, period_key) WHERE contract_id IS NOT NULL AND period_key IS NOT NULL;
CREATE INDEX idx_titles_due_date ON financial_titles(due_date);
CREATE INDEX idx_titles_status ON financial_titles(status);
CREATE INDEX idx_titles_client ON financial_titles(client_id);
```

#### Tabela: `financial_settlements`
Registro de baixas e liquidações (integrais ou parciais).
```sql
CREATE TABLE financial_settlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_id UUID NOT NULL REFERENCES financial_titles(id) ON DELETE RESTRICT,
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    interest_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (interest_amount >= 0),
    fine_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (fine_amount >= 0),
    discount_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00 CHECK (discount_amount >= 0),
    settlement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('PIX', 'BOLETO', 'CREDIT_CARD', 'BANK_TRANSFER', 'CASH')),
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'REVERSED')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_settlements_title ON financial_settlements(title_id);
CREATE INDEX idx_settlements_account ON financial_settlements(account_id);
```

#### Tabela: `financial_movements`
Livro-caixa e extrato bancário de movimentações financeiras efetivadas.
```sql
CREATE TABLE financial_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES financial_accounts(id) ON DELETE RESTRICT,
    settlement_id UUID REFERENCES financial_settlements(id) ON DELETE RESTRICT,
    type VARCHAR(10) NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    movement_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description VARCHAR(255) NOT NULL,
    transfer_pair_id UUID REFERENCES financial_movements(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_movements_account_date ON financial_movements(account_id, movement_date);
```

---

## 3. Estratégia de Migrações e Rollback

1. **Localização:** `database/migrations/` com prefixo sequencial de 3 dígitos (ex: `001_initial_schema.sql`).
2. **Execução:** Controlada pelo script `tsx src/lib/db/migrate.ts`.
3. **Rastreamento:** A tabela `_migrations` registra `id`, `name`, `checksum_sha256` e `applied_at`.
4. **Política de Segurança:**
   - Proibido rodar migrações destrutivas (`DROP TABLE`, `DROP COLUMN`) em ambiente de produção sem plano formal de migração em duas fases (expand and contract).
   - Nenhuma migração de tabelas com decisões de negócio críticas em aberto é executada automaticamente antes de deliberação.
