# Regras de Componentes de Contrato

## 📋 Testemunhas Fixas (Signatários)

Para fins de teste e automação com Clicksign, as testemunhas fixas estão configuradas com e-mails de teste para evitar disparos reais durante o desenvolvimento.

### Mapeamento Atual (Emails de Teste):

- **Pedro Bartelle (NATI):** pedrobartelle@3fventure.com.br
- **Mateus Junges (LUIS):** mateus@3fventure.com.br

> [!IMPORTANT]
> Para a BU **Impulse**, as testemunhas fixas foram desativadas temporariamente para agilizar os testes de assinatura.

> [!IMPORTANT]
> Ao passar para produção, estes e-mails devem ser revertidos para os endereços oficiais sem o sufixo \+test\.

## 🏗️ WitnessSection.vue
Este componente é responsável por:
1. Renderizar os signatários fixos da BU selecionada.
2. Adicionar até 6 testemunhas adicionais por parte do cliente (OPCIONAL).
3. Preencher automaticamente o objeto \orm\ com os dados das testemunhas fixas (usando os campos \NOME TESTEMUNHA FIXA X\, \EMAIL TESTEMUNHA FIXA X\ e \CPF TESTEMUNHA FIXA X\).

> [!NOTE]
> As testemunhas adicionais não são obrigatórias para a geração do contrato, pois as testemunhas fixas da BU já garantem a validade jurídica mínima.

## 🚀 ProgressModal.vue
Este componente (\pps/web/src/components/ui/ProgressModal.vue\) é responsável pelo feedback visual durante a geração do contrato:
1. **Conexão SSE**: Escuta eventos de progresso via porta \:3007\.
2. **Log em Tempo Real**: Exibe cada etapa do fluxo (Drive, Docs, Clicksign).
3. **Confirmação**: Mostra mensagem de sucesso por 5s antes do redirecionamento automático.
4. **Resiliência**: Erros interrompem a barra de progresso mas mantêm o modal aberto para leitura do log.
5. **Bloqueio de Scroll**: O componente adiciona `overflow: hidden` ao `body` ao abrir e restaura ao fechar, usando `watch(show, ...)`. **Todos os modais do sistema devem seguir este padrão.**

## 👥 SignersModal.vue
Componente que exibe o progresso de assinaturas de um contrato em tempo real.
- **Trigger:** Botão de detalhes (icône de usuários) ao lado do contador de progresso no card do contrato.
- **Fonte de Dados:** Consome `GET /contracts/:id/signers` do backend, que consulta a API v3 da Clicksign.
- **Exibe:** Nome, e-mail e status (`Assinou` em verde / `Pendente` em cinza) de cada signatário.
- **Estética:** Segue o design system (Dark Tech, glassmorphism, `brand-cyan`). Bloqueio de scroll aplicado.
- **Sincronização Passiva:** Cada abertura do modal já realiza uma nova consulta, mantendo dados frescos.

## 🔴 ConfirmModal.vue
- Usado para confirmar ações destrutivas (excluir, cancelar).
- Segue a mesma política de bloqueio de scroll com `watch(isOpen, ...)`.

> [!IMPORTANT]
> **Lei de Modais:** NENHUM modal pode ser exibido sem implementar o bloqueio de scroll do `body`. Use `watch` na prop `isOpen`/`show` para adicionar/remover `document.body.style.overflow = 'hidden'`.
