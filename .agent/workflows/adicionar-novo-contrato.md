---
description: Como adicionar um novo modelo de contrato ao sistema e conectar ao Google Drive/Docs
---

Este guia descreve os passos necessários para adicionar um novo modelo de contrato, desde a interface até a automação de documentos.

### 1. Preparação do Modelo (Google Docs)
1. Garanta que o modelo no Google Docs utilize variáveis no formato `{{VAR-NOME}}`.
2. O arquivo deve estar em uma pasta acessível pela conta de serviço:
   `conta-antigravity@sharp-messenger-475111-k4.iam.gserviceaccount.com`
3. Identifique o ID do arquivo (na URL do Docs).

### 2. Frontend: Criar o Formulário
1. Crie um novo arquivo em `apps/web/src/views/contracts/steps/` (ex: `NovoContrato.vue`).
2. Utilize o padrão do `ImpulsePlano1.vue`, importando o composable `useCep` para o auto-preenchimento.
3. **Validação Visual**: 
   - Adicione o prop `errors: { type: Object, default: () => ({}) }`.
   - Aplique a classe condicional `:class="{ '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5': errors && errors['NOME_DO_CAMPO'] }"` nos inputs.
   - Exiba a mensagem de erro: `<span v-if="errors && errors['NOME_DO_CAMPO']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME_DO_CAMPO'] }}</span>`.
4. Certifique-se de usar `v-model:form` para sincronizar os dados com o componente pai.

### 3. Frontend: Registrar o Modelo e Validações
1. No arquivo `apps/web/src/utils/contractValidations.ts`:
   - Adicione as regras de validação no objeto retornado por `getValidationRules()`.
2. No arquivo `apps/web/src/views/contracts/ContractFlow.vue`:
   - Importe o novo componente.
   - Adicione o nome do template no objeto `templatesByBU`.
   - Atualize a computed `activeFormComponent` para renderizar o novo componente.
   - Atualize a computed `activeEndpoint` para definir a rota da API (ex: `/contracts-sheets/novo-contrato`).

### 4. Backend: Criar Schema de Validação
No arquivo `apps/api/src/schemas/contractSubmissionSchema.ts`:
1. Certifique-se de que todos os campos utilizados no formulário estão cobertos pelo `contractDataSchema`.

### 5. Backend: Criar o Controller e Rota
No arquivo `apps/api/src/controllers/contractAutomationController.ts`:
1. Adicione o novo `MODEL_ID` no objeto `MODEL_IDS`.
2. Adicione uma nova exportação se necessário, ou use o padrão `handleContractSubmit`:
   ```typescript
   export const submitNovoContrato = (req: Request, res: Response) => 
       handleContractSubmit(req, res, 'nome-do-modelo');
   ```

No arquivo `apps/api/src/routes/index.ts`:
1. Registre a rota POST: `router.post('/contracts-sheets/novo-contrato', submitNovoContrato);`

### 6. Verificação
1. Execute `pnpm run codegen` para gerar os tipos e hooks do frontend.
2. Teste o preenchimento no frontend.
3. Verifique se o link do Google Docs foi gerado e salvo corretamente no banco de dados.
4. Confirme no Google Drive se o arquivo foi criado na pasta da BU correspondente.