---
name: erp-domain-rules
description: >-
  Regras de domínio de clientes, catálogo de produtos/serviços, vendas e contratações do ERP.
  Acione esta skill sempre que projetar, revisar ou alterar entidades, validações, casos de uso
  ou endpoints relacionados a clientes, produtos, variações, serviços, vendas e contratos.
---

# Regras de Domínio: Clientes, Catálogo e Contratações

Esta skill define as diretrizes de integridade, validação e modelagem de negócio para os módulos comerciais do ERP. As regras canônicas completas encontram-se em [docs/domain/business-rules.md](file:///c:/Users/otimi/OneDrive/Documentos/SistemaERP/docs/domain/business-rules.md).

## 1. Clientes
- **Tipos Suportados:** Pessoa Física (`PF`) e Pessoa Jurídica (`PJ`).
- **Campos Principais:** ID, Tipo (`PF`/`PJ`), Nome/Razão Social, Nome Fantasia, CPF/CNPJ, Email, Telefone, Status (`ACTIVE`, `INACTIVE`), Datas de auditoria (`created_at`, `updated_at`), Observações.
- **Obrigatoriedade de Documentos:** CPF e CNPJ **não** são obrigatórios no cadastro inicial, a menos que uma regra de venda ou emissão posterior exija. Se informados, devem ser validados formalmente e ser únicos (normalizados, sem pontuação).
- **Soft Delete:** Clientes com histórico de vendas, contratações ou títulos financeiros **nunca** devem ser excluídos fisicamente (`deleted_at` ou status inativo com restrição referencial).

## 2. Catálogo Unificado (Produtos e Serviços)
- **Produto Simples:** Possui código/SKU, nome, unidade de medida (ex: UN, KG, CX), preço base e status ativo/inativo.
- **Produto com Variações:** Entidade pai (`products`) define características gerais; variações (`product_variants`) contêm atributos específicos (ex: tamanho, cor, voltagem), SKU próprio e preço específico. Não converter variações em produtos soltos sem motivo estrutural.
- **Serviço:** Cadastro com descrição, tipo de faturamento suportado (avulso `ONE_TIME` ou recorrente `MONTHLY`/`YEARLY`), valor de referência e status.
- **Estoque:** Não implementar gestão de estoque na Fase 0/1. Deixar o modelo relacional preparado (ex: flags de rastreamento futuro) sem acoplamentos prematuros.

## 3. Vendas e Contratações
- **Clientes Multicontratos:** Um cliente pode ter múltiplos contratos e compras simultâneas ou consecutivas.
- **Imutabilidade Histórica de Preço:** Uma venda (`sales`) e seus itens (`sale_items`), assim como contratos (`contracts`) e itens de contrato (`contract_items`), devem registrar o valor unitário e total negociado no momento do fechamento. Alterações futuras no catálogo de produtos **jamais** devem alterar vendas ou contratos passados.
- **Separação de Entidades:**
  - Produto/Serviço: item do catálogo de referência.
  - Venda: transação comercial com itens e valores negociados.
  - Contratação/Contrato: compromisso de fornecimento/prestação de serviço com ciclo de vida e periodicidade (`ONE_TIME`, `MONTHLY`, `YEARLY`).
  - Cobrança/Título: obrigação financeira a receber (pertence ao módulo financeiro).
- **Ciclo de Vida do Contrato:** `DRAFT` -> `ACTIVE` -> `SUSPENDED` -> `CANCELED` ou `COMPLETED`. Cada transição deve ser auditável e exigir data efetiva.

## Critérios de Conclusão para Tarefas de Domínio
1. Nenhuma dependência circular entre clientes, catálogo e vendas.
2. Histórico de preços preservado por cópia de valores nos itens da transação.
3. Testes unitários cobrindo validações de CPF/CNPJ, criação de variações e ciclo de vida do contrato.
