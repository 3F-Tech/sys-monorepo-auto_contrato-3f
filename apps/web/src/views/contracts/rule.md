# Regras Locais: Automação de Contratos (Front-end)

Este módulo gerencia o fluxo de criação de contratos, desde a seleção da BU até a geração final.

## 🏗️ Padrão de Formulários Dinâmicos
Para garantir que possamos escalar para dezenas de tipos de contrato, seguimos este padrão:

1. **Componentização por Etapa:** O formulário principal em `ContractFlow.vue` delega a renderização dos campos para componentes em `steps/`.
2. **Schema-Driven UI:** Onde possível, use objetos de configuração para definir campos (label, mask, validation) em vez de hardcoding no template.
3. **Estado Reativo Centralizado:** Use um objeto `formData` reativo no componente pai para coletar todos os dados das etapas.
4. **Cabeçalho Dinâmico:** O cabeçalho da Etapa 3 deve exibir automaticamente a logo da BU selecionada (`img_base64`) e o nome do plano. A logo deve ser exibida sem padding interno para preencher o container.
5. **Adaptações de Plano:** O formulário de "Plano Growth" possui campos reduzidos (sem Prazo Contratual); o mapeamento de colunas é ajustado no backend.

## 🎨 Design System de Formulários
Siga estritamente o `apps/web/design-system.md`:
- **Containers:** Use `brand-offset` com bordas `brand-glass-border`.
- **Inputs:** Use a classe `.input-glass` definida no `style.css`.
- **Foco:** Sempre destaque o campo ativo com `brand-cyan`.
- **Feedback:** Erros de validação devem usar tons de vermelho refinados (ex: `text-red-400/80`).

## 🔐 Segurança & Dados
- **Máscaras:** Aplique máscaras de CPF, CNPJ e Telefone usando a biblioteca `maska`.
- **Normalização:** Limpe os dados (remova pontos/traços) antes de enviar para a API.
- **Formatação**: Valores monetários devem ter "R$ ". O campo de Instagram deve remover automaticamente o "@" digitado pelo usuário; a formatação com "@" ocorre apenas nos documentos (tratado no backend).
- **Campos Condicionais (Bomma)**: `QTD ARTES` e `QTD VIDEOS` aparecem apenas em modelos de Social Media com quantidade determinada.
- **Indicador de Assinaturas (Dashboard)**: Cores dinâmicas baseadas no progresso (Vermelho < 50%, Amarelo >= 50%, Verde = 100%).
- **Assinatura Digital**: O fluxo de contratos agora inclui o envio para o **Clicksign** após a geração do Google Doc.
- **Identificação:** O `seller_id` é extraído automaticamente do token de sessão.
- **Título Padronizado:** Use sempre o padrão `{{ Empresa }} & {{ Nome da BU }} ({{ Plano }})` para facilitar a identificação no dashboard.

## 🔗 Campo "ID DO DOCUMENTO CLICKSIGN" (Todos os Formulários)
- **Posição:** Sempre no **topo** de todos os formulários de contrato, antes de qualquer outro campo.
- **Banner informativo:** Exibir alerta de atenção (estilo `bg-brand-cyan/5 border-brand-cyan/20`) explicando que o campo só deve ser preenchido se o contrato já existir no Clicksign.
- **Comportamento:** Quando preenchido, o backend pula a geração no Google Drive e a criação de envelope no Clicksign, vinculando diretamente o ID ao banco. O status de assinatura (`signed`) é verificado em tempo real.
- **Escopo:** Aplicado em `SeedPlano1.vue`, `SeedPlano2.vue`, `SeedPlanoGrowth.vue`, `ImpulsePlano1.vue`, `ImpulsePlano2.vue` e `BommaTemplate.vue`.
- **initialData:** O campo `'ID DO DOCUMENTO CLICKSIGN': ''` deve estar presente no objeto `initialData` de `ContractFlow.vue`.
- **Hierarquia de Acesso:**
  - **Admin:** Vê todas as BUs.
  - **Head:** Vê BUs vinculadas e vendedores da sua equipe.
  - **Coord:** Vê exclusivamente a **única BU** que coordena.
  - **Seller:** Vê BUs vinculadas.
- **Auto-preenchimento Inteligente:**
  - Carregue o `NOME DO VENDEDOR` e `CPF DO VENDEDOR` do perfil do usuário logado.
  - Não é mais necessário identificar Coordenadores da BU nos formulários de contrato.
  - **Testemunhas:** O campo `Testemunha 1` deve permitir edição manual e oferecer botões de preenchimento rápido para **Luís** e **Natália**.

## 🔄 Fluxo de Etapas
1. **Seleção de BU:** Feito.
2. **Seleção de Modelo:** Feito.
3. **Dados da Contratada:** Informações da empresa que está contratando.
4. **Resumo & Assinatura:** Prévia dos dados antes do disparo. Ao confirmar, o `trackingId` é gerado e o **Modal de Progresso (SSE)** é ativado.

