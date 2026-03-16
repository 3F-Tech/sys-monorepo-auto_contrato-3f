---
description: Como adicionar um novo modelo de contrato ao sistema e conectar ao Google Sheets
---

Este guia descreve os passos necessários para adicionar um novo modelo de contrato, desde a interface até a integração com a planilha.

### 1. Preparação da Planilha
1. Abra a planilha central de contratos.
2. Crie uma nova aba com o nome do contrato (ex: `Plano 3 - Impulse`).
3. Garanta que as colunas sigam o padrão (A até Y) para que o mapeamento automático funcione.
4. **IMPORTANTE**: Certifique-se de que a planilha está compartilhada com o e-mail da conta de serviço:
   `conta-antigravity@sharp-messenger-475111-k4.iam.gserviceaccount.com`

### 2. Frontend: Criar o Formulário
1. Crie um novo arquivo em `apps/web/src/views/contracts/steps/` (ex: `NovoContrato.vue`).
2. Utilize o padrão do `ImpulsePlano1.vue`, importando o composable `useCep` para o auto-preenchimento.
3. Certifique-se de usar `v-model:form` para sincronizar os dados com o componente pai.

### 3. Frontend: Registrar o Modelo
No arquivo `apps/web/src/views/contracts/ContractFlow.vue`:
1. Importe o novo componente.
2. Adicione o nome do template no objeto `templatesByBU`.
3. Atualize a computed `activeFormComponent` para renderizar o novo componente.
4. Atualize a computed `activeEndpoint` para definir a rota da API (ex: `/contracts/novo-contrato`).

### 4. Backend: Criar o Controller
No arquivo `apps/api/src/controllers/contractSheetsController.ts`:
1. Adicione uma nova exportação usando o helper `handleContractSubmit`:
   ```typescript
   export const submitNovoContrato = (req: Request, res: Response) => 
       handleContractSubmit(req, res, 'Nome Exato da Aba na Planilha');
   ```
   *Nota: O sistema detecta automaticamente se o nome contém "Growth" para ajustar o número de colunas.*

### 5. Backend: Registrar a Rota
No arquivo `apps/api/src/routes/index.ts`:
1. Importe a nova função do controller.
2. Registre a rota POST:
   ```typescript
   router.post('/contracts/novo-contrato', submitNovoContrato);
   ```

### 6. Verificação
1. Teste o preenchimento do CEP.
2. Clique em "Finalizar" e verifique se a linha foi adicionada na aba correta da planilha.
