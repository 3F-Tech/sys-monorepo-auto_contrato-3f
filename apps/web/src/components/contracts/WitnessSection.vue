<template>
  <div class="space-y-8">
    <div v-for="i in count" :key="i" class="space-y-6 pt-6 border-t border-brand-glass-border first:border-t-0 first:pt-0">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <UserIcon class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Testemunha {{ i }}</h3>
        
        <!-- Shortcuts -->
        <div class="flex gap-2 ml-auto">
          <button @click="fillWitness(i, 'Luís Fernando Mauri Menti', '023.275.400-46')" type="button" 
            class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Luís</button>
          <button @click="fillWitness(i, 'Natália Selister Piccoli', '013.266.710-06')" type="button" 
            class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Natália</button>
          <button @click="fillWitness(i, 'Erika', '')" type="button" 
            class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Erika</button>
          <button v-if="i > 1" @click="removeWitness(i)" type="button"
            class="p-1 px-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <Trash2 class="h-3 w-3" />
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DA TESTEMUNHA</label>
          <input type="text" :id="'NOME TESTEMUNHA ' + i" v-model="form['NOME TESTEMUNHA ' + i]" 
            class="input-glass w-full" placeholder="NOME COMPLETO" 
            :class="[errors && errors['NOME TESTEMUNHA ' + i] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['NOME TESTEMUNHA ' + i]" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME TESTEMUNHA ' + i] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA TESTEMUNHA</label>
          <input type="text" :id="'CPF TESTEMUNHA ' + i" v-model="form['CPF TESTEMUNHA ' + i]" v-maska="'###.###.###-##'" 
            class="input-glass w-full" placeholder="000.000.000-00" 
            :class="[errors && errors['CPF TESTEMUNHA ' + i] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CPF TESTEMUNHA ' + i]" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF TESTEMUNHA ' + i] }}</span>
        </div>
      </div>
    </div>

    <!-- Add Witness Button -->
    <button v-if="count < 6" @click="count++" type="button" 
      class="w-full py-4 border-2 border-dashed border-brand-glass-border rounded-2xl text-white/20 hover:text-brand-cyan hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all group flex flex-col items-center justify-center gap-2">
      <div class="p-2 rounded-xl bg-white/5 group-hover:bg-brand-cyan/10 transition-colors">
        <Plus class="h-5 w-5" />
      </div>
      <span class="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Nova Testemunha</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { User as UserIcon, Plus, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

const count = ref(1);

onMounted(() => {
  // Inicializa o contador baseado no maior índice de testemunha preenchida
  for (let i = 6; i >= 1; i--) {
    if (props.form[`NOME TESTEMUNHA ${i}`] || props.form[`CPF TESTEMUNHA ${i}`]) {
      count.value = i;
      break;
    }
  }
});

const fillWitness = (index: number, name: string, cpf: string) => {
  props.form[`NOME TESTEMUNHA ${index}`] = name;
  props.form[`CPF TESTEMUNHA ${index}`] = cpf;
};

const removeWitness = (index: number) => {
  props.form[`NOME TESTEMUNHA ${index}`] = '';
  props.form[`CPF TESTEMUNHA ${index}`] = '';
  count.value--;
};
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
}
</style>