## 📡 Monitoramento em Tempo Real (SSE)
- **Componente**: `ProgressModal.vue` (UI em Dark Tech/Glassmorphism).
- **Conexão**: Iniciada via SSE para o endpoint do backend usando o `trackingId`.
- **Estados**: 
    - `connected`: Conexão estabelecida.
    - `processing`: Atualizações em tempo real dos passos (Drive, Docs, Clicksign).
    - `completed`: Sucesso (exibido por 5s antes do redirecionamento).
    - `error`: Erro persistente (não fecha automaticamente).
- **Redirecionamento**: Após 5 segundos de sucesso, o usuário é levado de volta ao Dashboard.

## 🔄 Dashboard e Status de Contratos

- **Filtros de Visibilidade:** A interface de contratos não possui mais a opção de visão geral "Todas". Os contratos são filtrados em 3 estados principais mutuamente exclusivos:
  - **Pendentes (Padrão):** Contratos criados mas ainda não assinados nem cancelados.
  - **Assinados:** Contratos que concluíram o fluxo de assinatura.
  - **Cancelados:** Contratos sinalizados via `canceled_at`.

- **Ordenação de Pendentes:** Dentro do filtro "Pendentes", a ordenação segue:
  1. **Prioridade 1 — Alertas no Topo:** Contratos com `change_status === 'alert'` sobem ao topo.
  2. **Prioridade 2 — Mais Assinaturas:** Contratos com maior `signed_count` aparecem primeiro (mais próximos do fim).
  3. **Prioridade 3 — Mais Recentes:** Em caso de empate, contratos com `created_at` mais recente aparecem primeiro.

- **Fluxo de Alteração (Change Status):** O status de alteração (`change_status`) é independente do status de assinatura e possui 4 estados:
  - `null` (Nenhum): O padrão.
  - `alert` (Amarelo): Solicitado pelo vendedor, aguardando aprovação ("Em Validação").
  - `approved` (Verde): Aprovado pela liderança.
  - `reject` (Vermelho): Recusado pela liderança.

- **Regras de Interface por Status:**
  - **Cancelado:** Botões originais (Assinado, Aviso, Cancelar) são removidos; resta apenas o botão "**Excluir**".
  - **Assinado:** Botões permanecem visíveis para histórico, mas ficam **desabilitados** (pointer-events-none) e opacos.
  - **Exclusão Completa:** Um contrato **SÓ PODE** ser excluído permanentemente se ele tiver sido previamente cancelado. A exclusão agora é **atômica e completa**:
    - Remove o registro do Banco de Dados (Prisma).
    - Cancela o envelope no Clicksign (API v3/v1).
    - Deleta o arquivo físico no Google Drive (File ID).

## 🗺️ Mapa de Templates & Endpoints

O `ContractFlow.vue` decide o componente e endpoint com base na BU + template selecionados:

| BU | Template (UI) | Componente | Endpoint API |
|---|---|---|---|
| Impulse | Plano 1 - Geração de Oportunidade | `ImpulsePlano1.vue` | `/contracts-sheets/impulse-plano-1` |
| Impulse | Plano 2 - + Social Media | `ImpulsePlano2.vue` | `/contracts-sheets/impulse-plano-2` |
| Seed | Plano 1 - Geração de Oportunidade | `SeedPlano1.vue` | `/contracts-sheets/seed-plano-1` |
| Seed | Plano 2 - + Social Media | `SeedPlano2.vue` | `/contracts-sheets/seed-plano-2` |
| Seed | Plano Growth | `SeedPlanoGrowth.vue` | `/contracts-sheets/seed-plano-growth` |
| Bomma | Assessoria | `BommaTemplate.vue` | `/contracts-sheets/bomma-assessoria` |
| Bomma | Consultoria | `BommaTemplate.vue` | `/contracts-sheets/bomma-consultoria` |
| Bomma | Assessoria + Social Media (Qtd Min Artes) | `BommaTemplate.vue` | `/contracts-sheets/bomma-assessoria-social-artes` |
| Bomma | Assessoria + Social Media (Qtd Min Determinada) | `BommaTemplate.vue` | `/contracts-sheets/bomma-assessoria-social-determinada` |
| Bomma | Assessoria + Social Media (Qtd Min Vídeos) | `BommaTemplate.vue` | `/contracts-sheets/bomma-assessoria-social-videos` |
| Bomma | Assessoria + Social Media (Ilimitado) | `BommaTemplate.vue` | `/contracts-sheets/bomma-assessoria-social-ilimitado` |
| Bomma | Social Media (Ilimitado) | `BommaTemplate.vue` | `/contracts-sheets/bomma-social-ilimitado` |
| Bomma | Social Media (Qtd Min Determinada) | `BommaTemplate.vue` | `/contracts-sheets/bomma-social-determinada` |

> **Regra:** Todos os templates Bomma compartilham o `BommaTemplate.vue`. O `sheetName` correto é enviado ao backend via payload e determina o modelo do Google Drive a ser copiado.

## 🔧 Botão de Debug
- Os formulários possuem um botão de **preenchimento automático** (`Auto-Preencher`) visível apenas em desenvolvimento.
- Ele chama a função `autoFillDebug()` que preenche todos os campos com dados fictícios válidos para agilizar testes.
- **Não** deve ser removido em produção (não é exibido por padrão com dados reais).

