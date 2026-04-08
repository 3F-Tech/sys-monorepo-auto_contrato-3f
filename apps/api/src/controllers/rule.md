# Regras dos Controladores (Backend)

## 🎯 Responsabilidade
Os controladores em `apps/api/src/controllers` são responsáveis por orquestrar a lógica de requisição e resposta. Eles devem:
1. Validar a entrada de dados (Schema Validation).
2. Interagir com o banco de dados via Prisma.
3. Formatar e retornar a resposta adequada (incluindo tratamento de BigInt).
4. Gerenciar limites de payload (atualmente configurado para `10mb` para suportar logos em base64).

## 🔐 Autenticação e Segurança
- **MD5**: Toda validação de senha deve usar o algoritmo MD5 para compatibilidade com o legado.
- **JWT**: O endpoint de login deve emitir tokens JWT assinados com `JWT_SECRET` (definido no `.env`).
- **Payload**: Tokens devem conter `id`, `email` e `type`.
- **Expiração**: O token deve expirar em `3h`.
- **Proteção**: Todas as rotas (exceto `/login` e `/health`) devem utilizar o `authMiddleware`.
- **RBAC (Controle de Acesso em Sellers)**:
  - `admin`: Ver e gerenciar todos os usuários e BUs.
  - `head`: Vê todos os usuários vinculados à sua BU. Pode criar qualquer cargo, facilitando a gestão descentralizada da unidade. Não pode gerenciar BUs.
  - `coord`: Vê apenas sua equipe direta (`head_id`). Só pode criar/editar vendedores para sua própria equipe. Pode criar e gerenciar equipes (mesmas regras de posse do `head`). Não pode mudar o cargo de um alvo.
  - `vendedor`: Acesso apenas aos próprios dados.

## 📝 Documentação (Swagger)
- **Obrigatoriedade**: Todo método público de um controlador DEVE possuir um bloco JSDoc `@openapi`.
- **Organização**: Use blocos JSDoc separados, colocados **imediatamente acima** de cada função. Nunca agrupe múltiplos métodos em um único bloco.
- **Componentes**: Utilize referências a schemas (ex: `$ref: '#/components/schemas/Sellers'`) sempre que possível.

## 📊 Automação Google Docs & Banco de Dados
- **Persistência Local**: O `contractAutomationController.ts` é responsável por salvar os dados no banco de dados local via Prisma.
- **Automação de Documentos**: O processamento de contratos gera uma cópia de um modelo no Google Docs e preenche as variáveis dinamicamente.
- **Banco de Dados (Prisma)**:
  - **Título Padronizado**: `{{ Razão Social }} & {{ Nome da BU }} ({{ Plano }})`. 
  - **Exceção BOMMA**: Contratos da BU Bomma seguem a nomenclatura: `{{ Razão Social }} & BOMMA ASSESSORIA DE MARKETING LTDA - {{ NOME FORMAL DO CONTRATO }}`.
  - **Conversão**: Valores monetários e datas brasileiros devem ser convertidos para `Decimal` e `DateTime` antes da persistência.
- **Clicksign Integration**: O backend deve ser capaz de exportar o Doc gerado para PDF (via Drive API) e enviar para o Clicksign via `ClickSignService.ts`.
- **Fluxo de Aprovação Manual**: Por padrão, o `handleContractSubmit` salva o contrato como **Rascunho** (`approved: false`). O envio para o Clicksign deve ser disparado manualmente via ação do usuário no frontend.
- **Campos de Controle**:
  - `approved` (boolean): `false` para rascunho, `true` após envio ao Clicksign.
  - `approved_at` (DateTime): Timestamp da aprovação manual.
- **Formatação p/ Google Docs**:
  - **Moeda**: Adicione sempre "R$ " antes de valores monetários.
  - **Instagram**: Adicione sempre "@" antes de handles de redes sociais.
- **Helper**: Use sempre o helper `handleContractSubmit` para novos contratos.
- **Lista de Testemunhas (L1/L2)**: As variáveis `{{ L1-TESTEMUNHAS }}` e `{{ L2-TESTEMUNHAS }}` são automaticamente populadas com uma lista balanceada de todas as testemunhas (fixas e as adicionais, se houver). O backend alterna entre as duas listas para manter o layout equilibrado.
- **Obrigatoriedade de Testemunhas**: Testemunhas ADICIONAIS não são obrigatórias, pois as testemunhas fixas das BUs e o próprio vendedor (que atua como testemunha) já suprem a necessidade jurídica mínima de 2 signatários extras.

## 🔗 Bypass Mode (Contrato Existente no Clicksign)
Quando o campo `ID DO DOCUMENTO CLICKSIGN` é preenchido no formulário, o `handleContractSubmit` ativa o **modo bypass**:
- **Pula completamente** a cópia no Google Drive, a edição no Google Docs e a criação de Envelope/Documento no Clicksign.
- **Consulta** o status do ID fornecido:
  1. Tenta como Envelope (API v3) via `ClickSignService.getEnvelope(id)`.
  2. Se falhar, tenta como Documento (API v1) via `ClickSignService.getDocumentStatusV1(key)`.
