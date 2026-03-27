<template>
  <div class="space-y-12 pb-20">
    <!-- Seção: DOCUMENTO EXISTENTE (CLICKSIGN) -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Info class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Documento Clicksign (Opcional)</h3>
      </div>

      <div class="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/20 flex gap-4 items-start">
        <Info class="h-5 w-5 text-brand-cyan shrink-0 mt-0.5" />
        <p class="text-[13px] text-white/80 leading-relaxed">
          <strong class="text-brand-cyan">Atenção:</strong> Preencha este campo <strong
            class="text-white">APENAS</strong> se o contrato já existir e tiver sido enviado no Clicksign. Se informado,
          o sistema não criará um novo documento no Drive, apenas fará o vínculo e a checagem de assinaturas.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="md:col-span-1 space-y-2">
          <label class="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">ID DO DOCUMENTO
            CLICKSIGN</label>
          <input type="text" id="ID DO DOCUMENTO CLICKSIGN" v-model="form['ID DO DOCUMENTO CLICKSIGN']"
            class="input-glass w-full border-brand-cyan/20 focus:border-brand-cyan" placeholder="Ex: e619b024-..."
            :class="[errors && errors['ID DO DOCUMENTO CLICKSIGN'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['ID DO DOCUMENTO CLICKSIGN']"
            role="alert"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['ID DO DOCUMENTO CLICKSIGN'] }}</span>
        </div>

        <!-- Datas de Importação (Aparecem apenas se houver ID Clicksign) -->
        <div v-if="form['ID DO DOCUMENTO CLICKSIGN']" class="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-brand-cyan/10">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Data de Criação (Sistema)</label>
            <input type="date" v-model="form['created_at']"
              class="input-glass w-full border-brand-cyan/20 focus:border-brand-cyan">
            <p class="text-[9px] text-white/40 italic">Opcional: Informe se o contrato for antigo/retroativo.</p>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-brand-cyan uppercase tracking-widest">Data de Assinatura (Sistema)</label>
            <input type="date" v-model="form['signed_date']"
              class="input-glass w-full border-brand-cyan/20 focus:border-brand-cyan">
            <p class="text-[9px] text-white/40 italic">Opcional: Caso o contrato já tenha sido assinado.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Seção: DADOS DA EMPRESA (CONTRATANTE) -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Building2 class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Dados da Empresa (Contratante)</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">RAZÃO SOCIAL DO
            CONTRATANTE</label>
          <input type="text" id="RAZAO SOCIAL DO CONTRATANTE" v-model="form['RAZAO SOCIAL DO CONTRATANTE']"
            class="input-glass w-full" placeholder="NOME COMPLETO DA EMPRESA"
            :class="[errors && errors['RAZAO SOCIAL DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['RAZAO SOCIAL DO CONTRATANTE']"
            role="alert"
            class="text-[9px] text-red-500 font-bold mt-1 block text-left">{{ errors['RAZAO SOCIAL DO CONTRATANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CNPJ OU CPF DO
            CONTRATANTE</label>
          <input type="text" id="CNPJ DO CONTRATANTE" v-model="form['CNPJ DO CONTRATANTE']"
            v-maska="{ mask: ['###.###.###-##', '##.###.###/####-##'] }" class="input-glass w-full"
            placeholder="00.000.000/0000-00"
            :class="[errors && errors['CNPJ DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CNPJ DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['CNPJ DO CONTRATANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: ENDEREÇO DA EMPRESA -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <MapPin class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Endereço da Empresa</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-3 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest italic"
            v-if="cepLoading">Buscando...</label>
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest" v-else>CEP DO CONTRATANTE</label>
          <input type="text" id="CEP DO CONTRATANTE" v-model="form['CEP DO CONTRATANTE']" v-maska="'#####-###'"
            class="input-glass w-full" placeholder="00000-000"
            :class="[errors && errors['CEP DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CEP DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['CEP DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-6 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">LOGRADOURO DO CONTRATANTE</label>
          <input type="text" id="LOGRADOURO DO CONTRATANTE" v-model="form['LOGRADOURO DO CONTRATANTE']"
            class="input-glass w-full" placeholder="RUA, AVENIDA, ETC"
            :class="[errors && errors['LOGRADOURO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['LOGRADOURO DO CONTRATANTE']"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['LOGRADOURO DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-3 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NÚMERO DO CONTRATANTE</label>
          <input type="text" id="NUMERO DO CONTRATANTE" v-model="form['NUMERO DO CONTRATANTE']"
            class="input-glass w-full" placeholder="123"
            :class="[errors && errors['NUMERO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['NUMERO DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['NUMERO DO CONTRATANTE'] }}</span>
        </div>

        <div class="md:col-span-5 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">BAIRRO DO CONTRATANTE</label>
          <input type="text" id="BAIRRO DO CONTRATANTE" v-model="form['BAIRRO DO CONTRATANTE']"
            class="input-glass w-full" placeholder="NOME DO BAIRRO"
            :class="[errors && errors['BAIRRO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['BAIRRO DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['BAIRRO DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-5 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CIDADE DO CONTRATANTE</label>
          <input type="text" id="CIDADE DO CONTRATANTE" v-model="form['CIDADE DO CONTRATANTE']"
            class="input-glass w-full" placeholder="CIDADE"
            :class="[errors && errors['CIDADE DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CIDADE DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['CIDADE DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-2 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">UF DO CONTRATANTE</label>
          <input type="text" id="UF DO CONTRATANTE" v-model="form['UF DO CONTRATANTE']" v-maska="'@@'"
            class="input-glass w-full uppercase" placeholder="SP"
            :class="[errors && errors['UF DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['UF DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['UF DO CONTRATANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: REPRESENTANTE LEGAL -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <UserIcon class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Representante Legal</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO REPRESENTANTE</label>
          <input type="text" id="NOME DO REPRESENTANTE" v-model="form['NOME DO REPRESENTANTE']"
            class="input-glass w-full" placeholder="NOME COMPLETO"
            :class="[errors && errors['NOME DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['NOME DO REPRESENTANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['NOME DO REPRESENTANTE'] }}</span>
          <span v-if="errors && errors['NOME DO REPRESENTANTE']"
            role="alert"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME DO REPRESENTANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL DO REPRESENTANTE</label>
          <input type="email" id="EMAIL DO REPRESENTANTE" v-model="form['EMAIL DO REPRESENTANTE']"
            class="input-glass w-full" placeholder="email@empresa.com"
            :class="[errors && errors['EMAIL DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['EMAIL DO REPRESENTANTE']"
            role="alert"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['EMAIL DO REPRESENTANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DO REPRESENTANTE</label>
          <input type="text" id="CPF DO REPRESENTANTE" v-model="form['CPF DO REPRESENTANTE']" v-maska="'###.###.###-##'"
            class="input-glass w-full" placeholder="000.000.000-00"
            :class="[errors && errors['CPF DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CPF DO REPRESENTANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['CPF DO REPRESENTANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: VALORES E PAGAMENTO -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <DollarSign class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Valores e Pagamento</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR TAXA IMPLEMENTAÇÃO</label>
          <div class="relative">
            <span
              class="absolute left-4 h-full flex items-center text-brand-cyan/40 text-xs font-bold pointer-events-none">R$</span>
            <input type="text" id="VALOR TAXA IMPLEMENTACAO" v-model="form['VALOR TAXA IMPLEMENTACAO']"
              v-maska="{ mask: '###.###.###,##', tokens: { '#': { pattern: /[0-9]/, repeated: true } }, reversed: true }"
              class="input-glass w-full !pl-10" placeholder="0,00"
              :class="[errors && errors['VALOR TAXA IMPLEMENTACAO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['VALOR TAXA IMPLEMENTACAO']"
              class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['VALOR TAXA IMPLEMENTACAO'] }}</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR MENSALIDADE</label>
          <div class="relative">
            <span
              class="absolute left-4 h-full flex items-center text-brand-cyan/40 text-xs font-bold pointer-events-none">R$</span>
            <input type="text" id="VALOR MENSALIDADE" v-model="form['VALOR MENSALIDADE']"
              v-maska="{ mask: '###.###.###,##', tokens: { '#': { pattern: /[0-9]/, repeated: true } }, reversed: true }"
              class="input-glass w-full !pl-10" placeholder="0,00"
              :class="[errors && errors['VALOR MENSALIDADE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['VALOR MENSALIDADE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
              errors['VALOR MENSALIDADE'] }}</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR DO PRIMEIRO
            PAGAMENTO</label>
          <div class="relative">
            <span
              class="absolute left-4 h-full flex items-center text-brand-cyan/40 text-xs font-bold pointer-events-none">R$</span>
            <input type="text" id="VALOR DO PRIMEIRO PAGAMENTO" v-model="form['VALOR DO PRIMEIRO PAGAMENTO']"
              v-maska="{ mask: '###.###.###,##', tokens: { '#': { pattern: /[0-9]/, repeated: true } }, reversed: true }"
              class="input-glass w-full !pl-10" placeholder="0,00"
              :class="[errors && errors['VALOR DO PRIMEIRO PAGAMENTO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['VALOR DO PRIMEIRO PAGAMENTO']"
              class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['VALOR DO PRIMEIRO PAGAMENTO'] }}</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA PRIMEIRO PAGAMENTO</label>
          <input type="text" id="DATA PRIMEIRO PAGAMENTO" v-model="form['DATA PRIMEIRO PAGAMENTO']"
            v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA"
            :class="[errors && errors['DATA PRIMEIRO PAGAMENTO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DATA PRIMEIRO PAGAMENTO']"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['DATA PRIMEIRO PAGAMENTO'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
          <input type="number" id="DIA VENCIMENTO MENSAL" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31"
            class="input-glass w-full" placeholder="EX: 10"
            :class="[errors && errors['DIA VENCIMENTO MENSAL'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DIA VENCIMENTO MENSAL']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
            errors['DIA VENCIMENTO MENSAL'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: DADOS DO CONTRATO -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <FileText class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Dados do Contrato</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">PRAZO CONTRATUAL MESES</label>
          <input type="number" id="PRAZO CONTRATUAL MESES" v-model="form['PRAZO CONTRATUAL MESES']"
            class="input-glass w-full" placeholder="12"
            :class="[errors && errors['PRAZO CONTRATUAL MESES'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['PRAZO CONTRATUAL MESES']"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['PRAZO CONTRATUAL MESES'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA ASSINATURA CONTRATO</label>
          <input type="text" id="DATA ASSINATURA CONTRATO" v-model="form['DATA ASSINATURA CONTRATO']"
            v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA"
            :class="[errors && errors['DATA ASSINATURA CONTRATO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DATA ASSINATURA CONTRATO']"
            class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['DATA ASSINATURA CONTRATO'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: TESTEMUNHAS -->
    <div class="space-y-12 pt-6 border-t border-brand-glass-border">
      <WitnessSection :form="form" :errors="errors" :buName="buName" />

      <!-- Equipe Interna -->
      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-brand-glass-border pb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
              <UserIcon class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">SDR Responsável</h3>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO SDR</label>
            <CustomSelect v-model="selectedSDRId" :options="sdrOptions" placeholder="PESQUISAR SDR" searchable
              allow-clear variant="form" class="w-full"
              :class="[errors && errors['NOME SDR'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']" />
            <span v-if="errors && errors['NOME SDR']" class="text-[9px] text-red-500 font-bold mt-1 block">{{
              errors['NOME SDR'] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCep } from '../../../composables/useCep';
import WitnessSection from '../../../components/contracts/WitnessSection.vue';
import CustomSelect from '../../../components/ui/CustomSelect.vue';
import {
  Building2,
  MapPin,
  User as UserIcon,
  DollarSign,
  FileText,
  Info,
  Users as UsersIcon
} from 'lucide-vue-next';

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
  },
  templateName: {
    type: String,
    default: ''
  },
  sellers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-sdr-id']);

const { loading: cepLoading, fetchAddress } = useCep();

const selectedSDRId = ref<string | null>(null);

const sdrOptions = computed(() => {
  return (props.sellers as any[])
    .filter(s => s.type === 'sdr')
    .map(s => ({ value: s.id.toString(), label: s.name }));
});

watch(selectedSDRId, (newId) => {
  emit('update-sdr-id', newId);
  if (newId) {
    const sdr = (props.sellers as any[]).find(s => s.id.toString() === newId);
    if (sdr) {
      props.form['NOME SDR'] = sdr.name;
      props.form['CPF SDR'] = sdr.cpf;
    }
  } else {
    props.form['NOME SDR'] = '';
    props.form['CPF SDR'] = '';
  }
});

watch(() => props.form['CEP DO CONTRATANTE'], async (newCep) => {
  if (newCep && newCep.replace(/\D/g, '').length === 8) {
    const address = await fetchAddress(newCep);
    if (address) {
      props.form['LOGRADOURO DO CONTRATANTE'] = address.logradouro;
      props.form['BAIRRO DO CONTRATANTE'] = address.bairro;
      props.form['CIDADE DO CONTRATANTE'] = address.cidade;
      props.form['UF DO CONTRATANTE'] = address.uf;
    }
  }
});
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
}
</style>
