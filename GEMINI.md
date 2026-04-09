# GEMINI.md — Manual de Desenvolvimento

Este arquivo e a referencia tecnica completa do projeto. Para regras criticas de carregamento automatico, consulte o `CLAUDE.md` na raiz.

---

## 1. Contexto do Projeto

Plataforma de **Automacao de Contratos** para uma agencia de marketing (3F Venture). Vendedores preenchem formularios, o sistema gera documentos no Google Docs, exporta para PDF e envia ao Clicksign para assinatura digital.

### Perfis de Usuario (RBAC)
- **admin:** Poder total (CRUD usuarios, BUs, configuracoes).
- **head:** Gestor de equipe. Supervisiona vendedores vinculados a sua BU. **Relacao 1:1 com BU.**
- **coord:** Coordenador operacional. Restrito a uma unica BU. Ve apenas vendedores da sua equipe (`head_id`).
- **seller:** Vendedor operacional. Vinculado a uma ou mais BUs para gerar contratos.

### Multi-Tenancy
- Vendedor so ve as BUs vinculadas a ele (tabela `seller_business`).
- A entidade "3F" (visao agregada) e **hardcoded no frontend** (`value: 'all'`), nunca no banco.

---

## 2. Estrutura e Workflow (Turborepo + PNPM)

- **Monorepo:** Codigo de app em `apps/`, configuracoes compartilhadas em `packages/`.
- **Kubb:** Sempre verifique os arquivos gerados antes de criar tipos ou hooks manualmente. O Swagger e a fonte da verdade.
  - Ao alterar rota ou schema no Swagger, execute `pnpm run generate` na raiz.
- **Gestao de Dependencias:** Use sempre `pnpm`.

---

## 3. Frontend (Vue 3 + TypeScript)

- **Paradigma:** Exclusivamente Composition API com `<script setup>`.
- **State Management:** Pinia. As stores estao documentadas em `apps/web/src/store/rule.md`.
- **Estilizacao:** Tailwind CSS. Siga o Design System em `apps/web/design-system.md`.
- **Icones:** Lucide Icons (`@lucide/vue`).
- **Componentes:** Pequenos e reutilizaveis. Use `defineProps` e `defineEmits`.

---

## 4. Backend (Node.js + TypeScript)

- **Local Rules:** Antes de editar controllers, consulte `apps/api/src/controllers/rule.md`.
- **Validacao:** Zod para todos os payloads de entrada.
- **Swagger Sync:** Mudou rota ou schema? Atualize o JSDoc e regenere o Kubb.
- **Banco de Dados (Supabase + Prisma):** Usar Connection Pooler modo Transaction (`6543` com `&pgbouncer=true`) para `DATABASE_URL`. Porta direta (`5432`) apenas como `DIRECT_URL` para migracoes. Usar padrao Singleton (`apps/api/src/prisma.ts`), nunca instanciar `new PrismaClient()` em controllers.

---

## 5. Seguranca e Autenticacao (JWT)

- **MD5:** Validacao de senha usa MD5 (compatibilidade legado).
- **JWT:** Token com `{ id, email, type }`, expiracao `3h`, assinado com `JWT_SECRET`.
- **Protecao:** Todas as rotas (exceto `/login` e `/health`) usam `authMiddleware`.
- Detalhes distribuidos por responsabilidade:
  - Backend: `apps/api/src/controllers/rule.md`
  - Store/Sessao: `apps/web/src/store/rule.md`
  - Router/Guards: `apps/web/src/router/rule.md`
  - API Client/Interceptors: `apps/web/src/api/rule.md`

---

## 6. Regras de Negocio

