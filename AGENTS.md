# 🤖 AGENTS.MD - Business Logic & Workflow Rituals

> **CRITICAL:** Este arquivo define o comportamento operacional, regras de negócio e rituais de execução para agentes de IA neste projeto. 
> Para padrões de codificação, arquitetura técnica e restrições de stack (Vue/Prisma/Tailwind), consulte o **`GEMINI.md`**.

---

## 🎯 Objetivo do Agente
Você atua como um Desenvolvedor Sênior e Especialista em Automação. Sua missão é garantir que toda funcionalidade implementada respeite o ecossistema de **Automação de Contratos** e a integridade do **Multi-tenancy**.

## 🛡️ Protocolo de Contexto
Sempre que uma tarefa for iniciada, você deve validar se a solução proposta fere qualquer uma das "Regras de Negócio V1" ou os "Fluxos de Status" descritos abaixo.

## 🚀 Ritual de Início (OBRIGATÓRIO para toda tarefa)

Antes de escrever qualquer linha de código, siga SEMPRE esta sequência:

1. **Leia este arquivo** (`GEMINI.md`) para absorver as regras globais.
2. **Leia o `CONTEXT.md`** para entender o propósito e as regras de negócio da V1.
3. **Identifique a(s) pasta(s)** que serão alteradas.
4. **Leia o `rule.md` local** de cada pasta relevante antes de codificar (ex: ao editar um controller, leia `apps/api/src/controllers/rule.md`).
5. **Após qualquer mudança relevante** (novo campo, nova rota, mudança de comportamento), **atualize o `rule.md` correspondente** para que ele reflita o estado atual real do código.


## 📋 Regras de Negócio V1

1. **Multi-tenancy:** Um vendedor só pode ver as empresas vinculadas a ele.
2. **Role-based Access (RBAC):** Bloqueie rotas de admin para sellers. Os cargos são: `admin`, `head`, `coord`, `seller`.
3. **Trigger de Automação:** Registro obrigatório no banco de dados a cada contrato enviado.
   3a. **Automação Google Drive:** Novos contratos devem ser copiados de modelos específicos para a pasta de destino `1KF4W-RQ3CAJj4KFAAX9K9cxdRW9u6phg`.
4. **Head de BU (Relacionamento 1:1)**: Usuários com o cargo `head` **só podem estar vinculados a uma única BU** por vez, e simultaneamente, **cada BU pode ter APENAS UM usuário como seu HEAD**.
5. **Automação de Formulários:** Ao iniciar a criação de um contrato, os campos "Vendedor" devem ser pré-preenchidos automaticamente. Para "Testemunha", oferecer botões de atalho para Luís e Natália (opcionais, campos editáveis). **Testemunhas ADICIONAIS não são obrigatórias.**
   5a. **Respeito a CPFs:** NUNCA use CPFs de signatários fixos (Luís, Natália, Letícia, Erika) em campos de testes de testemunhas adicionais. Use apenas CPFs extras fornecidos para este fim.
6. **Visibilidade no Dashboard:**
   - **Coordenador de Equipe:** Visualiza apenas os **Vendedores** vinculados a sua equipe (filtrados pela sua identificação em `head_id`).
   - **Head de BU:** Visualiza **todos** os usuários vinculados à sua BU e contratos gerais.
   - **Filtros de Contrato:** Os contratos são filtrados em 3 estados mutuamente exclusivos: **Pendentes** (padrão), **Assinados** e **Cancelados**. Não existe a opção "Todas".
7. **Assinatura do Head:** O **Head da BU** deve obrigatoriamente ser adicionado como **Testemunha** em TODOS os contratos gerados dentro da sua respectiva Unidade de Negócio.
8. **Fluxo de Status de Contratos (`change_status`):** O campo é do tipo `String` e possui 4 estados:
   - `null` → Padrão. Nenhuma alteração pendente.
   - `alert` → Solicitado pelo Seller. Aguarda aprovação da liderança.
   - `approved` → Aprovado por `coord`, `head` ou `admin`.
   - `reject` → Recusado por `coord`, `head` ou `admin`.

8. **Formatação de Contratos:**
   - **Moeda:** Valores monetários devem SEMPRE ser precedidos por "R$ " (ex: R$ 1.000,00) nos documentos gerados.
   - **Instagram:** Handles de Instagram devem ser digitados SEM o "@" (o sistema remove automaticamente). O "@" é adicionado apenas nos documentos gerados (ex: @meu_perfil).
   - **Social Media (Bomma):** `QTD ARTES` e `QTD VIDEOS` são obrigatórios apenas em modelos que mencionam "Artes", "Vídeos" ou "Determinada". Nos demais, ficam ocultos.

9. **Nome Completo de Usuários:** O nome de todos os usuários deve conter pelo menos duas palavras (nome e sobrenome).
10. **CPF e WhatsApp Obrigatórios:** Todos os usuários devem ter CPF (11 dígitos) e WhatsApp (DDD + número) preenchidos.
11. **Aprovação Manual Clicksign:** Por padrão, contratos são criados como rascunhos (`approved: false`). O envio para assinatura no Clicksign deve ser disparado manualmente pelo vendedor via Dashboard, após aprovação do cliente.
12. **Regra de Debug (Impulse Plano 1):** Quando o contrato "Plano 1 - Impulse" é enviado com a flag `isDebug: "preencher"`, o sistema deve ignorar os signatários padrão e enviar apenas para o vendedor (`maysson@3fventure.com.br`) e o contratante (`mateus@3fventure.com.br`).

