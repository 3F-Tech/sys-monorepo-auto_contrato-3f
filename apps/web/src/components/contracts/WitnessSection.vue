<template>
  <div class="space-y-8">
    <!-- Seção: Signatários Fixos -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Signatários da {{ buName }}
          (Contratada/Testemunhas)</h3>
      </div>

      <!-- Bloco: Contratada -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DA CONTRATADA</label>
          <input type="text" :value="fixedSignatories.contracted.name" class="input-glass w-full cursor-not-allowed"
            readonly>
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL DA CONTRATADA</label>
          <input type="text" :value="fixedSignatories.contracted.email" class="input-glass w-full cursor-not-allowed"
            readonly>
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA CONTRATADA</label>
          <input type="text" :value="fixedSignatories.contracted.cpf" class="input-glass w-full cursor-not-allowed"
            readonly>
        </div>
      </div>

      <!-- Bloco: Testemunhas Fixas -->
      <template v-for="(witness, idx) in fixedSignatories.witnesses" :key="idx">
        <div class="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 opacity-60 text-brand-cyan">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">TESTEMUNHA {{ idx + 1 }}
              (FIXA)</label>
            <input type="text" :value="witness.name" class="input-glass w-full cursor-not-allowed !border-brand-cyan/20"
              readonly>
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL TESTEMUNHA {{ idx + 1
            }}</label>
            <input type="text" :value="witness.email" class="input-glass w-full cursor-not-allowed" readonly>
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF TESTEMUNHA {{ idx + 1
            }}</label>
            <input type="text" :value="witness.cpf" class="input-glass w-full cursor-not-allowed" readonly>
          </div>
        </div>
      </template>

      <!-- Bloco: Vendedor -->
      <div class="pt-6 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">TESTEMUNHA {{
            fixedSignatories.witnesses.length + 1 }} (VENDEDOR)</label>
          <input type="text" id="NOME VENDEDOR" :value="form['NOME VENDEDOR']" class="input-glass w-full cursor-not-allowed" readonly>
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL TESTEMUNHA {{
            fixedSignatories.witnesses.length + 1 }}</label>
          <input type="text" id="EMAIL VENDEDOR" :value="form['EMAIL VENDEDOR']" class="input-glass w-full cursor-not-allowed" readonly>
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF TESTEMUNHA {{
            fixedSignatories.witnesses.length + 1 }}</label>
          <input type="text" id="CPF VENDEDOR" :value="form['CPF VENDEDOR']" class="input-glass w-full cursor-not-allowed" readonly>
        </div>
      </div>
    </div>

    <!-- Seção: Testemunhas Adicionais -->
    <div class="space-y-6 pt-6 border-t border-brand-glass-border">
      <div v-for="i in count" :key="i"
        class="space-y-6 pt-6 border-t border-brand-glass-border first:border-t-0 first:pt-0">
        <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
          <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
            <UserIcon class="h-5 w-5" />
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Testemunha Adicional {{ i }} (Cliente)
          </h3>

          <div class="flex gap-2 ml-auto">
            <button v-if="count > 0" @click="removeWitness(i)" type="button"
              class="p-1 px-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
              <Trash2 class="h-3 w-3" />
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DA TESTEMUNHA</label>
            <input type="text" :id="'NOME TESTEMUNHA ' + i" v-model="form['NOME TESTEMUNHA ' + i]"
              class="input-glass w-full" placeholder="NOME COMPLETO"
              :class="[errors && errors['NOME TESTEMUNHA ' + i] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['NOME TESTEMUNHA ' + i]"
              role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">{{
                errors['NOME TESTEMUNHA ' + i] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL DA TESTEMUNHA</label>
            <input type="email" :id="'EMAIL TESTEMUNHA ' + i" v-model="form['EMAIL TESTEMUNHA ' + i]"
              class="input-glass w-full" placeholder="email@exemplo.com"
              :class="[errors && errors['EMAIL TESTEMUNHA ' + i] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['EMAIL TESTEMUNHA ' + i]"
              role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">{{
                errors['EMAIL TESTEMUNHA ' + i] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA TESTEMUNHA</label>
            <input type="text" :id="'CPF TESTEMUNHA ' + i" v-model="form['CPF TESTEMUNHA ' + i]"
              v-maska="'###.###.###-##'" class="input-glass w-full" placeholder="000.000.000-00"
              :class="[errors && errors['CPF TESTEMUNHA ' + i] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['CPF TESTEMUNHA ' + i]" 
              role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">{{
              errors['CPF TESTEMUNHA ' + i] }}</span>
          </div>
        </div>
      </div>

      <!-- Add Witness Button -->
      <button v-if="count < 6" @click="count++" type="button"
        class="w-full py-4 border-2 border-dashed border-brand-glass-border rounded-2xl text-white/20 hover:text-brand-cyan hover:border-brand-cyan/40 hover:bg-brand-cyan/5 transition-all group flex flex-col items-center justify-center gap-2">
        <div class="p-2 rounded-xl bg-white/5 group-hover:bg-brand-cyan/10 transition-colors">
          <Plus class="h-5 w-5" />
        </div>
        <span class="text-[10px] font-black uppercase tracking-[0.2em]">Adicionar Testemunha do Cliente</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { User as UserIcon, Plus, Trash2, ShieldCheck } from 'lucide-vue-next';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  buName: {
    type: String,
    default: ''
  }
});

