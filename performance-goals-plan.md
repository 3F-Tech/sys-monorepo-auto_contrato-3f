# Performance Goals Plan

> Seguindo o roteiro de plan-writing/SKILL.md

## Visão Geral
Adicionar suporte a metas financeiras (P1, TCV, NMRR, Total Implementação, Recorrente) com diferentes níveis hierárquicos (Seller, Team/Head, BU). O dashboard irá cruzar essas metas com as vendas atuais e mostrar gráficos de progresso.

## Hierarquia de Permissões (Quem define metas para quem)
- **Coordenador (`coord`)**: BU
- **Head (`head`)**: Equipe, Vendedores
- **Admin (`admin`)**: Todas as anteriores

## Tarefas de Implementação

### Phase 1: Database & Backend
- [ ] Task 1: Adicionar modelo `goals` no `schema.prisma`. Campos essenciais: `id`, `target_type` ('seller', 'head', 'bu'), `target_id`, `created_by`, `month`, `year`, e os 5 valores da meta.
- [ ] Task 2: Executar `npx prisma db push` e gerar o Prisma Client.
- [ ] Task 3: Criar `goalSchema.ts` no backend (Zod) para validar as metas recebidas.
- [ ] Task 4: Criar `goalController.ts` com funções de criar, listar e editar. Inserir lógicas de bloqueio de hierarquia (Admin tem passe livre, Head cuida da sua equipe).
- [ ] Task 5: Injetar rota em `routes/index.ts`.

### Phase 2: Frontend API & Store
- [ ] Task 6: Atualizar `client.ts` ou criar um novo serviço `GoalService` (Axios) para as chamadas `/goals`.
- [ ] Task 7: Integrar `goals` em um store do Pinia ou no estado de `Home.vue` para uso reativo.

### Phase 3: UI Components
- [ ] Task 8: Criar componente `SetGoalModal.vue` contendo o formulário (seleção de alvo via dropdown, campos de valor) que será visível só para `coord`, `head` e `admin`.
- [ ] Task 9: Criar componente visual `GoalsDashboard.vue`. Precisam ser renderizados múltiplos pequenos blocos com gráficos indicando `% alcançada` de cada uma das 5 métricas financeiras.
- [ ] Task 10: Adicionar `GoalsDashboard.vue` no `Home.vue` logo abaixo da mensagem inicial "Olá, USER". Injetar os valores estatísticos reais processados no Home para calcular a barra.

## Concluído Quando
- O Vendedor loga, vê uma barra indicando 'Falta R$ 5k' do total de P1 estipulado para o mês atual, não tem botão de criar metas.
- Um Head acessar, vê na dashboard as metas e cria uma meta em 'SetGoalModal' para um vendedor da sua equipe.
- Testes garantindo que gráficos atualizam visualmente o progresso.
