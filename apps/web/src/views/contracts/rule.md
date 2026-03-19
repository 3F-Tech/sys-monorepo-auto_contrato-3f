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
- **Formatação**: Valores monetários devem ter "R$ " e Instagram deve ter "@" nos documentos gerados (tratado no backend).
- **Persistência Dupla (Sheets + DB):** Todo contrato confirmado é enviado simultaneamente para o Google Sheets e para o banco de dados.
- **Identificação:** O `seller_id` é extraído automaticamente do token de sessão.
- **Título Padronizado:** Use sempre o padrão `{{ Empresa }} & {{ Nome da BU }} ({{ Plano }})` para facilitar a identificação no dashboard.
- **Hierarquia de Acesso:**
  - **Admin:** Vê todas as BUs.
  - **Head:** Vê BUs vinculadas e vendedores da sua equipe.
  - **Coord:** Vê exclusivamente a **única BU** que coordena.
  - **Seller:** Vê BUs vinculadas.
- **Auto-preenchimento Inteligente:**
  - Carregue o `NOME DO VENDEDOR` e `CPF DO VENDEDOR` do perfil do usuário logado.
  - Identifique o `NOME COORD BU` e `CPF COORD BU` buscando o usuário com papel `coord` vinculado à BU selecionada.
  - **Testemunhas:** O campo `Testemunha 1` deve permitir edição manual e oferecer botões de preenchimento rápido para **Luís** e **Natália**.

## 🔄 Fluxo de Etapas
1. **Seleção de BU:** Feito.
2. **Seleção de Modelo:** Feito.
3. **Dados da Contratada:** Informações da empresa que está contratando.
4. **Resumo & Assinatura:** Prévia dos dados antes do disparo.

## 🔄 Fluxo de Alteração de Contratos (Change Status)
O status de alteração de um contrato (`change_status`) possui 4 estados possíveis:
- `null` (Nenhum): O padrão.
- `alert` (Amarelo): Status de aviso. Solicitado pelo Seller, fica aguardando aprovação. Apparece como "Em Validação" para o Seller. O Seller deve poder enviar uma descrição (`change_description`) justificando a requisição.
- `approved` (Verde): Aprovado por um Head, Coordenador, ou Admin.
- `reject` (Vermelho): Recusado por um Head, Coordenador, ou Admin.

**Regras de Visibilidade e Acesso:**
- Apenas `head`, `coord` e `admin` têm a capacidade de filtrar e listar todos os contratos que estão em `alert`.
- Esses mesmos papéis (`head`, `coord`, `admin`) são os únicos com permissão para alterar o status de `alert` para `approved` ou `reject`.