- **Detecta assinatura completa** se o status for `closed`, `completed` ou `document_closed`.
- **Salva** o ID no campo `document_id` e `signed: true/false` conforme o status detectado.
- **Aplica-se a todos os tipos de contrato** (Seed, Impulse, Bomma), pois o bypass é no helper genérico.

## 📡 Monitoramento de Progresso (SSE)
- **Tecnologia**: Server-Sent Events (SSE) via `ProgressTracker.ts`.
- **Funcionamento**: O controlador gera um `trackingId` (UUID) e emite eventos de progresso (`start`, `drive`, `docs`, `clicksign`, `completed`, `error`) durante o fluxo de automação.
- **Endpoint**: `/api/contracts/progress/:trackingId` (Público, deve estar ANTES do `authMiddleware`).
- **Headers**: Deve incluir `X-Accel-Buffering: no` para evitar buffer de proxy (Nginx).
- **Modo Debug "preencher"**: Exclusivo para o contrato **Plano 1 - Impulse**. Quando o corpo da requisição de envio (`/send-to-signature`) contém `isDebug: "preencher"`, o sistema substitui todos os signatários (BU, testemunhas, etc) por dois emails fixos de teste: `mateus@3fventure.com.br` (contratante) e `maysson@3fventure.com.br` (vendedor).

## 🪝 Webhooks e Gatilhos Pós-Assinatura
- **Clicksign**: O `webhookController.ts` processa eventos de assinatura.
- **Evento de Gatilho**: Somente o evento `closed` (envelope finalizado) dispara a atualização de status para `signed: true` e o gatilho externo.
- **Gatilho Externo**: Localizado em `webhookController.ts` (Placeholder para Conta Azul / Asaas).

## ⚙️ Melhores Práticas
- **Tratamento de BigInt**: Sempre utilize o serializador JSON personalizado para converter BigInt em string antes de enviar a resposta.
- **Express Types**: Utilize a tipagem forte do Express (`Request`, `Response`) em todos os métodos.
- **Erros**: Retorne status codes apropriados (200/201 para sucesso, 400/401/404/500 para erros).
- **Log**: Em produção, evite `console.log` excessivo; utilize o padrão de logs do monorepo se disponível.
- **Prisma Client Desatualizado**: O Prisma Client pode não refletir campos novos no schema (ex: `canceled_at`, `envelope_id`) se o `prisma generate` não for possível de executar (erro de permissão de arquivo). Nesses casos, use casting `(prisma.contracts as any)` nas operações que usam esses campos. **Reiniciar o servidor de dev** costuma resolver a dessincronização.

## 🔄 Evolução do Schema
- **Status de Mudança**: O campo `change_alert` (boolean) foi desativado em favor de `change_status` (string). Valores possíveis: `'alert'`, `'approved'`, `'reject'`, ou `null` (padrão). Não use o valor `'none'`.
- **Cancelamento**: O campo `canceled_at` (DateTime) é usado para marcar contratos cancelados. Contratos cancelados são isolados no filter `'canceled'` do Dashboard.
- **Assinaturas**: Os campos `signed_count` (Int) e `total_signers` (Int) rastreiam o progresso de assinaturas do envelope no Clicksign v3.
- **IDs Externos**: `envelope_id` armazena o UUID do Envelope na API v3. `document_id` pode armazenar o ID de documento v1/v3 ou o `fileId` do arquivo no Google Drive.
- **Datas Editáveis**: A rota `PUT /contracts/:id` aceita `created_at` como campo opcional. Isso permite a edição retroativa de datas de criação e assinatura de contratos importados manualmente.

## 🔵 Endpoint: Signatários de Contrato
- **Rota:** `GET /contracts/:id/signers`
- **Handler:** `getContractSigners`
- **Descrição:** Consulta em tempo real a API v3 da Clicksign, mapeando os requisitos para determinar quem já assinou. Retorna `[{name, email, signed}]`.
- **Frontend:** Utilizado pelo `SignersModal.vue` para exibir detalhe de progresso de assinaturas.

## 🗑️ Exclusão Completa (DELETE /contracts/:id) 
A exclusão de contratos é **atômica e multi-serviço** e possui as seguintes regras de permissão:
1. **Admin:** Pode excluir qualquer contrato a qualquer momento (inclusive assinados).
2. **Outros Cargos:** Só podem excluir se o contrato estiver cancelado (`canceled_at`) ou se for rascunho (`approved: false`).
A ordem é:
1. Lê o `envelope_id` e `document_id` do contrato.
2. Cancela o envelope no **Clicksign** (`ClickSignService.cancelDocument`).
3. Deleta o arquivo no **Google Drive** (`GoogleDriveService.deleteFile`).
4. Remove o registro e suas dependencias do **Banco de Dados** (transação Prisma).
Falhas nas etapas 2 e 3 são logadas mas não bloqueiam as etapas seguintes.

