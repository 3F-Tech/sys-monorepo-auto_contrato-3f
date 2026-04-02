# 🎯 Contexto do Projeto: Automação de Contratos (V1)

## 📝 Visão Geral

Este projeto é uma plataforma de **"Trigger de Automação"**. O objetivo da V1 é permitir que vendedores vinculados a diferentes empresas possam preencher formulários de contrato de forma rápida, disparando um fluxo de automação.

## 👥 Perfis de Usuário (Roles)

1. **Vendedor (seller):**
   - Visualiza apenas as empresas às quais está vinculado.
   - Seleciona um modelo de contrato disponível para a empresa.
   - Preenche o formulário e envia para processamento.
2. **Head de Equipe (head):**
   - Gerencia uma equipe de vendedores (vinculados via `head_id`).
   - Visualiza contratos da própria equipe no dashboard.
   - Pode aprovar/rejeitar solicitações de alteração de contratos (`change_status`).
3. **Coordenador de BU (coord):**
   - Coordena UMA única unidade de negócio.
   - Visualiza todos os usuários e contratos vinculados à sua BU.
   - Pode aprovar/rejeitar solicitações de alteração de contratos.
4. **Administrador (admin):**
   - Possui todas as permissões.
   - **CRUD de Usuários:** Criação, edição e remoção de qualquer perfil.
   - **Vínculos:** Define quais empresas cada vendedor pode acessar (N:N).
   - **CRUD de Empresas:** Gerencia as BUs (Business Units) do sistema.

## 🏢 Regras de Negócio: Multi-Tenancy

- Um vendedor pode estar vinculado a múltiplas empresas simultaneamente via tabela `seller_business`.
- A Home deve filtrar as opções de empresa baseada no ID do vendedor logado.
- O campo `color` da empresa deve ser usado para personalizar elementos da interface (botões, headers) quando o vendedor estiver no contexto daquela empresa.

## 🔄 Fluxo do Usuário

1. **Autenticação:** Login via JWT próprio (email + senha MD5, `JWT_SECRET` no `.env`).
2. **Home:** Dashboard com stats, filtros de mês/BU/vendedor e listagem de contratos.
3. **Seleção de Contrato:** Escolha do modelo específico da empresa.
4. **Preenchimento:** Formulário com validação Zod no front e back (testemunhas adicionais são opcionais).
5. **Registro e Trigger:**
   - Back-end salva o log da operação no Prisma.
   - A automação Clicksign assume a geração do envelope.

## 🛑 Escopo V1 vs Futuro

- **V1 (atual):** CRUDs de usuários e BUs, autenticação JWT própria, **Integração Clicksign (Fase 1: Envio de Documentos)**, dashboard de métricas avançadas com ApexCharts (NMRR, TCV, P1), fluxo de aprovação de alterações de contrato (`change_status`).
- **Futuro:** Integração n8n, automação completa de assinaturas, Conta Azul, dashboard de BI avançado.

## 🎨 Identidade Visual (Design System)

> **Consulte o `GEMINI.md` para os tokens completos.** Resumo essencial:

- **Tema:** Modo escuro exclusivo. Nunca use fundo branco em novas telas.
- **Fundo principal:** `#0d1b2a` (navy profundo) — painéis de formulário: `#111c29`
- **Cor de destaque:** `#00d4ff` (ciano vibrante) — usada em labels, botões e acentos
- **Gradiente do botão primário:** `linear-gradient(90deg, #00d4ff, #0094ff)`, texto `#0d1b2a`
- **Layout de Autenticação:** Tela dividida 55%/45% — branding à esquerda, formulário à direita
- **Logo:** `apps/web/src/assets/3F/3fventure-logo.jpg`
- **Inputs:** estilo de vidro (glassmorphism) sutil (`rgba(255,255,255,0.06)`) com borda fina e foco ciano

## 💡 Diretrizes para a IA

- Priorize mobile-first para os formulários.
- **Geração de PDF:** O sistema exporta o Google Doc para PDF via Google Drive API apenas para envio ao Clicksign. Outras automações de documento continuam externas.
- Mantenha os nomes de colunas do banco exatamente como definidos no Schema SQL fornecido.
- Sempre consulte o `GEMINI.md` antes de fazer QUALQUER alteração no projeto, pois ele é o cerne da IA no nosso projeto.
