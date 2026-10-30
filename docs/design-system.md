# Sistema de Design: Otimizza ERP (Inspirado no Hourline)

> **Referência Canônica de Design:** [Hourline - Resource Planning SaaS Website](https://www.behance.net/gallery/257094333/Hourline-Resource-Planning-SaaS-Website)

Este documento define os princípios de interface, paleta de cores, tipografia, componentes e interações para todo o ecossistema do **Otimizza ERP**. A interface adota um estilo **SaaS moderno, clean, arejado e sofisticado**, eliminando tons escuros pesados e priorizando clareza executiva, hierarquia sutil e estética premium.

---

## 1. Princípios Visuais Fundamentais

1. **Clareza e Respiração (Airy & Calm):** Espaçamentos generosos (`p-6`, `p-8`), fundos neutros claros e áreas de respiro que reduzem a fadiga cognitiva em jornadas financeiras longas.
2. **Superfícies Suaves & Bordas Arredondadas:** Bordas suaves com `rounded-2xl` (16px) e `rounded-3xl` (24px) em cards e `rounded-full` (pílula) para botões, badges e chips.
3. **Cartões com Gradientes Pastéis de Destaque (Signature Mesh Gradients):** Métricas-chave utilizam fundos em degradês suaves e elegantes (pêssego/coral, menta/sálvia, azul/índigo periwinkle e âmbar quente) que transmitem status sem agressividade visual.
4. **Insights Preditivos Inteligentes ("Otimizza Sugere"):** Espelhando o padrão *"Hourline suggests"*, o sistema destaca blocos de sugestões automatizadas com recomendações acionáveis para o operador.
5. **Tipografia Geométrica e Moderna:** Tipografia geométrica sem serifa com contrastes nítidos de peso (títulos semibold e números grandes com tracking fechado, combinados com subtítulos neutros e etiquetas em caixa alta).

---

## 2. Paleta de Cores e Tokens Visuais

### Superfícies e Neutros
* **Canvas de Fundo Principal:** `#F8F9FA` / `#FAF9F7` (off-white acolhedor, não clínico).
* **Superfície de Cards:** `#FFFFFF` com borda sutil `1px solid rgba(0, 0, 0, 0.06)` e sombra difusa `shadow-[0_4px_24px_rgba(0,0,0,0.03)]`.
* **Superfície Secundária / Hover:** `#F4F5F7` ou `#EEF0F3`.
* **Texto Principal:** `#18181B` (Zinc-900 / Neutral-900) para máxima legibilidade.
* **Texto Secundário / Labels:** `#71717A` (Zinc-500) ou `#52525B` (Zinc-600).
* **Bordas e Divisores:** `#E4E4E7` (Zinc-200) ou `rgba(0,0,0,0.06)`.

### Cards de Destaque (Pastel Gradients - Estilo Hourline)
1. **Coral / Sunset (Alertas / Atenção / Inadimplência):**
   * Gradiente: `from-orange-50/80 via-rose-50/60 to-red-100/40`
   * Borda: `border-orange-200/50`
   * Acento / Badge: `#EA580C` / `#C2410C`
2. **Menta / Sálvia (Faturamento / Positivo / Recebimentos):**
   * Gradiente: `from-emerald-50/80 via-teal-50/60 to-green-100/40`
   * Borda: `border-emerald-200/50`
   * Acento / Badge: `#059669` / `#047857`
3. **Periwinkle / Sky (Pipeline / Vendas / Contratos):**
   * Gradiente: `from-blue-50/80 via-indigo-50/60 to-sky-100/40`
   * Borda: `border-blue-200/50`
   * Acento / Badge: `#2563EB` / `#4338CA`
4. **Âmbar / Dourado Quente (Margem / Caixa / Liquidez):**
   * Gradiente: `from-amber-50/80 via-orange-50/60 to-yellow-100/40`
   * Borda: `border-amber-200/50`
   * Acento / Badge: `#D97706` / `#B45309`

---

## 3. Componentes no Estilo Hourline

### Botões e Controles
* **Botão Primário:** Pílula completa (`rounded-full`), fundo preto carvão `#18181B`, texto branco `#FFFFFF`, hover `#27272A`, com micro-transição `transition-all duration-150 active:scale-[0.98]`.
* **Botão Secundário:** Pílula completa (`rounded-full`), fundo `#F4F5F7`, borda fina `border-zinc-200`, texto `#27272A`, hover `#E4E4E7`.
* **Botão de Ação Rápida no Card:** Pílula compacta de alto contraste para decisões imediatas (ex: `Reagendar`, `Aprovar`, `Manter`).

### Badges e Indicadores de Status
* Pílulas arredondadas (`rounded-full`) com tipografia `text-xs font-semibold px-3 py-1`.
* Estados:
  * **PAGO / ATIVO:** Fundo `#ECFDF5`, texto `#059669`, borda `#A7F3D0`.
  * **PARCIAL / ALERTA:** Fundo `#FFFBEB`, texto `#D97706`, borda `#FDE68A`.
  * **PENDENTE:** Fundo `#EFF6FF`, texto `#2563EB`, borda `#BFDBFE`.
  * **ATRASADO:** Fundo `#FEF2F2`, texto `#DC2626`, borda `#FECACA`.

### Painel "Otimizza Sugere" (Smart Insights)
* Card de destaque com fundo suave `#FAF9F7`, borda arredondada `rounded-2xl`, ícone sutil de automação/inteligência, descrição concisa da situação detectada e botões de ação em formato de pílula.

---

## 4. Estrutura de Layout e Navegação
* **Sidebar:** Fundo branco puro ou off-white com linha divisória quase imperceptível (`border-zinc-200/80`). Links de navegação com cantos arredondados (`rounded-xl` ou pílula), estado ativo com fundo sutil `#F4F5F7` e indicador visual refinado.
* **Header:** Barra superior translúcida com `backdrop-blur-md`, campo de busca centralizado em formato de pílula (`rounded-full`), atalho de teclado `⌘K`, avatar circular do usuário e status da API em tempo real.
* **Grid do Conteúdo:** Cards principais de indicadores em grid responsivo de 4 colunas, seguido por layout de 2 colunas integrando tabelas operacionais e guias de fluxo financeiro.
