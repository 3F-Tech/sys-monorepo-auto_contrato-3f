# CRITICAL INSTRUCTIONS - READ BEFORE ANY ACTION
Este arquivo contém as diretrizes mandatórias de desenvolvimento para este monorepo. 
Você DEVE validar cada plano de ação contra as seções "Ritual de Início" e "🚫 O que evitar" antes de sugerir código.

Consulte o arquivo AGENTS.md para obter informações sobre a lógica de negócios e os procedimentos de fluxo de trabalho.

# Regras de Desenvolvimento - Automação de Contratos (Monorepo)

## 🏗️ Estrutura e Workflow (Turborepo + PNPM)

- **Monorepo:** Respeite a divisão de pacotes. Código de app em `apps/`, configurações e tipos compartilhados em `packages/`.
- **Kubb:** Sempre verifique os arquivos gerados pelo Kubb antes de criar novos tipos de API ou hooks de busca manualmente. O Swagger é a fonte da verdade.
  - **⚠️ Ao alterar qualquer rota ou schema no Swagger**, execute `pnpm run generate` na raiz para regenerar os types e hooks em `apps/web/src/gen/`.
- **Gestão de Dependências:** Use sempre `pnpm` para adicionar ou remover pacotes.

## 🟢 Front-end (Vue 3 + TypeScript)

- **Paradigma:** Use exclusivamente Composition API com `<script setup>`.
- **State Management:** Use Pinia para estados globais. As stores existentes são:
  - `useAuthStore` → Sessão do usuário logado, login e logout (`apps/web/src/store/auth.ts`).
  - `useContractStore` → Contratos do usuário/equipe, atualização de status (`apps/web/src/store/contracts.ts`).
  - `useSellerStore` → Lista de vendedores/equipe para o admin e head (`apps/web/src/store/seller.ts`).
- **Estilização:** Tailwind CSS (siga o padrão utilitário). Use Lucide-icons para ícones.
- **Componentes:** Componentes pequenos e reutilizáveis. Use `defineProps` e `defineEmits`.

## 🎨 Design System & Identidade Visual

> A definição completa de cores, gradientes, tipografia e assets está documentada no Sistema de Design. Consulte obrigatoriamente **`apps/web/design-system.md`** antes de QUALQUER alteração visual ou de UI.

## 🔵 Back-end (Node.js + TypeScript)

- **Local Rules:** Antes de editar qualquer controlador ou lógica de servidor, consulte **`apps/api/src/controllers/rule.md`**.
- **Validação:** Use Zod para validar todos os payloads de entrada.
- **Swagger Sync:** Mudou a rota ou schema? Atualize o JSDoc imediatamente **e** regenere o Kubb.
- **Banco de Dados (Supabase + Prisma):** O Prisma Client sofre exaustão de conexões no modo _Session_ (porta `5432`) da Supabase. Em produção e desenvolvimento, DEVEMOS usar a Connection Pooler no modo _Transaction_ (`6543`) com a querystring `&pgbouncer=true` na `DATABASE_URL`. A URL direta (porta `5432` sem pgbouncer) deve ser usada apenas como `DIRECT_URL` para migrações no `schema.prisma`. Garanta também o uso padrão Singleton (`apps/api/src/prisma.ts`) e nunca instancie `new PrismaClient()` em controllers e webhooks.

## 🔐 Segurança e Autenticação (JWT & Sessão)

As diretrizes detalhadas de segurança foram distribuídas por responsabilidade:

- **Backend (Emissão/Hash):** Consulte **`apps/api/src/controllers/rule.md`**.
- **Frontend (Store/Persistência):** Consulte **`apps/web/src/store/rule.md`**.
- **Frontend (Roteamento/Guards):** Consulte **`apps/web/src/router/rule.md`**.
- **Frontend (API Client/Interceptors):** Consulte **`apps/web/src/api/rule.md`**.

## 🧩 Política de Regras Locais (Obrigatório)

Este projeto utiliza um sistema de documentação distribuída. O `GEMINI.md` é o manual mestre, mas os detalhes técnicos residem em arquivos `rule.md` locais.

1. **Consulta Prévia:** É obrigatório ler o `rule.md` da pasta antes de codificar nela.
2. **Atualização Pós-Mudança:** Após qualquer alteração relevante, atualize o `rule.md` local para refletir o novo estado.
3. **Criação de Novas Regras:** Ao criar um novo módulo significativo, crie um `rule.md` e adicione a referência aqui.
4. **Padrão de Referência:**
   - **Store:** `apps/web/src/store/rule.md`
   - **Router:** `apps/web/src/router/rule.md`
   - **API Client:** `apps/web/src/api/rule.md`
   - **Views (Geral):** `apps/web/src/views/rules.md`
   - **Views de Admin:** `apps/web/src/views/admin/rule.md`
   - **Views de Contratos:** `apps/web/src/views/contracts/rule.md`
   - **Components de Admin:** `apps/web/src/components/admin/rule.md`
   - **Components de Auth:** `apps/web/src/components/auth/rules.md`
   - **Assets/Design:** `apps/web/design-system.md`
   - **Backend Controllers:** `apps/api/src/controllers/rule.md`
   - **Backend Drive Service:** `apps/api/src/services/google-drive.rule.md`
   - **Backend Asaas Service:** `apps/api/src/services/asaas.rule.md`
   - **Arquitetura do projeto:** `ARCHITECTURE.md`
   - **Contexto e negócio:** `CONTEXT.md`

## 🚫 O que evitar

- Não use Options API no Vue.
- Não duplique interfaces; use o Kubb.
- **NUNCA use cores fora da paleta** (consulte ref local).
- **NUNCA use light mode.**
- **NUNCA use textos em inglês** (exceto os termos técnicos "head" e "admin"). Sempre traduza: "sellers" = vendedores, "contracts" = contratos, etc.
- **NUNCA use `alert()` ou `confirm()` nativos do navegador.** Sempre utilize componentes customizados do Design System (ex: `ToastProvider` e `ConfirmModal`). A única exceção aceitável para usar `alert()` é em casos de erros críticos de travamento interno do próprio sistema onde a UI falhou de renderizar.
- **NUNCA use validação nativa do HTML** (`required`, `type="email"`, etc.) em formulários. TODA validação deve ser feita via JavaScript, usando o sistema de toast (`useToast`) para exibir erros customizados.
- **NUNCA abra modais sem bloquear o scroll do body.** Use `watch` na prop `isOpen`/`show` de cada modal para adicionar `document.body.style.overflow = 'hidden'` ao abrir e remover ao fechar.
