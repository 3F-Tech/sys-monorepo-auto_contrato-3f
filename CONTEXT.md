# 🎯 Contexto do Projeto: Automação de Contratos (V1)

## 📝 Visão Geral
Este projeto é uma plataforma de **"Trigger de Automação"**. O objetivo da V1 é permitir que vendedores vinculados a diferentes empresas possam preencher formulários de contrato de forma rápida, disparando um fluxo de automação externo no **Make.com**.

## 👥 Perfis de Usuário (Roles)
1. **Vendedor:**
   - Visualiza apenas as empresas às quais está vinculado.
   - Seleciona um modelo de contrato disponível para a empresa.
   - Preenche o formulário e envia para processamento.
2. **Administrador (admin):**
   - Possui todas as permissões de vendedor.
   - **CRUD de Vendedores:** Criação, edição e remoção de usuários.
   - **Vínculos:** Define quais empresas cada vendedor pode acessar (N:N).
   - **CRUD de Empresas:** Gerencia as empresas fixas do sistema.

## 🏢 Regras de Negócio: Multi-Tenancy
- Um vendedor pode estar vinculado a múltiplas empresas simultaneamente via tabela `seller_business`.
- A Home deve filtrar as opções de empresa baseada no ID do vendedor logado.
- O campo `color` da empresa deve ser usado para personalizar elementos da interface (botões, headers) quando o vendedor estiver no contexto daquela empresa.

## 🔄 Fluxo do Usuário
1. **Autenticação:** Login via Supabase.
2. **Home:** Listagem das empresas permitidas.
3. **Seleção de Contrato:** Escolha do modelo específico da empresa.
4. **Preenchimento:** Formulário com validação Zod no front e back.
5. **Registro e Trigger:**
   - Back-end salva o log da operação no Prisma.
   - Back-end dispara POST para Webhook do Make.com.

## 🛑 Escopo V1 vs Futuro
- **V1:** Foco em CRUDs básicos, autenticação e disparo de webhook.
- **Futuro:** Dashboard de métricas, integração n8n, Clicksign e Conta Azul.

## 🎨 Identidade Visual (Design System)
> **Consulte o `.antigravityrules` para os tokens completos.** Resumo essencial:
- **Tema:** Modo escuro exclusivo. Nunca use fundo branco em novas telas.
- **Fundo principal:** `#0d1b2a` (navy profundo) — painéis de formulário: `#111c29`
- **Cor de destaque:** `#00d4ff` (ciano vibrante) — usada em labels, botões e acentos
- **Gradiente do botão primário:** `linear-gradient(90deg, #00d4ff, #0094ff)`, texto `#0d1b2a`
- **Layout de Autenticação:** Tela dividida 55%/45% — branding à esquerda, formulário à direita
- **Logo:** `apps/web/src/assets/3F/3fventure-logo.jpg`
- **Inputs:** estilo de vidro (glassmorphism) sutil (`rgba(255,255,255,0.06)`) com borda fina e foco ciano

## 💡 Diretrizes para a IA
- Priorize mobile-first para os formulários.
- Não implemente lógica de geração de PDF localmente; o Make.com é o responsável.
- Mantenha os nomes de colunas do banco exatamente como definidos no Schema SQL fornecido.
- Sempre consulte o Design System no `.antigravityrules` antes de criar qualquer nova tela ou componente visual.