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
   - Atualize a computed `activeEndpoint` para definir a rota da API (ex: `/contracts/novo-contrato`).

### 4. Backend: Criar Schema de Validação
No arquivo `apps/api/src/schemas/contractSubmissionSchema.ts`:
1. Defina um novo schema Zod para o contrato (ex: `novoContratoSchema`).
2. Adicione-o ao objeto `contractSchemas`.

### 5. Backend: Criar o Controller e Rota
No arquivo `apps/api/src/controllers/contractSheetsController.ts`:
1. Adicione uma nova exportação:
   ```typescript
   export const submitNovoContrato = (req: Request, res: Response) => 
       handleContractSubmit(req, res, 'Nome Exato da Aba na Planilha', 'novoContratoSchema');
   ```

No arquivo `apps/api/src/routes/index.ts`:
1. Registre a rota POST: `router.post('/contracts/novo-contrato', submitNovoContrato);`

### 6. Verificação
1. Teste o preenchimento do CEP.
2. Tente enviar campos vazios ou formatos inválidos (CNPJ/CPF) para garantir que as mensagens de erro apareçam.
3. Verifique se a linha foi adicionada na aba correta da planilha após sucesso.