## 📡 Endpoints de Contratos (POST — todos exigem JWT)

| Rota | Handler | Contrato |
|---|---|---|
| `/contracts-sheets/impulse-plano-1` | `submitImpulsePlano1` | Impulse Plano 1 |
| `/contracts-sheets/impulse-plano-2` | `submitImpulsePlano2` | Impulse Plano 2 |
| `/contracts-sheets/seed-plano-1` | `submitSeedPlano1` | Seed Plano 1 |
| `/contracts-sheets/seed-plano-2` | `submitSeedPlano2` | Seed Plano 2 |
| `/contracts-sheets/seed-plano-growth` | `submitSeedGrowth` | Seed Growth |
| `/contracts-sheets/bomma-assessoria` | `submitBommaAssessoria` | Bomma Assessoria |
| `/contracts-sheets/bomma-consultoria` | `submitBommaConsultoria` | Bomma Consultoria |
| `/contracts-sheets/bomma-assessoria-social-ilimitado` | `submitBommaAssessoriaSocialIlimitado` | Bomma Ass. + Social (Ilimitado) |
| `/contracts-sheets/bomma-assessoria-social-artes` | `submitBommaAssessoriaSocialArtes` | Bomma Ass. + Social (Artes) |
| `/contracts-sheets/bomma-assessoria-social-determinada` | `submitBommaAssessoriaSocialDeterminada` | Bomma Ass. + Social (Determinada) |
| `/contracts-sheets/bomma-assessoria-social-videos` | `submitBommaAssessoriaSocialVideos` | Bomma Ass. + Social (Vídeos) |
| `/contracts-sheets/bomma-social-ilimitado` | `submitBommaSocialIlimitado` | Bomma Social Media (Ilimitado) |
| `/contracts-sheets/bomma-social-determinada` | `submitBommaSocialDeterminada` | Bomma Social Media (Determinada) |
| `/contracts/:id/send-to-signature` | `sendContractToClickSign` | Envio Manual Clicksign (v3) |

## 📋 Schema de Entrada (Zod — `contractSubmissionSchema`)
- **Obrigatórios**: Razão Social, CNPJ, CEP, endereço completo, representante (nome/email/CPF), valores (taxa, mensalidade, primeiro pagamento, data, dia vencimento), data assinatura, vendedor (nome/email/CPF).
- **Opcionais**: Testemunhas adicionais 1–6 (nome/email/cpf), testemunhas fixas 1–3, telefone/email financeiro, Instagram, QTD ARTES, QTD VIDEOS.
- **Bypass Clicksign**: Campo `'ID DO DOCUMENTO CLICKSIGN'` — quando preenchido, ativa o modo bypass (veja seção Bypass Mode).

## 📂 Mapa de Controllers

| Arquivo | Responsabilidade |
|---|---|
| `contractAutomationController.ts` | Criação de contratos (Google Drive + Docs + Clicksign). Handler principal: `handleContractSubmit`. |
| `contractController.ts` | CRUD de contratos existentes: `GET /contracts`, `PUT /contracts/:id`, `DELETE /contracts/:id`, `GET /contracts/:id/signers`. |
| `sellerController.ts` | CRUD de vendedores: `GET /sellers`, `POST /sellers`, `PUT /sellers/:id`. |
| `businessController.ts` | CRUD de BUs: `GET /business`, `POST /business`, `PUT /business/:id`. |
| `goalController.ts` | CRUD de metas: `GET /goals`, `POST /goals` (upsert), `DELETE /goals/:id`. Filtra por `month` e `year` via query params. |
| `commercialCostsController.ts` | CRUD de custos comerciais mensais: `GET /commercial-costs`, `POST /commercial-costs`. |
| `cacController.ts` | CRUD de CAC por BU: `GET /cac`, `POST /cac`. |
| `teamController.ts` | CRUD de equipes + membros: `GET /teams`, `POST /teams`, `PUT /teams/:id`, `DELETE /teams/:id`, `POST /teams/:id/members`, `DELETE /teams/:id/members/:sellerId`. |
| `sellerBussinessController.ts` | Associação seller ↔ BU: `PUT /seller-business` com `{ seller_id, business_ids[] }`. |
| `webhookController.ts` | Processamento de webhooks do Clicksign (evento `closed` → `signed: true`). |
| `healthController.ts` | `GET /health` — endpoint público de health check. |

## 🛠️ Build e Configuração TypeScript
- **Módulo**: A API compila com `"module": "Node16"` e `"moduleResolution": "Node16"` no `tsconfig.json`, gerando output **CommonJS**.
- **Output**: O build `tsc` gera os arquivos em `dist/src/` (não `dist/` diretamente), pois `rootDir` é `.` (raiz de `apps/api`).
- **Comando de start em produção**: `node apps/api/dist/src/index.js` (configurado em `ops/project.yml`).
- **Proibido**: Não use `import.meta.url` — incompível com output CommonJS. Use `__dirname` diretamente.
- **Imports**: Nunca adicione extensão `.ts` em imports relativos dentro do código-fonte.
