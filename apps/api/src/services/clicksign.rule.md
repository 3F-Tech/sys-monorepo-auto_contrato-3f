# Integração Clicksign (Assinatura Digital)

## 🎯 Objetivo
Este módulo gerencia a integração com a API v3 da Clicksign (Envelopes) para envio de contratos.

## 🔄 Fluxo de Integração (API v3 - Envelopes)
1. **Envelope**: Criação do envelope via `createEnvelope`.
2. **Documento**: Upload do PDF via `addDocumentToEnvelope`.
3. **Signatários**: Adição de signatários via `addSignerToEnvelope`. **IMPORTANTE: CPF deve estar mascarado (`000.000.000-00`)**.
4. **Double Requirement (VÍNCOLO)**: Cada signatário deve ter DUO vínculos criados via `bulk_requirements`:
   - Um vínculo de **Evidência** (`action: provide_evidence`, `auth: email`).
   - Um vínculo de **Concordância** (`action: agree`, `role: contractor/witness`).
5. **Ativação**: O envelope deve ser movido para `status: running` via `finalizeEnvelope` **ANTES** das notificações.
6. **Notificação**: Disparo de avisos individuais via `sendNotification`.
7. **Webhook**: Clicksign envia POST para `/api/webhooks/clicksign`. Quando `event: "closed"`, o contrato é marcado como assinado e gatilhos (Conta Azul/Asaas) são disparados.

## 🔗 Vinculação de Contrato Existente (Bypass Mode)
Quando o campo `ID DO DOCUMENTO CLICKSIGN` é preenchido no formulário de contrato, **todo o fluxo de geração de documentos e envio ao Clicksign é pulado**. O sistema:

1. **Não** copia o modelo no Google Drive.
2. **Não** gera um novo Envelope/Documento no Clicksign.
3. **Consulta** o status do documento/envelope pelo ID fornecido:
   - Tenta primeiro como **Envelope (API v3)** via `getEnvelope(id)`.
   - Se falhar, tenta como **Documento (API v1)** via `getDocumentStatusV1(key)`.
4. **Detecta assinatura completa** se o status retornado for `closed`, `completed` ou `document_closed`.
5. **Salva** o ID fornecido no campo `document_id` do banco de dados e a flag `signed` com o status correto.

> **Regra:** Este fluxo é idêntico para **todos os tipos de contrato** (Seed, Impulse, Bomma), pois o bypass ocorre no helper genérico `handleContractSubmit`.

## 🛠️ Implementação Técnica
- **Serviço**: `apps/api/src/services/clickSignService.ts`
- **Controlador**: `apps/api/src/controllers/contractAutomationController.ts`
- **API v3**: JSON:API Standard — Autenticação: Header `Authorization: {token}` + `Content-Type: application/vnd.api+json`.
- **API v1** (fallback): REST padrão — Autenticação: query param `access_token={token}`.
- **Sandbox**: `https://sandbox.clicksign.com/api/v3` (v3) / `https://sandbox.clicksign.com/api/v1` (v1)

## 🔐 Variáveis de Ambiente
- `CLICKSIGN_API_TOKEN`: Token de acesso à conta (usado tanto no v3 Header quanto no v1 access_token).
- `CLICKSIGN_API_URL`: URL base da API (ex: `https://sandbox.clicksign.com/api/v1`). O serviço deriva automaticamente a URL v3.

## ⚠️ Regras Importantes
- **CPF Masking**: A API v3 desta conta exige CPFs com pontos e traços. O serviço faz isso automaticamente.
- **Bulk Requirements**: Sem os dois requisitos por signatário, o envelope não ativa (Erro 422).
- **Atrasos**: Não há necessidade de `sleep` entre passos se a ordem (Signatários -> Requirements -> Running) for respeitada.

## 🔍 Detecção de Assinatura (v3 — Lógica de Requisitos)
Na API v3, um signatário **não assina o documento diretamente**; ele cumpre **requisitos** dentro do envelope.

- **Signatário (Signer):** A pessoa (ex: cliente, testemunha).
- **Requisito (Requirement):** A ação que ela deve tomar (`agree`, `provide_evidence`).
- **Status de Assinatura:** Um signatário é considerado como tendo assinado quando **todos os seus requisitos estão modificados** (campo `modified` diferente de `created`) ou com status `completed`.

### Endpoints Utilizados
- `GET /envelopes/{id}/signers` → Lista os signatários do envelope.
- `GET /envelopes/{id}/requirements?include=signer` → Lista os requisitos com seus status.

### Lógica no Backend (`syncContractStatus` e `getContractSigners`)
```
SignerMap { signerId → signed: boolean }
Para cada requirement:
  se modified != created ou status == 'completed' → signed = true
Contagem: signed_count = SignerMap.values().filter(v => v).length
```

## 🔵 Endpoint: Detalhes de Signatários
- **Rota:** `GET /contracts/:id/signers`
- **Handler:** `getContractSigners` em `contractController.ts`
- **Retorno:** `{ success: boolean, signers: [{name, email, signed}] }`
- **Frontend:** Usado pelo componente `SignersModal.vue` para exibir o status individual de cada signatário.

## 🗑️ Exclusão de Envelope (Delete Contract)
Quando um contrato é **excluído** via `DELETE /contracts/:id`:
1. O sistema chama `ClickSignService.cancelDocument(clicksignId)` (**envelope_id primeiro, depois document_id** como fallback).
2. O método tenta cancelar via `PATCH /envelopes/{id}/cancel` (v3), depois via `PATCH /envelopes/{id}` com `{status: canceled}`, e por último via v1.
3. **Falhas são ignoradas** (apenas logadas) para não bloquear a remoção do banco de dados.

## 📡 Webhook e Assinatura
- **Endpoint:** `apps/api/src/routes/index.ts` → `/api/webhooks/clicksign`.
- **Controlador:** `apps/api/src/controllers/webhookController.ts`.
- **Banco de Dados:** O campo `document_id` na tabela `contracts` é a chave única para identificar o documento no webhook.
- **Fluxo de Conclusão:** Evento `closed`, `auto_close`, `close` ou `document_closed` → `signed: true` → `signed_date: now()` → Gatilho Externo.
