---
name: erp-quality-gate
description: >-
  Portão de qualidade do ERP: rotina de validação contínua que executa lint, typecheck estrito,
  testes automatizados e build antes da conclusão de qualquer funcionalidade ou entrega técnica.
---

# ERP Quality Gate: Protocolo de Verificação Obrigatória

Esta skill estabelece a rotina de validação que deve ser executada e verificada antes de declarar qualquer etapa técnica concluída no projeto ERP.

## Protocolo de Execução do Quality Gate

Antes de finalizar qualquer tarefa, submeter PR ou concluir uma fase, execute sequencialmente as 4 validações fundamentais do projeto:

```bash
# 1. Verificação de padrões de código e boas práticas
npm run lint

# 2. Verificação de tipos TypeScript em modo estrito
npm run typecheck

# 3. Execução da suíte de testes unitários e de integração
npm run test

# 4. Compilação da aplicação Next.js
npm run build
```

## Regras Inegociáveis do Quality Gate
1. **Zero Warnings Bloqueantes:** Erros de linter (`eslint`) não devem ser silenciados com `eslint-disable` sem justificativa arquitetural documentada.
2. **Zero `any`:** O TypeScript está configurado em modo `strict: true`. O uso de `any` é terminantemente proibido nos módulos de domínio e finanças (usar `unknown`, generics ou tipos discriminados).
3. **Nenhum Teste Ignorado:** Testes com `.skip` ou comentados não são aceitos como prova de conclusão de funcionalidade.
4. **Isolamento de Segredos:** Antes de qualquer commit, verificar se nenhum arquivo contendo credenciais ou tokens reais foi versionado (verificar `.gitignore` e `git status`).
5. **Verificação de Regressão Financeira:** Toda alteração no módulo financeiro exige execução dos testes de precisão decimal e idempotência de cobrança.

## Checklist de Liberação
- [ ] `npm run lint` passou com código de saída 0.
- [ ] `npm run typecheck` passou sem nenhum erro de tipo.
- [ ] `npm run test` executou todos os testes com 100% de sucesso.
- [ ] `npm run build` produziu o bundle de produção sem erros de compilação ou rotas quebradas.
- [ ] Nenhuma credencial ou variável de ambiente sensível exposta no repositório.
