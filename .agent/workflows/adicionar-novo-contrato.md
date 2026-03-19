---
description: Como adicionar um novo modelo de contrato ao sistema e conectar ao Google Drive/Docs
---

Este guia descreve os passos necessários para adicionar um novo modelo de contrato, desde a interface até a automação de documentos.

### 1. Preparação do Modelo (Google Docs)
1. Garanta que o modelo no Google Docs utilize variáveis no formato `{{VAR-NOME}}`.
2. O arquivo deve estar em uma pasta acessível pela conta de serviço:
   `conta-antigravity@sharp-messenger-475111-k4.iam.gserviceaccount.com`
3. Identifique o ID do arquivo (na URL do Docs).

### 2. Frontend: Criar o Formulário (Padrão Premium)
1. Crie um novo arquivo em `apps/web/src/views/contracts/steps/` (ex: `NovoContrato.vue`).
2. **Campos Obrigatórios**: Todo contrato **DEVE** ter os inputs de Nome, E-mail e CPF do Representante Legal.
   - O campo `EMAIL DO REPRESENTANTE` é obrigatório para persistência no banco, embora não seja enviado ao Google Docs.
3. **Componentes Padrão**: 
   - Utilize o componente `<WitnessSection :form="form" :errors="errors" />` para a seção de testemunhas.
   - Use o composable `useCep` para auto-preenchimento de endereços.
4. **Layout e Design**:
   - Utilize ícones da biblioteca `lucide-vue-next`.
   - Agrupe campos em seções (`DADOS DA EMPRESA`, `REPRESENTANTE LEGAL`, `VALORES E PAGAMENTO`, etc.) com bordas e títulos em uppercase.
5. **Validação Visual**: 
   - Adicione o prop `errors: { type: Object, default: () => ({}) }`.
   - Aplique a classe condicional `:class="[errors && errors['NOME_DO_CAMPO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']"` nos inputs.
   - Exiba a mensagem de erro: `<span v-if="errors && errors['NOME_DO_CAMPO']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME_DO_CAMPO'] }}</span>`.
6. Certifique-se de usar `v-model:form` para sincronizar os dados com o componente pai.

### 3. Frontend: Registrar o Modelo e Validações
1. No arquivo `apps/web/src/utils/contractValidations.ts`:
   - Adicione as regras de validação no objeto retornado por `getValidationRules()`.
   - **Importante**: Adicione a validação de e-mail: `check('EMAIL DO REPRESENTANTE', validateRequired(data['EMAIL DO REPRESENTANTE'], 'E-mail do representante'));`.
2. No arquivo `apps/web/src/views/contracts/ContractFlow.vue`:
   - Importe o novo componente.
   - Inicialize o campo no `initialData`: `'EMAIL DO REPRESENTANTE': ''`.
   - Adicione o nome do template no objeto `templatesByBU`.
   - Atualize a computed `activeFormComponent` para renderizar o novo componente.
   - Atualize a computed `activeEndpoint` para definir a rota da API.

### 4. Backend: Criar Schema de Validação
No arquivo `apps/api/src/schemas/contractSubmissionSchema.ts`:
1. Adicione o campo ao schema Zod: `'EMAIL DO REPRESENTANTE': z.string().email("E-mail do representante obrigatório")`.

### 5. Backend: Controller e Banco de Dados
No arquivo `apps/api/src/controllers/contractAutomationController.ts`:
1. Mapeie o e-mail no Prisma `create`: `legal_repre_email: data['EMAIL DO REPRESENTANTE']`.
2. Adicione uma trava no loop de `replacements` para NÃO enviar o e-mail ao Google Docs:
   ```typescript
   if (key === 'EMAIL DO REPRESENTANTE') continue;
   ```
3. Registre o `MODEL_ID` e a rota no `routes/index.ts`.

### 6. Verificação
1. Execute `powershell -ExecutionPolicy Bypass -Command "npx prisma generate --schema=apps/api/prisma/schema.prisma"` para atualizar os tipos.
2. Verifique se o e-mail do representante é salvo no banco mas não aparece no documento gerado.