const PEOPLE = {
  LETI: { name: 'Letícia Viviane Scariot', email: 'leticia@bommamkt.com.br', cpf: '025.189.220-40' },
  ERIKA: { name: 'Erika Christina Lara', email: 'erika@seedagromarketing.com.br', cpf: '350.251.648-00' },
  NATI: { name: 'Natália Selister Piccoli', email: 'natalia@bommamkt.com.br', cpf: '013.266.710-06' },
  LUIS: { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@3fventure.com.br', cpf: '023.275.400-46' }
};

const count = ref(0);

const fixedSignatories = computed(() => {
  const bu = props.buName.toLowerCase();
  if (bu.includes('bomma')) {
    return {
      contracted: PEOPLE.NATI,
      witnesses: [PEOPLE.LUIS, PEOPLE.LETI]
    };
  }
  if (bu.includes('seed')) {
    return {
      contracted: PEOPLE.LUIS,
      witnesses: [PEOPLE.NATI, PEOPLE.ERIKA]
    };
  }
  // Impulse
  return {
    contracted: PEOPLE.LUIS,
    witnesses: [PEOPLE.NATI]
  };
})

const extraWitnessStartIdx = 0; // Starts at 1 for adicionales

// Update form with fixed data
const updateFixedData = () => {
  const sigs = fixedSignatories.value;
  const isDebug = props.form['isDebug'];

  const getEmail = (originalEmail: string) => {
    if (!isDebug) return originalEmail;
    // Lista de e-mails específicos que devem receber +test
    const targetEmails = [
      'luisfernando@3fventure.com.br',
      'natalia@bommamkt.com.br',
      'leticia@bommamkt.com.br',
      'erika@seedagromarketing.com.br'
    ];
    
    if (targetEmails.includes(originalEmail.toLowerCase())) {
      return originalEmail.replace('@', '+test@');
    }
    return originalEmail;
  };

  // Fill Fixed Witnesses
  sigs.witnesses.forEach((w, i) => {
    props.form[`NOME TESTEMUNHA FIXA ${i + 1}`] = w.name;
    props.form[`EMAIL TESTEMUNHA FIXA ${i + 1}`] = getEmail(w.email);
    props.form[`CPF TESTEMUNHA FIXA ${i + 1}`] = w.cpf;
  });

  // Seller/Contracted representative
  props.form[`NOME TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = props.form['NOME VENDEDOR'] || '';
  props.form[`EMAIL TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = getEmail(props.form['EMAIL VENDEDOR'] || '');
  props.form[`CPF TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = props.form['CPF VENDEDOR'] || '';
};

watch(() => props.buName, updateFixedData, { immediate: true });
watch(() => props.form['NOME VENDEDOR'], updateFixedData);
watch(() => props.form['CPF VENDEDOR'], updateFixedData);

onMounted(() => {
  // Check if there are already extra witnesses filled (1 to 6)
  for (let i = 6; i >= 1; i--) {
    if (props.form[`NOME TESTEMUNHA ${i}`] || props.form[`CPF TESTEMUNHA ${i}`]) {
      count.value = i;
      break;
    }
  }
});

const removeWitness = (i: number) => {
  props.form[`NOME TESTEMUNHA ${i}`] = '';
  props.form[`EMAIL TESTEMUNHA ${i}`] = '';
  props.form[`CPF TESTEMUNHA ${i}`] = '';
  count.value--;
};
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
}
</style>
