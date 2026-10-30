# Sistema ERP Comercial e Financeiro

ERP web modular, confiável, seguro e pragmático para gestão de clientes, catálogo de produtos e serviços, contratos, faturamento, contas a pagar e receber, liquidações e fluxo de caixa.

---

## 1. Visão Geral e Propósito

O **Sistema ERP** foi concebido para fornecer controle operacional e financeiro de ponta a ponta para empresas que necessitam de:
- Gestão centralizada de clientes (Pessoa Física e Jurídica).
- Catálogo flexível (produtos simples, produtos com variações e serviços com faturamento avulso ou recorrente).
- Emissão e gestão de vendas e contratos com imutabilidade de preços históricos.
- Faturamento com periodicidade única, mensal ou anual.
- Controle financeiro rigoroso de títulos a pagar e receber, liquidações parciais, estornos e transferências.
- Fluxo de caixa realizado e projetado em tempo real, sem misturar regime de caixa com competência.

---

## 2. Stack Tecnológica

- **Frontend & Aplicação:** [Next.js](https://nextjs.org/) (App Router, Server Components e Server Actions) com React 19.
- **Linguagem & Tipagem:** [TypeScript](https://www.typescriptlang.org/) em modo estrito (`strict: true`).
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/) com utilitários de design tokens.
- **Componentes de UI:** Padrão [shadcn/ui](https://ui.shadcn.com/) (Radix primitives + Tailwind) sob demanda.
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) acessado diretamente via driver oficial `pg` com pool de conexões gerenciado.
- **Validação de Schemas:** [Zod](https://zod.dev/) para contratos de entrada, variáveis de ambiente e validação de domínio.
- **Testes Automatizados:** [Vitest](https://vitest.dev/) para testes unitários e de integração, com [Playwright](https://playwright.dev/) para testes E2E futuros.
- **Qualidade & Linting:** [ESLint](https://eslint.org/) e TypeScript Compiler.

---

## 3. Requisitos de Ambiente

- **Node.js:** Versão 20 LTS ou 24 LTS (verificada `v24.18.0`).
- **npm:** Versão 10+ (verificada `11.16.0`). *Nota no Windows PowerShell: usar `npm.cmd` se a execução de scripts `.ps1` estiver restrita.*
- **PostgreSQL:** Versão 15+ (local ou container Docker).
- **Git:** Versão 2.30+.

---

## 4. Inicialização Rápida

### 4.1 Clonar e Instalar Dependências
```bash
# Instalação das dependências do projeto
npm install
# (No Windows PowerShell com restrição de política, use npm.cmd install)
```

### 4.2 Configuração de Variáveis de Ambiente
Copie o template de ambiente e configure a string de conexão do PostgreSQL local:
```bash
cp .env.example .env.local
```

Exemplo de configuração no `.env.local`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_erp_dev
DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/sistema_erp_test
```

### 4.3 Verificação da Integridade do Projeto (Quality Gate)
```bash
# Executa linter, checagem de tipos estrita e testes unitários
npm run lint
npm run typecheck
npm run test
```

### 4.4 Inicialização do Servidor de Desenvolvimento
```bash
npm run dev
```
Acesse a aplicação em [http://localhost:3000](http://localhost:3000). A rota de saúde técnica está disponível em [http://localhost:3000/api/health](http://localhost:3000/api/health).

---

## 5. Estrutura de Diretórios

```text
.
├── .agents/skills/          # Skills de IA e automação do Antigravity
│   ├── erp-domain-rules/    # Regras de clientes, catálogo, vendas e contratos
│   ├── erp-financial-rules/ # Princípios de finanças, liquidação e fluxo de caixa
│   ├── postgres-schema-review/ # Boas práticas de DDL, chaves e migrações
│   └── erp-quality-gate/    # Verificação contínua de lint, tipos e testes
├── database/                # Infraestrutura e migrações SQL
│   ├── migrations/          # Scripts DDL sequenciais versionados (.sql)
│   └── seeds/               # Dados de inicialização controlados
├── docs/                    # Documentação canônica do projeto
│   ├── architecture/        # Decisões arquiteturais, visão de banco e ERD
│   ├── decisions/           # Perguntas abertas e registro de decisões (ADRs)
│   ├── development/         # Guias de setup local, testes e troubleshooting
│   ├── domain/              # Regras de negócio comerciais e modelo financeiro
│   ├── mvp.md               # Escopo do MVP e critérios de aceite
│   ├── product-vision.md    # Visão do produto, atores e requisitos
│   └── roadmap.md           # Planejamento das fases de desenvolvimento
├── src/
│   ├── app/                 # Next.js App Router (páginas, layouts, rotas de API)
│   ├── components/          # Componentes de interface compartilhados
│   ├── lib/                 # Utilitários de infraestrutura (banco, logger, env)
│   │   └── db/              # Pool de conexões PostgreSQL e executor de migrações
│   ├── modules/             # Monólito modular dividido por domínios de negócio
│   │   ├── billing/         # Geração de cobranças e faturas
│   │   ├── catalog/         # Produtos, variações e serviços
│   │   ├── clients/         # Gestão de clientes (PF e PJ)
│   │   ├── contracts/       # Contratações e recorrências
│   │   ├── dashboard/       # Agregação de métricas e indicadores
│   │   ├── finance/         # Títulos a pagar/receber, liquidações, caixa
│   │   └── sales/           # Vendas pontuais e orçamentos
│   └── shared/              # Tipos, validações e constantes globais
└── tests/                   # Suítes de testes automatizados
    ├── e2e/                 # Testes end-to-end com Playwright
    ├── integration/         # Testes de integração de banco e rotas
    └── unit/                # Testes unitários de regras de domínio
```

---

## 6. Documentação Canônica

Para aprofundamento técnico e regras de negócio, consulte:
- [Visão do Produto](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/product-vision.md)
- [Escopo do MVP](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/mvp.md)
- [Regras de Negócio](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/domain/business-rules.md)
- [Modelo Financeiro](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/domain/financial-model.md)
- [Arquitetura de Dados & Relacionamentos](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/architecture/database.md)
- [Diagrama Entidade-Relacionamento (ERD)](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/architecture/erd.md)
- [Decisões em Aberto](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/decisions/open-questions.md)
- [Roadmap de Execução](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/roadmap.md)
