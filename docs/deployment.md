# Guia de Deploy e Infraestrutura: Localhost, Supabase e Vercel

Este documento orienta a execução local, a configuração do banco de dados PostgreSQL no **Supabase** e o deploy em produção na plataforma **Vercel**.

---

## 1. Execução Local (`localhost:3000`)

### 1.1 Pré-requisitos
- Node.js versão 20 LTS ou 24 LTS (verificada `v24.18.0`).
- npm versão 10+ (verificada `11.16.0`).
  - *Nota no Windows PowerShell:* execute comandos via `npm.cmd` caso a política de scripts restrinja `.ps1`.

### 1.2 Inicialização Rápida
```bash
# 1. Instalar dependências (caso não tenham sido instaladas)
npm.cmd install

# 2. Configurar variáveis de ambiente a partir do modelo
cp .env.example .env.local

# 3. Iniciar o servidor de desenvolvimento na porta 3000
npm.cmd run dev
```
Acesse a aplicação no navegador em [http://localhost:3000](http://localhost:3000).

---

## 2. Configuração do Supabase PostgreSQL

O Sistema ERP utiliza o PostgreSQL gerenciado do **Supabase** como motor de persistência relacional.

### 2.1 Como Obter as Chaves de Conexão no Painel do Supabase
1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard) e selecione o seu projeto.
2. Navegue até **Project Settings** (ícone de engrenagem) -> **Database**.
3. Na seção **Connection String**, selecione a aba **URI**:
   - **Modo Connection Pooling (Supavisor - Porta 6543 / Transaction Mode):**
     Copie a URL do Pooler em modo Transaction. Ela tem o formato:
     ```text
     postgresql://postgres.[PROJECT-REF]:[SUA-SENHA]@aws-0-[REGION].pooler.supabase.com:6543/postgres?sslmode=require
     ```
     Essa URL deve ser atribuída à variável `DATABASE_URL`.
   - **Modo Direct Connection (Porta 5432 / Session Mode):**
     Copie a URL direta. Ela tem o formato:
     ```text
     postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
     ```
     Essa URL deve ser atribuída à variável `DIRECT_URL` (usada exclusivamente para migrações).

### 2.2 Por que Duas URLs? (Arquitetura Serverless Vercel + Supabase)
- **`DATABASE_URL` (Porta 6543 / Transaction Pooler):** Em ambientes serverless como a Vercel, cada requisição HTTP pode instanciar uma função lambda isolada. Se cada lambda abrir uma conexão direta, o limite de 60 a 100 conexões do PostgreSQL se esgota em segundos. O Supavisor gerencia milhares de conexões virtuais compartilhadas.
- **`DIRECT_URL` (Porta 5432 / Session):** Migrações DDL (`CREATE TABLE`, locks de schema) exigem modo de sessão e conexão direta estrita, pois comandos DDL não podem rodar em Transaction pooling.

---

## 3. Gestão e Execução de Migrações

As migrações SQL são controladas pelo script transacional [src/lib/db/migrate.ts](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/src/lib/db/migrate.ts) e auditadas na tabela `_migrations`.

```bash
# Verificar status das migrações (quais estão aplicadas e quais estão pendentes)
npm.cmd run db:status

# Aplicar migrações pendentes no banco configurado em DIRECT_URL / DATABASE_URL
npm.cmd run db:migrate
```

> [!IMPORTANT]
> **Nunca execute migrations em tempo de renderização de páginas ou dentro de handlers de requisição HTTP.**
> Migrations devem ser executadas via pipeline de CI/CD (GitHub Actions) ou comando de deploy manual antes do tráfego ser roteado para a nova versão.

---

## 4. Deploy na Vercel

O projeto foi construído para conformidade nativa com o **Next.js App Router na Vercel**.

### 4.1 Preparação do Repositório Git
Certifique-se de que o repositório esteja versionado no GitHub, GitLab ou Bitbucket:
```bash
git add .
git commit -m "feat: preparar fundação do ERP para Vercel e Supabase"
git push origin main
```

### 4.2 Configuração do Projeto na Vercel
1. Acesse o painel da [Vercel](https://vercel.com/) e clique em **Add New Project**.
2. Importe o repositório do Git.
3. Em **Environment Variables**, cadastre as seguintes variáveis obrigatórias:
   - `DATABASE_URL`: URL do Supavisor Pooler (Porta 6543, com `sslmode=require`).
   - `DIRECT_URL`: URL direta do Supabase (Porta 5432, com `sslmode=require`).
   - `SESSION_SECRET`: Chave aleatória forte de no mínimo 32 caracteres.
   - `NEXT_PUBLIC_APP_URL`: URL de produção (ex: `https://sistema-erp.vercel.app`).
4. Clique em **Deploy**.

### 4.3 Separação de Ambientes (Development, Preview e Production)
- **Development:** Conecta ao banco local (`postgresql://...localhost:5432`) ou a um projeto de desenvolvimento no Supabase (`dev-project`).
- **Preview (Pull Requests):** Conecta a um banco de staging ou schema isolado no Supabase.
- **Production (Branch main):** Conecta ao banco de produção do Supabase.

---

## 5. Diagnóstico e Resolução de Problemas (Troubleshooting)

### 5.1 Erro `ECONNREFUSED` ou `ETIMEDOUT`
- Se for local: verifique se o PostgreSQL local está em execução.
- Se for no Supabase: certifique-se de que a senha não possui caracteres especiais sem URL-encode e que o IP está liberado no Supabase (por padrão, o Supabase permite `0.0.0.0/0` para conexões externas autenticadas).

### 5.2 Erro de Certificado SSL (`self-signed certificate in certificate chain`)
- A camada [src/lib/db/pool.ts](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/src/lib/db/pool.ts) já habilita automaticamente `ssl: { rejectUnauthorized: false }` para conexões que contenham `.supabase.co`, `.pooler.supabase.com` ou `sslmode=require`.

### 5.3 Execução da Suíte de Testes e Validação
```bash
# Executa linter estático
npm.cmd run lint

# Executa checagem de tipos estrita TypeScript
npm.cmd run typecheck

# Executa testes unitários e de integração
npm.cmd test

# Compila build de produção
npm.cmd run build
```