1. **Trigger de Automacao:** Registro obrigatorio no banco a cada contrato enviado.
2. **Automacao Google Drive:** Contratos copiados de modelos para pasta `1KF4W-RQ3CAJj4KFAAX9K9cxdRW9u6phg`.
3. **Aprovacao Manual Clicksign:** Contratos criados como rascunho (`approved: false`). Envio ao Clicksign e manual.
4. **Head de BU (1:1):** Cada head vinculado a **uma unica BU**, e cada BU com **um unico head**.
5. **Assinatura do Head:** O Head da BU deve ser adicionado como **testemunha** em todos os contratos da sua BU.
6. **Testemunhas adicionais:** Nao sao obrigatorias (testemunhas fixas + vendedor ja suprem o minimo juridico). NUNCA usar CPFs de signatarios fixos (Luis, Natalia, Leticia, Erika) em campos de teste.
7. **Formatacao:** Moeda sempre com "R$ ", Instagram sem "@" (adicionado nos docs gerados). Social Media (Bomma): `QTD ARTES` e `QTD VIDEOS` obrigatorios apenas em modelos com "Artes"/"Videos"/"Determinada".
8. **Fluxo de Status (`change_status`):** `null` → `alert` (seller solicita) → `approved`/`reject` (lideranca decide).
9. **Visibilidade no Dashboard:** Contratos filtrados em 3 estados: Pendentes (padrao), Assinados, Cancelados.
10. **Usuarios:** Nome completo obrigatorio (min 2 palavras). CPF (11 digitos) e WhatsApp (DDD + numero) obrigatorios.
11. **Calculo de P1:** Valor derivado de `first_payment_amount` (fallback: `monthly_fee`). Contrato assinado no Mes A so conta se pago ate **dia 06** do Mes B. Pagamento apos dia 06 = desconsiderado para fins de meta.
13. **Regra de competencia:** A `signed_date` define o mes do contrato para **todas** as metricas (P1, TCV, NMRR, CAC, stats operacionais). Contrato gerado em marco e assinado em abril = contrato de abril em tudo.
12. **Debug (Impulse Plano 1):** Flag `isDebug: "preencher"` substitui signatarios por emails de teste.
14. **Semanas do Calendário (Gráficos):** As divisões semanais (Week 1, Week 2...) usadas nos gráficos (ex: Evolução P1) não adotam intervalos fixos de 7 dias ou de dia 6 ao dia 5. Elas espelham o calendário real (de Domingo a Sábado). Assim, se o mês começar, por exemplo, numa quinta-feira, a "Semana 1" irá apenas do dia 01 ao dia 03 (sábado), e assim por diante. Pode gerar de 4 a 6 divisões dependendo das semanas abrangidas pelo mês.
15. **Sincronizacao Frontend-Banco (Real-Time):** O frontend DEVE sempre refletir o estado mais recente do banco sem necessidade de recarregar a página. Toda mutação bem-sucedida (criar, editar, excluir) DEVE acionar um `fetch` fresco na store correspondente. As stores do Pinia NÃO devem usar cache que bloqueie atualizações (ex: `if (items.length > 0) return`).
16. **Filtros do Dashboard por Perfil (RBAC):**
    - **seller / sdr:** Veem APENAS o toggle "Minha Meta / Meta da Equipe" — e somente se pertencerem a uma equipe. Nenhum select de BU, Equipe ou Vendedor é exibido.
    - **coord:** Veem toggle "Por BU / Por Equipe" (somente se houver equipes vinculadas ao coord) + filtros de tempo.
    - **head:** Veem toggle "Minhas Equipes / Minhas BUs" (somente se houver equipes na sua BU) + filtros de tempo.
    - **admin:** Veem todos os filtros: toggle Por BU/Equipe, selects de BU, Equipe e Vendedor + filtros de tempo.

---

## 7. Proibicoes (nunca violar)

- Nunca Options API no Vue (componentes).
- Nunca duplicar interfaces — usar Kubb.
- **Nunca cores fora da paleta** (consultar `apps/web/design-system.md`).
- **Nunca light mode.**
- **Nunca textos em ingles** (exceto termos tecnicos: "head", "admin", "P1", "TCV", etc).
- **Nunca `alert()` ou `confirm()` nativos.** Usar `useToast` e `ConfirmModal`.
- **Nunca validacao HTML nativa** (`required`, `type="email"`). Toda validacao via JS com toast.
- **Nunca abrir modal sem bloquear scroll** (`document.body.style.overflow = 'hidden'`).

---

## 8. Politica de Regras Locais (Obrigatorio)

1. **Consulta Previa:** Ler o `rule.md` da pasta antes de codificar nela.
2. **Atualizacao Pos-Mudanca:** Atualizar o `rule.md` local apos alteracoes relevantes.
3. **Criacao de Novas Regras:** Ao criar modulo significativo, criar `rule.md` e adicionar referencia aqui.

### Mapa de rule.md

| Modulo | Caminho |
|---|---|
| Store (Pinia) | `apps/web/src/store/rule.md` |
| Router | `apps/web/src/router/rule.md` |
| API Client | `apps/web/src/api/rule.md` |
| Views (Home/Dashboard) | `apps/web/src/views/rule.md` |
| Views Admin | `apps/web/src/views/admin/rule.md` |
| Views Contratos | `apps/web/src/views/contracts/rule.md` |
| Components Admin | `apps/web/src/components/admin/rule.md` |
| Components Auth | `apps/web/src/components/auth/rule.md` |
| Components Dashboard | `apps/web/src/components/dashboard/rule.md` |
| Components Contratos | `apps/web/src/components/contracts/rule.md` |
| Assets/Design | `apps/web/design-system.md` |
| Backend Controllers | `apps/api/src/controllers/rule.md` |
| Backend Drive Service | `apps/api/src/services/google-drive.rule.md` |
| Backend Clicksign | `apps/api/src/services/clicksign.rule.md` |
| Backend Asaas | `apps/api/src/services/asaas.rule.md` |
| Arquitetura | `ARCHITECTURE.md` |
