# Escopo do MVP e Critérios de Aceite

## 1. Definição do MVP (Minimum Viable Product)
O objetivo do MVP do Sistema ERP é validar a espinha dorsal de operações da empresa:
**Cadastrar clientes -> Emitir vendas ou contratos com produtos e serviços -> Gerar títulos financeiros -> Receber pagamentos (parciais ou integrais) -> Visualizar saldo e fluxo de caixa real.**

---

## 2. O que ESTÁ no Escopo do MVP

| Módulo | Entregáveis do MVP |
| :--- | :--- |
| **01. Fundação Técnica** | Arquitetura monólito modular em Next.js, PostgreSQL direto via driver `pg`, migrações versionadas, testes automatizados e quality gate. |
| **02. Usuários & Auth** | Autenticação por credenciais com hash seguro (Argon2id ou Bcrypt), sessões gerenciadas em cookies HttpOnly/SameSite e autorização server-side com papéis básicos. |
| **03. Clientes** | Cadastro completo de Pessoa Física e Jurídica, validação de documento quando preenchido, listagem com busca e filtros, edição e soft delete seguro. |
| **04. Catálogo** | Cadastro de produto simples, produto com variações e serviços. Preço base e ativação/desativação. |
| **05. Vendas & Contratos** | Lançamento de venda avulsa e contratação com periodicidade (`ONE_TIME`, `MONTHLY`, `YEARLY`). Congelamento do preço unitário negociado no momento da emissão. |
| **06. Financeiro Básico** | Geração manual e automática de títulos a receber derivados de vendas e contratos. Registro de títulos a pagar avulsos. Liquidação de títulos com suporte a pagamentos parciais. |
| **07. Contas & Caixa** | Cadastro de contas financeiras (banco / caixa físico). Registro de movimentações derivadas de liquidações. Extrato de movimentações e saldo calculado. |
| **08. Dashboard Básico** | Cards de indicadores: Clientes Ativos/Inativos, Títulos a Vencer no Mês, Total Recebido no Mês e Saldo em Caixa. |

---

## 3. O que está FORA do Escopo do MVP (Não Fazer Agora)

1. **Gestão Física de Estoque:** Não implementar controle de saldo físico de estoque, inventário, custo médio ponderado, ordens de compra ou movimentação de armazém.
2. **Integrações de Gateway de Pagamento:** Não integrar Asaas, Iugu, Mercado Pago, Stripe ou Pix automático nesta fase (pagamentos serão liquidados manualmente pelo operador).
3. **Plano de Assinatura SaaS / Multi-tenant Isolado:** O sistema é concebido para mono-instância com separação lógica, sem cobrança de assinatura de software.
4. **Emissão de Documentos Fiscais:** Nenhuma integração com prefeituras (NFS-e) ou SEFAZ (NF-e/NFC-e).
5. **Microserviços e Filas Distribuídas:** Sem Kafka, RabbitMQ, Redis, Kubernetes ou GraphQL. O monólito modular com PostgreSQL atende plenamente as garantias de consistência ACID.
6. **Contabilidade Avançada:** Sem plano de contas contábil completo com débito/crédito formal ou integração com SPED Contábil.

---

## 4. Critérios de Aceite Globais do MVP

- [ ] **Consistência de Saldos:** O saldo exibido de uma conta financeira deve bater rigorosamente com a soma de suas movimentações efetivadas (`initial_balance + SUM(credits) - SUM(debits)`).
- [ ] **Preservação de Histórico:** Alterar o preço de uma variação no catálogo não altera o valor de nenhuma venda ou título gerado anteriormente.
- [ ] **Prevenção de Duplicidade:** Disparar o processo de faturamento mensal mais de uma vez para o mesmo contrato e mês não pode gerar títulos duplicados.
- [ ] **Liquidabilidade Parcial:** Um título de R$ 500,00 que recebe liquidação de R$ 200,00 deve atualizar seu saldo devedor para R$ 300,00 e seu status para `PARTIALLY_PAID`.
- [ ] **Rastreabilidade de Estorno:** Qualquer estorno deve manter o registro original e criar um contra-lançamento com justificativa obrigatória e autor registrado.
- [ ] **Precisão Monetária:** Nenhum cálculo de sistema gera centavos espúrios de ponto flutuante.
