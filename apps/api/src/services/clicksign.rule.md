# Integração Clicksign (Assinatura Digital)

## 🎯 Objetivo
Este módulo gerencia a integração com a API do Clicksign para envio de contratos para assinatura e acompanhamento de status.

## 🔄 Fluxo de Integração (Fase 1)
1. **Exportação**: Após a geração do Google Doc, o backend chama `GoogleDriveService.exportFileToPDF`.
2. **Upload**: O conteúdo Base64 é enviado para o Clicksign via `ClickSignService.createDocument`.
3. **Signatários**: Os signatários (Vendedor, Cliente, Testemunhas) são adicionados via `addSigner`.
4. **Notificação**: E-mails de solicitação de assinatura são disparados via `sendSignatureRequests`.

## 🛠️ Implementação Técnica
- **Serviço**: `apps/api/src/services/clickSignService.ts`
- **API**: v3 (Standard JSON:API)
- **Autenticação**: Via Query Param `access_token` e Headers `Authorization`.
- **Sandbox**: `https://sandbox.clicksign.com/api/v1`

## 🔐 Variáveis de Ambiente
- `CLICKSIGN_API_TOKEN`: Token de acesso à conta.
- `CLICKSIGN_API_URL`: URL base da API (Sandbox vs Produção).

## ⚠️ Regras Importantes
- **Base64**: O conteúdo enviado deve incluir o prefixo `data:application/pdf;base64,`.
- **Deadline**: Por padrão, os documentos expiram em 30 dias após a criação.
