# Module: Views (Frontend)

## Responsabilidade
Atuam como páginas do projeto e **orquestradoras** de estado global e roteamento. A camada visual detalhada (inputs, botões, modais) deve ser extraída para a pasta `/components`. 

## Dependências
- **Vue Router**: Para redirecionamentos dinâmicos ao redor da aplicação (ex: `useRoute`, `useRouter`).
- **Pinia Stores**: Para injetar ou manipular estado persistente ou global (ex: Vendedor Logado, Empresa Atual).
- **Componentes**: Módulos visuais importados da pasta `src/components/`.

## Fluxo (Exemplo: LoginView)
1. Através de propriedades definidas nas rotas (`meta: { hideLayout: true }`), as Views ditam o comportamento do Layout Centralizado no arquivo raiz `App.vue`.
2. Ocupam-se de montar a estrutura Macro da página (ex: Divisão em duas colunas Grid/Flexbox).
3. Importam e renderizam componentes visuais menores (ex: `LoginForm`), repassando callbacks ou consumindo emissões de eventos.
4. Fazem a ponte entre a ação de um componente ("Clicou em Entrar") e o Back-end/Store (Disparar a store do usuário logado).

---

## 📊 Home.vue — Dashboard Central

### Arquitetura de Filtros
O `Home.vue` é o **orquestrador central** do dashboard. Ele gerencia:

1. **Filtro de Modo** (`dashboardFilterType`): `'bu'` | `'team'` | `'coord'`
   - Admin/Coord: Alternam entre "Por BU" e "Por Equipe".
   - Head: Alterna entre "Minhas Equipes", "Minha Meta" e "Minhas BUs".
   - Seller/SDR: Alterna entre "Minha Meta" e "Meta Equipe".

2. **Filtro de BU** (`selectedBUId`):
   - **Auto-seleção inteligente:** Se o gestor possui uma única BU, ela é selecionada automaticamente.
   - **Opção "3F" (value `'all'`):** Entidade hardcoded no próprio código (não vem do banco). Representa a visão agregada de todas as BUs. Disponível apenas para admin no select do dashboard. **Nunca** aparece em formulários de criação de usuário ou contrato.
   - Implementado via `buOptionsFormatted` (computed): injeta `{ value: 'all', label: '3F' }` como primeira opção, seguido das BUs reais do banco.
   - Todas as comparações usam `=== 'all'` (nunca `=== '99'`).

3. **Filtro Temporal** (`selectedPeriodType` + `selectedPeriodValue`):
   - `month`: Exibe os 12 meses do ano corrente.
   - `quarter`: Q1-Q4 do ano selecionado.
   - `year`: Seleção de ano.
   - `all`: Todo o histórico.
   - `selectedYear` armazena o ano de referência para trimestre/ano.
   - **Meses futuros são ignorados** automaticamente nos cálculos de trimestre e ano.

### Computeds de Performance Críticos

- **`parseLocalDate(raw)`**: Helper que parseia datas ISO do Prisma como data local (extrai parte da data com `.split('T')[0]` e parseia como `T12:00:00` local). Evita offset UTC em comparações de range. **Usar em toda comparação de data de contrato.**
- **`currentDateRange`**: Calcula intervalos de datas para o período selecionado:
  - `gen`: dia 01 ao último dia do mês — usado para todos os cálculos (inclusive P1).
  - `months[]`: lista de meses no período.
- **Regra de P1**: Contrato assinado entre dia 01 e último dia do mês (range `gen` por `signed_date`) cujo `first_payment_date` ≤ dia 06 do mês seguinte. Se não atender, o P1 é perdido. P1 é contabilizado no momento da assinatura, não no pagamento.
- **`filteredP1Contracts`**: Contratos assinados dentro do `gen` range (por `signed_date`) que atendem à janela de pagamento (first_payment_date ≤ dia 06 do mês seguinte à assinatura). Contratos sem `first_payment_date` são **incluídos**.
- **`currentPerformance`**: Calcula `{ p1, tcv, nmrr, implementation, monthly }`. Todas as métricas usam `signed_date` para definir o mês. P1 usa `filteredP1Contracts` + `first_payment_amount`. NMRR é sempre calculado como `TCV / (contractual_term || 12)` — coluna `nmrr` foi **removida** do banco. O fallback `effectiveMonthly` (usar `first_payment_amount` como mensalidade) só se aplica a contratos antigos sem `negotiation_template_id`. Passado como prop `:actuals` para o `GoalsDashboard`.
- **`activeGoalsList`**: Filtra as metas da store por entidade (BU/Equipe/Vendedor) e por meses do período.
- **`activeGoal`**: Meta consolidada (soma inline via reduce de todas as metas do intervalo). **Nota:** O reduce soma apenas `p1, tcv, nmrr, implementation, monthly` — os campos `p1_period_1...4` não são propagados neste objeto agregado.

### Contexto dos Modais
- **`dashboardContext`**: Computed que fornece `{ month, year }` corretos aos modais de configuração (`SetGoalModal`, `SetCostsModal`, `SetCacModal`), garantindo que ao navegar para um mês anterior, as configurações sejam salvas no mês correto.

### Stores Utilizadas
- `useAuthStore`, `useContractStore`, `useSellerStore`, `useGoalStore`, `useTeamStore`, `useCacStore`, `useCostsStore`.

