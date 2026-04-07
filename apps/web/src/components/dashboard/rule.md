# Regras dos Componentes do Dashboard

## 🎯 Responsabilidade
Componentes visuais e interativos que compõem o dashboard de performance e gestão de metas da Home. São orquestrados pelo `Home.vue` que fornece dados via props e recebe eventos via emits.

## 📦 Componentes Existentes

### `GoalsDashboard.vue`
Dashboard principal de metas e performance. Recebe dados agregados do `Home.vue` e exibe gráficos (ApexCharts), métricas e indicadores de progresso.

**Props:**
- `goal: Goal | null` — Meta consolidada (somada) para o período selecionado.
- `goals: Goal[]` — Lista de metas individuais (para iteração por mês no gráfico).
- `periodType: 'month' | 'quarter' | 'year' | 'all'` — Tipo de período selecionado.
- `currentRange` — Intervalo de datas com `p1`, `gen` e `months[]`.
- `actuals` — Valores reais calculados: `{ p1, tcv, nmrr, implementation, monthly }`.
- `contracts: any[]` — Contratos filtrados para cálculo interno do gráfico de evolução.

**Emits:** `open-settings`, `open-periods`, `open-costs`.

**Regras de Comportamento:**
- **Sem Meta Definida:** O dashboard **NUNCA** fica inativo. Sempre exibe os dados reais de vendas.
  - Se `goal` é `null`, os indicadores de meta mostram `R$ 0` como alvo e o progresso real como "Realizado".
  - A linha "Planejado" do gráfico de evolução é **ocultada** automaticamente quando não há meta.
  - Um banner de aviso (âmbar) é exibido **apenas na visão mensal** (`periodType === 'month'`), com botão para configurar metas (visível apenas para `admin`, `head`, `coord`).
- **Checkpoints da linha planejada (`dailyData`):** Os valores `p1_period_1...4` do `goal` podem vir como `undefined` (quando `activeGoal` é um agregado de múltiplas metas sem esses campos). A verificação **deve** usar `== null` (loose equality) para tratar `null` e `undefined` da mesma forma — nunca `=== null`.
- **Parsing de datas (`first_payment_date` e `created_at`):** Esses campos chegam como ISO timestamp completo do Prisma (ex: `"2026-05-10T00:00:00.000Z"`). Para comparação correta com datas locais (ex: `startP1`, `endP1`), extrair apenas a parte da data com `.split('T')[0]` e parsear como `new Date(dateStr + 'T12:00:00')`.
- **Granularidade do Gráfico:**
  - **Mês:** Seletor por Semanas (1-4) + Mês Inteiro.
  - **Trimestre/Ano:** Seletor por Meses individuais + Período Inteiro.
- **Formatação do Eixo Y:** Usa `formatCompactCurrency` (ex: `80k`, `1,2M`). `decimalsInFloat: 0` para evitar casas decimais no eixo.
- **Cores de Progresso:** Sistema de cores por faixa percentual:
  - `< 80%` → Vermelho (rose)
  - `80-99%` → Amarelo (amber)
  - `100-110%` → Verde (emerald)
  - `> 110%` → Azul (blue)

### `GoalList.vue`
Lista de metas configuradas para o período. Exibe metas por BU, Equipe ou Vendedor individual.

**Regras de Comportamento:**
- **Logo da BU:** Quando `target_type === 'bu'`, exibe a imagem base64 (`img_base64`) da BU como avatar do item. Fallback para ícone genérico `Building2` caso não haja imagem.
- **Ícones por Tipo:** `bu` → logo ou Building2, `team` → Users, `seller` → User.

### `SetGoalModal.vue`
Modal para definir ou editar metas (P1, TCV, NMRR) com suporte a períodos semanais (P1 a P4).

**Regras de Comportamento:**
- Recebe `month` e `year` via props para configurar metas no mês correto (incluindo meses passados).
- A visão `periods` permite ajustar os checkpoints semanais da meta P1.
- Bloqueio de scroll do body obrigatório ao abrir (`overflow: hidden`).

### `SetCostsModal.vue`
Modal para configurar custos comerciais mensais.

**Regras de Comportamento:**
- Recebe `month` e `year` via props. Configuração é **sempre mensal**.
- Formatação de moeda com máscara de input (R$).
- Bloqueio de scroll do body obrigatório ao abrir.

### `SetCacModal.vue`
Modal para visualizar e configurar o CAC (Custo de Aquisição de Clientes).

**Regras de Comportamento:**
- Recebe `month` e `year` via props.
- Bloqueio de scroll do body obrigatório ao abrir.

### `TeamManager.vue`
Componente de gestão de equipe (associação/dissociação de vendedores).

## 🔗 Dependências Compartilhadas
- **ApexCharts** (`vue3-apexcharts`): Gráficos de linha e radial.
- **Lucide Icons** (`@lucide/vue`): Ícones consistentes com o Design System.
- **Pinia Stores**: `useAuthStore` (permissões), `useGoalStore` (dados de metas).

## ⚠️ Restrições
- Todos os textos em **português** (exceto termos técnicos como P1, TCV, NMRR, CAC).
- Nunca usar `alert()` ou `confirm()` nativos. Usar componentes customizados (`ConfirmModal`, `useToast`).
- Nunca usar validação HTML nativa em formulários.
- Sempre bloquear scroll do body ao abrir modais.
- Seguir a paleta Dark Tech do Design System (backgrounds escuros, acentos `brand-cyan`, fonte `Outfit`).

## 📝 Manutenção
Ao criar um novo componente de dashboard, adicione-o neste arquivo e registre a referência no `GEMINI.md`.
