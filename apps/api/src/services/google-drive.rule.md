# Integração Google Drive (Contratos Modelos)

## 🎯 Objetivo
Este módulo gerencia o acesso aos modelos de contrato e a criação de novas instâncias de documentos no Google Drive quando um formulário é submetido.

## 📂 Estrutura de Pastas (IDs Oficiais)

### 🏗️ Raiz de Modelos (CONTRATOS MODELO)
- **ID:** `1ssgskmnpgXXP34nWgiplWpch6YKab40M`

### 🏢 Subpastas por Unidade (BUs)
- **SEED:** `1zax_6rn4rkUXyiWzNNhiVIOgTxncpjQV`
- **IMPULSE:** `1Dt9x0iDsKWc4LA6iCh9h2_Ywj0R2gCK_`
- **BOMMA:** `1NkfGzmFXkpRsDl2RIwGszvip4vwTm7Nq`

### 📥 Destino dos Contratos Gerados
- **ID:** `1KF4W-RQ3CAJj4KFAAX9K9cxdRW9u6phg`
- **Regra:** Todo novo contrato criado a partir de um modelo deve ser copiado para esta pasta. Que também tem as subpastas por BU.
- **SEED:** `1zymZvOkAOgdnfz5s9m7FnMELDneTIIwF`
- **IMPULSE:** `1E2zHJstMemuUhvB-9u7AY83ioYy8Ic3H`
- **BOMMA:** `1oChogkEyQpZMZzFMPjOEuz_Dt542JRUW`

## 🔄 Fluxo de Automação
1. **Trigger:** O vendedor envia o formulário no frontend.
2. **Backend (Services):**
   - O `GoogleDriveService.ts` localiza o arquivo modelo na pasta da BU correspondente.
   - Realiza uma cópia do modelo utilizando `drive.files.copy`.
   - O novo arquivo é renomeado seguindo o padrão: `{{ Razão Social }} & {{ Nome da BU }} ({{ Plano }})`.
   - O parent ID da cópia deve ser obrigatoriamente a pasta de destino citada acima.
3. **Persistência:** O ID do novo arquivo gerado deve ser salvo na tabela `contracts`, no campo `link`.

## 🔐 Permissões
- A conta de serviço `conta-antigravity@sharp-messenger-475111-k4.iam.gserviceaccount.com` deve ter permissão de **Leitor** nas pastas de modelos e **Editor** na pasta de destino.

## 🛠️ Implementação Técnica
- Use o `GoogleDriveService.ts` para interações com a Drive API v3.
- **Exportação PDF**: O método `exportFileToPDF` deve ser usado para obter a versão não editável do contrato para o Clicksign.
- Scopes necessários: `drive.file`, `drive.readonly` (para modelos) e `drive` (para criação e exportação).
