# Decisões em Aberto e Questões de Negócio

Este documento registra as decisões de negócio e arquiteturais que permanecem em aberto, suas implicações estruturais no banco de dados e as premissas reversíveis adotadas provisoriamente na Fase 0.

> [!IMPORTANT]
> Nenhuma tabela ou migração de banco de dados com impacto irreversível derivado destas questões deve ser aplicada em produção antes da deliberação formal com os responsáveis pelo produto.

---

## 1. ERP para uma única empresa (Monoempresa), várias empresas (Multiempresa) ou modelo SaaS multi-inquilino?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - *Se Multiempresa/SaaS:* Praticamente todas as tabelas (`clients`, `products`, `sales`, `contracts`, `financial_accounts`, `financial_titles`) exigiriam a coluna `tenant_id` ou `company_id`, índices compostos com tenant, e políticas de Row Level Security (RLS) ou particionamento.
  - *Se Monoempresa:* Estrutura mais limpa, consultas diretas, menor complexidade de queries e menor risco de vazamento cruzado de dados.
- **Premissa Reversível Adotada na Fase 0:**
  - Modelagem focada em **monoempresa** (uma organização operando o ERP). Caso decida-se por multiempresa no futuro, a introdução de `tenant_id` exigirá migração estrutural global antes da entrada em produção.

---

## 2. Necessidade de controle de estoque agora ou no futuro?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - *Se controle de estoque agora:* Exigiria tabelas de depósitos/armazéns (`warehouses`), movimentações de entrada/saída (`stock_movements`), reservas de estoque em orçamentos, cálculo de Custo das Mercadorias Vendidas (CMV) e inventário.
  - *Se no futuro:* O catálogo mantém o campo `type` (`SIMPLE_PRODUCT`, `VARIABLE_PRODUCT`, `SERVICE`) sem atrelar a validação de saldo físico na emissão de vendas.
- **Premissa Reversível Adotada na Fase 0:**
  - **Sem controle de estoque na fase inicial.** O catálogo cadastra produtos físicos apenas para fins de precificação, orçamento e faturamento, sem impedir vendas por saldo zerado.

---

## 3. Cobrança recorrente automática (Gateway/Pix/Boleto automático) ou apenas acompanhamento de vencimento?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - *Se gateway automático:* Exigiria tabelas de webhooks, tokens de cartão, integração com APIs terceiras (ex: Asaas, Iugu, Stripe), filas de retry e reconciliação assíncrona.
  - *Se acompanhamento de vencimento:* Títulos são gerados internamente no banco de dados e a baixa é informada pelo operador financeiro de forma manual ou por conciliação de extrato.
- **Premissa Reversível Adotada na Fase 0:**
  - **Acompanhamento de vencimento interno.** O sistema gera os títulos e o operador registra a liquidação manual (`financial_settlements`). O modelo relacional deixa o campo `payment_method` preparado para acoplar gateways futuramente sem quebrar o esquema.

---

## 4. Contratações com prazo determinado ou indeterminado?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Se prazo determinado: Exige regras de renovação automática, termo de expiração e término compulsório de geração de títulos.
  - Se indeterminado: Contratos permanecem ativos gerando cobrança até que haja cancelamento explícito (`status = 'CANCELED'`).
- **Premissa Reversível Adotada na Fase 0:**
  - A tabela `contracts` possui o campo opcional `end_date DATE`. Se nulo, o contrato é considerado por tempo indeterminado e continua faturando enquanto estiver com status `ACTIVE`.

---

## 5. Uma cobrança (título a receber) pode incluir múltiplos itens e contratos consolidados?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Se fatura consolidada multi-contrato: Exigiria uma entidade intermediária `invoices` com relacionamento N:N entre `invoices` e `contracts`/`sales`.
  - Se 1 título por venda/ciclo de contrato: Relação 1:N direta (`financial_titles.contract_id` e `financial_titles.sale_id`), simplificando a conciliação.
- **Premissa Reversível Adotada na Fase 0:**
  - Cada venda confirmada ou período de contrato gera um título independente (`financial_titles`), garantindo rastreabilidade unitária direta.

---

## 6. Vários usuários com perfis e permissões granulares diferentes?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Se permissões complexas: Exige matriz RBAC com tabelas `permissions`, `roles`, `role_permissions` e checagem de escopo por endpoint.
  - Se perfis funcionais simples: Coluna `role VARCHAR` na tabela `users` com valores restritos (`ADMIN`, `FINANCE`, `SALES`, `OPERATOR`).
- **Premissa Reversível Adotada na Fase 0:**
  - Modelo enxuto com coluna `role` na tabela `users`, sem tabelas complexas de permissões na largada, mas com autorização estrita no servidor.

---

## 7. Uma ou várias contas financeiras?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Se conta única: Lógica simples de saldo global.
  - Se múltiplas contas: Exige transferências internas (`TRANSFER`), saldo por conta, extratos individualizados e permissões por conta bancária.
- **Premissa Reversível Adotada na Fase 0:**
  - Suporte nativo a **múltiplas contas financeiras** (`financial_accounts`), pois criar essa abstração desde o início é menos custoso do que refatorar um saldo global monovalorado no futuro.

---

## 8. Como serão tratados desconto, juros, multa e taxas financeiras?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Descontos e juros podem ocorrer tanto na emissão do título quanto no momento da liquidação (ex: juros por atraso ou desconto por pagamento antecipado).
- **Premissa Reversível Adotada na Fase 0:**
  - Na emissão do título: `original_amount` reflete o valor nominal negociado.
  - Na liquidação (`financial_settlements`): Existem campos dedicados para `interest_amount` (juros), `fine_amount` (multa) e `discount_amount` (desconto), calculando o valor líquido movimentado na conta bancária de forma transparente.

---

## 9. Haverá emissão de documentos fiscais (NF-e, NFS-e, NFC-e)?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Exigiria tabelas pesadas de impostos brasileiros (ICMS, IPI, PIS, COFINS, ISS), CFOP, NCM, Código de Serviço, certificados digitais A1 e mensageria com SEFAZ/Prefeituras.
- **Premissa Reversível Adotada na Fase 0:**
  - **Fora do escopo do MVP.** Nenhuma entidade fiscal foi adicionada para evitar inchaço desnecessário na fundação técnica.

---

## 10. Haverá importação de dados legados existentes (planilhas ou outro sistema)?
- **Status:** Aberto (Aguardando Decisão)
- **Impacto Arquitetural:**
  - Se sim: Exigirá scripts de ETL, validação de integridade de CPFs antigos, tratamento de clientes duplicados e carga de saldos iniciais de contas.
- **Premissa Reversível Adotada na Fase 0:**
  - A fundação disponibiliza a pasta `database/seeds/` para carga de dados estruturados em SQL ou TypeScript, aguardando definições de formato das planilhas de origem se houver migração.
