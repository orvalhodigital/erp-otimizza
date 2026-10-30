# Guia de Configuração e Ambiente de Desenvolvimento (Setup)

Este guia orienta a preparação do ambiente de desenvolvimento local para o Sistema ERP.

---

## 1. Pré-Requisitos

- **Node.js:** Versão 20 LTS ou 24 LTS (verificada `v24.18.0`).
- **npm:** Versão 10+ (verificada `11.16.0`).
- **PostgreSQL:** Versão 15+ instalado localmente ou via container.
- **Git:** Versão 2.30+.

---

## 2. Configuração de Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto a partir do modelo `.env.example`:

```bash
cp .env.example .env.local
```

### Chaves de Configuração no `.env.local`:
```env
# Servidor HTTP
PORT=3000
NODE_ENV=development

# Banco de Dados Principal (PostgreSQL)
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/sistema_erp_dev

# Banco de Dados para Testes de Integração
DATABASE_URL_TEST=postgresql://postgres:postgres@localhost:5432/sistema_erp_test

# Segurança e Autenticação
SESSION_SECRET=substitua_por_uma_chave_segura_de_no_minimo_32_caracteres_aleatorios
```

> [!CAUTION]
> **Nunca** inclua credenciais reais de produção no repositório Git. O arquivo `.env.local` está devidamente listado no `.gitignore`.

---

## 3. Preparação do Banco de Dados PostgreSQL

### Opção A: Instalação Nativa do PostgreSQL
Se você possui o PostgreSQL instalado na máquina:
1. Abra o utilitário `psql` ou pgAdmin.
2. Crie os bancos de dados de desenvolvimento e teste:
```sql
CREATE DATABASE sistema_erp_dev;
CREATE DATABASE sistema_erp_test;
```

### Opção B: PostgreSQL via Docker Compose (Opcional)
Um arquivo `docker-compose.yml` está disponível na raiz para subir um PostgreSQL de desenvolvimento de forma isolada, caso o Docker esteja instalado:
```bash
docker compose up -d postgres
```

---

## 4. Execução de Migrações do Banco

Para verificar o status das migrações ou aplicá-las:
```bash
# Verifica quais migrações estão pendentes ou aplicadas
npm run db:status

# Aplica as migrações SQL no banco configurado em DATABASE_URL
npm run db:migrate
```

---

## 5. Scripts Disponíveis no `package.json`

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor Next.js em modo de desenvolvimento (`http://localhost:3000`). |
| `npm run build` | Compila o projeto e valida rotas para ambiente de produção. |
| `npm run start` | Inicia o servidor com o build compilado de produção. |
| `npm run lint` | Executa o ESLint para verificar estilo e integridade de código. |
| `npm run typecheck` | Executa a verificação estrita de tipos do TypeScript (`tsc --noEmit`). |
| `npm run test` | Executa a suíte de testes automatizados com o Vitest. |
| `npm run test:watch` | Executa o Vitest em modo interativo de observação de arquivos. |

---

## 6. Troubleshooting e Solução de Problemas

### 6.1 Erro de Execução de Scripts no PowerShell (Windows)
Se o terminal Windows exibir o erro:
`O arquivo ...\npm.ps1 não pode ser carregado porque a execução de scripts foi desabilitada neste sistema.`
**Solução:**
Execute os comandos utilizando `npm.cmd` em vez de `npm`:
```powershell
npm.cmd run dev
npm.cmd run test
```

### 6.2 Erro de Conexão com o PostgreSQL
Se a rota `/api/health` ou o comando de migração acusar `ECONNREFUSED 127.0.0.1:5432`:
- Certifique-se de que o serviço do PostgreSQL está ativo no Windows (`Get-Service *postgres*`) ou no Docker.
- Verifique se o usuário e senha informados em `DATABASE_URL` no `.env.local` coincidem com os configurados no PostgreSQL.
