# Plano: Gestão Dinâmica de Testemunhas e Padrões por BU

## Objetivo
Implementar a funcionalidade de adicionar múltiplas testemunhas nos contratos e configurar preenchimento automático (defaults) baseado na Unidade de Negócio (BU) selecionada.

## Mudanças Necessárias

### 1. Estrutura de Dados (ContractFlow.vue)
- [ ] Atualizar `initialData` para suportar uma lista dinâmica de testemunhas (array de objetos) ou chaves sequenciais (`NOME TESTEMUNHA 2`, etc).
- [ ] Implementar lógica de preenchimento automático no `handleTemplateSelect` baseada no nome da BU:
    - **Bomma**: Luis Fernando (Testemunha 1) .
    - **Impulse**: Natália (Testemunha 1).
    - **Seed**: Erika (Testemunha 1) e Natália (Testemunha 2).

### 2. Componentes de Formulário (Passos dos Planos)
- [ ] Refatorar a seção de testemunhas nos arquivos `SeedPlano*.vue`, `ImpulsePlano*.vue` e `BommaPlano*.vue`.
- [ ] Adicionar botão "Adicionar Testemunha" para permitir inserção dinâmica.
- [ ] Garantir que os campos criados dinamicamente sejam validados corretamente.

### 3. Validação e Backend
- [ ] Atualizar `contractValidations.ts` para validar campos dinâmicos de testemunhas.
- [ ] Garantir que o `contractSheetsController.ts` no backend consiga processar e enviar N testemunhas para as planilhas do Google.

## Tarefas de Implementação

- [x] Task 1: Mapear constantes de padrões (Witness Defaults) por BU em um novo utilitário. → Verify: Objeto exportado com Bomma e Impulse configurados.
- [x] Task 2: Modificar `ContractFlow.vue` para injetar os padrões no `contractData` ao trocar de BU/Template. → Verify: Ao selecionar Bomma, os campos de testemunha aparecem pré-preenchidos.
- [x] Task 3: Criar componente `WitnessSection.vue` (ou refatorar seções existentes) para suportar lista dinâmica (v-for). → Verify: Botão "+" adiciona novo par de campos (Nome/CPF).
- [x] Task 4: Atualizar todos os 5 componentes de etapa (`Plano*.vue`) para usar a nova lógica de testemunhas. → Verify: Todos os formulários suportam múltiplas testemunhas.

## Concluído Quando
- [x] O usuário seleciona **Bomma** e Luis aparece como testemunha padrão.
- [x] O usuário seleciona **Impulse** e Natália aparece como testemunha padrão.
- [x] O usuário seleciona **Seed** e Erika e Natália aparecem como testemunhas padrão.
- [x] É possível adicionar manualmente mais de uma testemunha em qualquer contrato.
- [x] Os dados de todas as testemunhas são enviados corretamente para o backend.

