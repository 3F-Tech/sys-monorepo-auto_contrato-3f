---
name: contract-form
description: Guia definitivo para criação de formulários de contrato premium, seguindo o padrão de página única e design "Dark Tech".
---

# Skill: Geração de Formulários de Contrato Premium

Esta skill define o padrão de ouro para a criação de componentes de formulário de contrato no projeto.

## 🏗️ Estrutura do Componente
Todo formulário deve ser criado como um componente único em `apps/web/src/views/contracts/steps/`.

### 1. Boilerplate Base
```vue
<script setup lang="ts">
// Não importar vMaska (já é global)
import { Building2, MapPin, User, DollarSign, FileText } from 'lucide-vue-next';

defineProps({
  form: { type: Object, required: true }
});
</script>

<template>
  <div class="space-y-12 pb-20">
     <!-- Seções aqui -->
  </div>
</template>
```

## 🎨 Padrão Visual e UX
Siga estas regras estritamente para manter a consistência:

1. **Página Única:** Coloque todo o formulário em um único componente, não divida em etapas extras.
2. **Seções com Ícones:** 
   - Use um header com ícone Lucide dentro de um `bg-brand-cyan/10`.
   - Título em `text-sm font-black uppercase tracking-[0.2em]`.
   - Divisor `border-b border-brand-glass-border`.
3. **Labels e Inputs:**
   - Labels sempre em **MAIÚSCULO** e sem dashes (ex: "RAZÃO SOCIAL DO CONTRATANTE").
   - Use `text-[10px] font-bold text-white/40 uppercase tracking-widest`.
   - Inputs com a classe `.input-glass`.
4. **Máscaras de Campo (Obrigatórias):**
   - **CPF:** `v-maska="'###.###.###-##'"`
   - **CNPJ:** `v-maska="'##.###.###/####-##'"`
   - **CEP:** `v-maska="'#####-###'"`
   - **Datas:** `v-maska="'##/##/####'"`
   - **Moeda (R$):** Use o formato decimal invertido conforme o exemplo do `ImpulsePlano1.vue`.

## 🔄 Variáveis e Dados
- As chaves do objeto `form` devem ser EXATAMENTE iguais aos rótulos em maiúsculo (ex: `form['CNPJ DO CONTRATANTE']`).
- Se um campo se repetir no contrato original, use apenas uma vez no formulário.

## 🚀 Integração
Adicione o componente ao `activeFormComponent` no `ContractFlow.vue` usando a lógica de `buName.includes()` e `templateName.includes()`.
