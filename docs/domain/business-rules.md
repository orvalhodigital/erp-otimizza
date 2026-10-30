# Regras de Negócio Confirmadas do ERP

Este documento consolida as regras de negócio comerciais e operacionais confirmadas para o Sistema ERP.

---

## 1. Módulo de Clientes

### 1.1 Identificação e Tipos
- O sistema aceita dois tipos de clientes: **Pessoa Física (`PF`)** e **Pessoa Jurídica (`PJ`)**.
- Campos base:
  - `id`: Identificador único universal (UUID v4).
  - `type`: `PF` ou `PJ` (obrigatório).
  - `name`: Nome completo (para PF) ou Razão Social (para PJ) (obrigatório).
  - `trade_name`: Nome fantasia (opcional, aplicável primariamente a PJ).
  - `document`: CPF (11 dígitos numéricos) ou CNPJ (14 dígitos numéricos) (opcional no cadastro preliminar).
  - `email`: Endereço de e-mail de contato e cobrança (opcional, mas validado se preenchido).
  - `phone`: Telefone com DDD (opcional).
  - `status`: `ACTIVE` (ativo) ou `INACTIVE` (inativo). Padrão: `ACTIVE`.
  - `notes`: Observações gerais e anotações comerciais.
  - `created_at` e `updated_at`: Marcas temporais de auditoria (`TIMESTAMPTZ`).
  - `deleted_at`: Marca temporal de exclusão lógica (soft delete).

### 1.2 Regras de Validação e Integridade
1. **Obrigatoriedade Condicional de Documento:** CPF ou CNPJ não é obrigatório para cadastrar um lead/contato prévio. No entanto, se informado, deve passar pelo algoritmo formal de verificação de dígitos (Módulo 11) correspondente.
2. **Normalização:** Todos os documentos são higienizados na persistência (armazenados exclusivamente com caracteres numéricos, sem pontos, barras ou traços).
3. **Unicidade de Documento:** Em clientes ativos (`deleted_at IS NULL`), um mesmo CPF ou CNPJ não pode estar associado a mais de um cadastro.
4. **Soft Delete e Integridade:** Um cliente que possua vendas, contratos ou títulos financeiros associados **não pode** ser excluído fisicamente do banco de dados (`RESTRICT`). Apenas o campo `deleted_at` é preenchido, tornando-o inativo para novas transações.

---

## 2. Catálogo Unificado: Produtos e Serviços

### 2.1 Classificação de Itens
O catálogo comporta três modalidades sob uma modelagem unificada e coesa:
1. **Produto Simples:** Item físico ou consumível padrão, sem variações de atributos. Possui SKU, unidade de medida (UN, KG, M, CX) e preço base.
2. **Produto com Variações:** Produto pai (`products`) agregador de características gerais (marca, categoria, descrição) associado a uma ou mais variações filhas (`product_variants`).
   - Cada variação possui atributos estruturados em JSONB ou colunas específicas (ex: `{"tamanho": "G", "cor": "Azul"}`), SKU próprio, preço específico e status ativo/inativo.
   - Variações não são produtos desvinculados: compartilham a mesma entidade pai para fins de catálogo, buscas e relatórios.
3. **Serviço:** Prestação de serviço imaterial. Possui descrição, valor de referência e suporta tanto cobrança única (`ONE_TIME`) quanto recorrente (`MONTHLY` ou `YEARLY`).

### 2.2 Desacoplamento e Controle de Estoque
- Nesta fase (Fase 0/MVP), **não** há controle de movimentação física de estoque, cálculo de custo médio ou saldo de armazém.
- O catálogo foca exclusivamente na definição comercial, precificação de referência e vinculação às vendas e contratações.

---

## 3. Vendas e Contratações

### 3.1 Venda Avulsa (`sales`)
- Representa uma transação pontual de produtos ou serviços.
- Uma venda pertence obrigatoriamente a um cliente.
- Pode conter múltiplos itens de produto (simples ou variante) e serviço.
- Registra status: `DRAFT` (orçamento), `CONFIRMED` (fechada/aprovada), `CANCELED` (cancelada).
- No momento da confirmação da venda, o módulo de faturamento gera o título correspondente a receber.

### 3.2 Contratações Recorrentes (`contracts`)
- Representa um compromisso de fornecimento contínuo de serviços ou produtos com periodicidade definida.
- Um mesmo cliente pode possuir múltiplos contratos simultâneos independentes.
- Periodicidades suportadas:
  - `ONE_TIME`: Faturamento avulso único com data acordada.
  - `MONTHLY`: Cobrança mensal contínua.
  - `YEARLY`: Cobrança anual contínua.
- **Ciclo de Vida do Contrato:**
  - `DRAFT`: Proposta ou minuta em negociação.
  - `ACTIVE`: Contrato vigente gerando faturamento.
  - `SUSPENDED`: Temporariamente paralisado (não gera cobranças no período suspenso).
  - `CANCELED`: Rescindido antes do prazo (bloqueia novas cobranças e cancela títulos futuros em aberto).
  - `COMPLETED`: Encerrado naturalmente por conclusão do prazo.

### 3.3 Imutabilidade de Valores Históricos
- Quando uma venda ou contrato é emitido, os itens (`sale_items`, `contract_items`) gravam:
  - `item_name`: Nome congelado no ato da venda.
  - `unit_price`: Preço unitário real praticado na negociação.
  - `quantity`: Quantidade contratada.
  - `discount_amount`: Desconto concedido no item.
  - `total_amount`: Valor total resultante.
- **Regra Inegociável:** Qualquer reajuste posterior no preço base de produtos ou serviços no catálogo afeta apenas transações futuras, nunca vendas ou contratos preexistentes.
