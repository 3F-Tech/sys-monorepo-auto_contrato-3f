<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl" @click="close"></div>

    <div
      class="relative w-full max-w-4xl bg-brand-offset/90 border border-brand-glass-border rounded-[2.5rem] shadow-3xl overflow-hidden p-10 flex flex-col h-[85vh] animate-in zoom-in-95 duration-300 backdrop-blur-xl">
      <!-- Header -->
      <div class="relative z-10 flex items-center justify-between mb-8">
        <div class="flex items-center gap-6">
          <div class="space-y-1">
            <div class="flex items-center gap-3">
              <div class="p-2.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20">
                <DollarSign class="h-6 w-6 text-brand-cyan" />
              </div>
              <h3 class="text-2xl font-black text-white tracking-tighter uppercase whitespace-nowrap">Configurar Custos
              </h3>
            </div>
          </div>

          <div class="h-10 w-px bg-white/5"></div>

          <div class="flex flex-col">
            <span
              class="text-[9px] font-black text-brand-cyan/50 uppercase tracking-[0.2em] mb-0.5 ml-0.5">Competência</span>
            <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-cyan/5 border border-brand-cyan/10">
              <span class="text-sm font-black text-white uppercase tracking-wider">{{ monthName }}</span>
              <div class="w-1 h-1 rounded-full bg-brand-cyan/30"></div>
              <span class="text-sm font-black text-brand-cyan tracking-wider">{{ year }}</span>
            </div>
          </div>
        </div>
        <button @click="close" class="p-2 text-white/20 hover:text-white transition-colors">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Dashboard View: Grid of BU Cards -->
        <div v-if="currentView === 'list'" class="space-y-6 pt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div v-for="bu in buStore.businesses" :key="bu.id" @click="selectBU(bu.id.toString())"
              class="group relative overflow-hidden p-6 rounded-[2rem] bg-white/[0.03] border border-white/10 hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.04] transition-all duration-500 cursor-pointer">

              <!-- Background Icon Decor -->
              <div
                class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-700 pointer-events-none text-brand-cyan group-hover:scale-110">
                <Building2 class="h-24 w-24 rotate-[-12deg]" />
              </div>

              <div class="flex items-start justify-between relative z-10">
                <div class="flex items-center gap-4">
                  <div
                    class="h-12 w-12 rounded-2xl overflow-hidden border border-white/10 bg-white/5 relative group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-all duration-500">
                    <img v-if="bu.img_base64" :src="bu.img_base64" class="h-full w-full object-cover" />
                    <div v-else class="h-full w-full flex items-center justify-center bg-brand-cyan/10">
                      <Building2 class="h-6 w-6 text-brand-cyan" />
                    </div>
                  </div>
                  <div>
                    <h4
                      class="text-sm font-black text-white/90 uppercase tracking-widest group-hover:text-brand-cyan transition-colors">
                      {{ bu.name }}</h4>
                    <div class="flex items-center gap-2 mt-1">
                      <div class="h-1.5 w-1.5 rounded-full"
                        :class="getBuCostData(bu.id) ? 'bg-green-400' : 'bg-orange-400/50'"></div>
                      <span class="text-[9px] font-black uppercase tracking-widest"
                        :class="getBuCostData(bu.id) ? 'text-green-400/80' : 'text-white/30'">
                        {{ getBuCostData(bu.id) ? 'Configurado' : 'Aguardando' }}
                      </span>
                    </div>
                  </div>
                </div>
                <div
                  class="p-2 rounded-xl bg-white/5 text-white/20 group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                  <ChevronRight class="h-4 w-4" />
                </div>
              </div>

              <div class="mt-8 relative z-10">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Custo Projetado</p>
                <div class="flex items-baseline gap-1">
                  <span class="text-[10px] font-bold text-white/40">R$</span>
                  <span class="text-xl font-black tracking-tighter"
                    :class="getBuCostData(bu.id) ? 'text-white' : 'text-white/10'">
                    {{ formatCurrencyOnlyValue(calculateBuTotal(bu.id)) }}
                  </span>
                </div>
              </div>

              <!-- Shine effect -->
              <div
                class="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000">
              </div>
            </div>
          </div>
        </div>

        <!-- Form View: Individual BU Setup -->
        <div v-else-if="currentView === 'form'" class="space-y-8 pb-4 animate-in slide-in-from-right-4 duration-500">
          <!-- Back Switcher -->
          <div class="flex items-center gap-4 mb-2">
            <button @click="currentView = 'list'"
              class="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/10 transition-all group">
              <ArrowLeft class="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
              Empresas
            </button>
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 rounded-lg overflow-hidden border border-white/10">
                <img v-if="selectedBu?.img_base64" :src="selectedBu.img_base64" class="h-full w-full object-cover" />
                <div v-else class="h-full w-full flex items-center justify-center bg-brand-cyan/10">
                  <Building2 class="h-3.5 w-3.5 text-brand-cyan" />
                </div>
              </div>
              <span class="text-xs font-black text-brand-cyan uppercase tracking-widest">{{ selectedBu?.name }}</span>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-start gap-4">
            <div class="p-2 rounded-xl bg-brand-cyan/10 mt-0.5">
              <Calculator class="h-4 w-4 text-brand-cyan" />
            </div>
            <div class="space-y-1">
              <p class="text-[10px] text-brand-cyan/80 uppercase font-black tracking-widest">
                Indicadores Financeiros • {{ selectedBu?.name }}
              </p>
              <p class="text-[9px] text-brand-cyan/40 uppercase font-bold tracking-widest">
                Defina os custos comerciais unitários desta unidade para {{ monthName }}/{{ year }}.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- Variáveis & Estrutura -->
            <div class="space-y-6">
              <h4 class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">
                Variáveis & Estrutura
              </h4>

              <div class="space-y-4">
                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors">
                    Investimento em Mídia
                  </label>
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors">
                      R$
                    </span>
                    <input v-model="commForm.media_investment" type="text" v-maska="maskOptions" @keypress="onlyNumbers"
                      inputmode="numeric" class="cost-input-pro" placeholder="0,00" />
                  </div>
                </div>

                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors">
                    Ferramentas Comerciais
                  </label>
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors">
                      R$
                    </span>
                    <input v-model="commForm.commercial_tools" type="text" v-maska="maskOptions" @keypress="onlyNumbers"
                      inputmode="numeric" class="cost-input-pro" placeholder="0,00" />
                  </div>
                </div>

                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors">
                    Comissão Indicação
                  </label>
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors">
                      R$
                    </span>
                    <input v-model="commForm.referral_commission" type="text" v-maska="maskOptions"
                      @keypress="onlyNumbers" inputmode="numeric" class="cost-input-pro" placeholder="0,00" />
                  </div>
                </div>

                <!-- Coordenadora (Fixed) -->
                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors">
                    Remuneração Coordenadora
                  </label>
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors">R$</span>
                    <input v-model="commForm.remuneration_coord" type="text" v-maska="maskOptions"
                      @keypress="onlyNumbers" inputmode="numeric" class="cost-input-pro" placeholder="0,00" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Time & Remuneração -->
            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <h4 class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1">Time & Remuneração</h4>
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                  <Users class="h-3 w-3 text-brand-cyan/40" />
                  <span class="text-[9px] font-black text-white/20 uppercase">{{ dynamicSdrs.length +
                    dynamicClosers.length }} Integrantes</span>
                </div>
              </div>

              <div class="space-y-6">
                <!-- SDRs Dynamic List -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between px-1">
                    <span class="text-[9px] font-black text-brand-cyan/40 uppercase tracking-widest">Equipe SDR</span>
                    <button @click="addSdr"
                      class="text-[9px] font-black text-brand-cyan uppercase hover:text-white transition-colors flex items-center gap-1">
                      <Plus class="h-3 w-3" /> Adicionar
                    </button>
                  </div>

                  <div v-for="(sdr, idx) in dynamicSdrs" :key="sdr.id"
                    class="animate-in fade-in slide-in-from-top-1 duration-300">
                    <div class="space-y-1.5 group/field relative">
                      <div class="flex items-center justify-between mb-1 ml-1">
                        <label
                          class="text-[9px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest transition-colors">
                          SDR {{ idx + 1 }}
                        </label>
                        <button v-if="dynamicSdrs.length > 1" @click="removeSdr(idx)"
                          class="opacity-0 group-hover/field:opacity-40 hover:!opacity-100 transition-all text-red-400">
                          <Trash2 class="h-3 w-3" />
                        </button>
                      </div>
                      <div class="relative">
                        <span
                          class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors">R$</span>
                        <input v-model="sdr.value" type="text" v-maska="maskOptions" @keypress="onlyNumbers"
                          inputmode="numeric" class="cost-input-pro pl-8 !py-3 !text-sm" placeholder="0,00" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Closers Dynamic List -->
                <div class="space-y-4">
                  <div class="flex items-center justify-between px-1">
                    <span class="text-[9px] font-black text-brand-blue/50 uppercase tracking-widest">Equipe
                      Closer</span>
                    <button @click="addCloser"
                      class="text-[9px] font-black text-brand-blue uppercase hover:text-white transition-colors flex items-center gap-1">
                      <Plus class="h-3 w-3" /> Adicionar
                    </button>
                  </div>

                  <div v-for="(closer, idx) in dynamicClosers" :key="closer.id"
                    class="animate-in fade-in slide-in-from-top-1 duration-300">
                    <div class="space-y-1.5 group/field relative">
                      <div class="flex items-center justify-between mb-1 ml-1">
                        <label
                          class="text-[9px] font-black text-brand-blue/60 group-focus-within/field:text-brand-blue uppercase tracking-widest transition-colors">
                          Closer {{ idx + 1 }}
                        </label>
                        <button v-if="dynamicClosers.length > 1" @click="removeCloser(idx)"
                          class="opacity-0 group-hover/field:opacity-40 hover:!opacity-100 transition-all text-red-400">
                          <Trash2 class="h-3 w-3" />
                        </button>
                      </div>
                      <div class="relative">
                        <span
                          class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-blue/40 transition-colors">R$</span>
                        <input v-model="closer.value" type="text" v-maska="maskOptions" @keypress="onlyNumbers"
                          inputmode="numeric" class="cost-input-pro pl-8 !py-3 !text-sm" placeholder="0,00" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- Summary Display -->
          <div
            class="mt-8 p-6 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-between">
            <div class="space-y-1">
              <p class="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em]">Custo Total Acumulado</p>
              <p class="text-[9px] text-white/40 uppercase font-medium">Soma de todos os campos desta unidade</p>
            </div>
            <p class="text-3xl font-black text-brand-cyan tracking-tighter">
              {{ formatFullCurrency(totalCommercialCosts) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions (only in form) -->
      <div v-if="currentView === 'form'" class="flex gap-4 pt-8 mt-4 border-t border-white/5 relative z-10">
        <button @click="currentView = 'list'"
          class="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase text-white/40 hover:bg-white/10 hover:text-white transition-all">
          Cancelar
        </button>
        <button @click="handleSave" :disabled="saving || !selectedBuId"
          class="flex-[3] py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep shadow-xl shadow-brand-cyan/20 text-xs font-black uppercase hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
          <span v-if="saving" class="flex items-center justify-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" />
            Salvando Indicadores...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <Save class="h-4 w-4" />
            Salvar Custos de {{ selectedBu?.name }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from 'vue'
import { DollarSign, X, Loader2, Calculator, Save, Building2, ChevronRight, ArrowLeft, Plus, Trash2, Users } from '@lucide/vue'
import { useToast } from '../../composables/useToast'
import { useCostsStore } from '../../store/costs'
import { useBuStore } from '../../store/bu'
import CustomSelect from '../ui/CustomSelect.vue'

const props = defineProps<{
  isOpen: boolean
  month: number
  year: number
}>()

const emit = defineEmits(['close', 'saved'])

const costsStore = useCostsStore()
const buStore = useBuStore()
const toast = useToast()

const currentView = ref<'list' | 'form'>('list')
const selectedBuId = ref<string | null>(null)
const selectedBu = computed(() =>
  buStore.businesses.find((b) => b.id.toString() === selectedBuId.value),
)
const buOptions = computed(() =>
  buStore.businesses.map((b) => ({
    value: b.id.toString(),
    label: b.name,
  })),
)

const getBuCostData = (buId: number) => {
  return costsStore.currentCosts?.items?.find(item => item.bu_id === buId) || null
}

const calculateBuTotal = (buId: number) => {
  const data = getBuCostData(buId)
  if (!data) return 0
  const base =
    Number(data.media_investment || 0) +
    Number(data.commercial_tools || 0) +
    Number(data.remuneration_coord || 0) +
    Number(data.referral_commission || 0)

  const membersTotal = (data.members || []).reduce((acc, m) => acc + Number(m.value || 0), 0)
  return base + membersTotal
}

const formatCurrencyOnlyValue = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

const selectBU = (buId: string) => {
  selectedBuId.value = buId
  currentView.value = 'form'
}

const onlyNumbers = (e: KeyboardEvent) => {
  if (e.ctrlKey || e.metaKey || ['Backspace', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(e.key)) {
    return
  }
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault()
  }
}

const maskOptions = {
  preProcess: (val: string) => val.replace(/[^\d]/g, ''),
  postProcess: (val: string) => {
    if (!val) return ''
    const num = parseInt(val, 10) / 100
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num)
  },
}

const parseBRL = (val: string | number) => {
  if (typeof val === 'number') return val
  if (!val) return 0
  return parseFloat(val.replace(/\./g, '').replace(',', '.')) || 0
}

const formatBRLInput = (val: number) => {
  if (val === 0) return ''
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val)
}

const commForm = ref({
  media_investment: '',
  commercial_tools: '',
  remuneration_coord: '',
  referral_commission: '',
})

const dynamicSdrs = ref<{ id: number, value: string }[]>([])
const dynamicClosers = ref<{ id: number, value: string }[]>([])

const addSdr = () => {
  dynamicSdrs.value.push({ id: Date.now(), value: '' })
}

const removeSdr = (index: number) => {
  dynamicSdrs.value.splice(index, 1)
}

const addCloser = () => {
  dynamicClosers.value.push({ id: Date.now(), value: '' })
}

const removeCloser = (index: number) => {
  dynamicClosers.value.splice(index, 1)
}

const saving = ref(false)

const monthName = computed(() => {
  const months = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ]
  return months[props.month - 1]
})

const totalCommercialCosts = computed(() => {
  const base = Object.values(commForm.value).reduce((acc, val) => acc + parseBRL(val), 0)
  const sdrsTotal = dynamicSdrs.value.reduce((acc, sdr) => acc + parseBRL(sdr.value), 0)
  const closersTotal = dynamicClosers.value.reduce((acc, closer) => acc + parseBRL(closer.value), 0)
  return base + sdrsTotal + closersTotal
})

const formatFullCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(val)
}

watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      document.body.style.overflow = 'hidden'
      currentView.value = 'list'
      await buStore.fetchBusinesses()
      await costsStore.fetchCosts(props.month, props.year, 'all')
    } else {
      document.body.style.overflow = ''
      selectedBuId.value = null
    }
  },
)

const clearForm = () => {
  commForm.value = {
    media_investment: '',
    commercial_tools: '',
    remuneration_coord: '',
    referral_commission: '',
  }
}

watch(
  () => selectedBuId.value,
  async (buId) => {
    if (!buId) {
      clearForm()
      return
    }
    // O fetch já é feito no list, mas vamos garantir os dados individuais se necessário
    const existing = getBuCostData(Number(buId))

    if (existing) {
      commForm.value = {
        media_investment: formatBRLInput(Number(existing.media_investment || 0)),
        commercial_tools: formatBRLInput(Number(existing.commercial_tools || 0)),
        remuneration_coord: formatBRLInput(Number(existing.remuneration_coord || 0)),
        referral_commission: formatBRLInput(Number(existing.referral_commission || 0)),
      }

      // Carrega membros da nova estrutura
      dynamicSdrs.value = (existing.members || [])
        .filter(m => m.type === 'SDR')
        .map(m => ({ id: m.id || Date.now() + Math.random(), value: formatBRLInput(Number(m.value)) }))

      if (dynamicSdrs.value.length === 0) dynamicSdrs.value.push({ id: Date.now(), value: '' })

      dynamicClosers.value = (existing.members || [])
        .filter(m => m.type === 'CLOSER')
        .map(m => ({ id: m.id || Date.now() + Math.random(), value: formatBRLInput(Number(m.value)) }))

      if (dynamicClosers.value.length === 0) dynamicClosers.value.push({ id: Date.now() + 1, value: '' })
    } else {
      clearForm()
      dynamicSdrs.value = [{ id: Date.now(), value: '' }]
      dynamicClosers.value = [{ id: Date.now() + 1, value: '' }]
    }
  },
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

const close = () => emit('close')

const handleSave = async () => {
  saving.value = true
  try {
    const members = [
      ...dynamicSdrs.value.map(s => ({ type: 'SDR', value: parseBRL(s.value) })),
      ...dynamicClosers.value.map(c => ({ type: 'CLOSER', value: parseBRL(c.value) }))
    ].filter(m => m.value > 0)

    const dataToSave = {
      media_investment: parseBRL(commForm.value.media_investment),
      commercial_tools: parseBRL(commForm.value.commercial_tools),
      remuneration_coord: parseBRL(commForm.value.remuneration_coord),
      referral_commission: parseBRL(commForm.value.referral_commission),
      members: [
        { type: 'SDR' as const, value: 100 },
        { type: 'CLOSER' as const, value: 200 }
      ],
      month: props.month,
      year: props.year,
      bu_id: Number(selectedBuId.value),
    }

    await costsStore.saveCosts(dataToSave)
    toast.success(`Custos de ${selectedBu.value?.name} salvos com sucesso!`)
    await costsStore.fetchCosts(props.month, props.year, 'all') // Refresh list
    currentView.value = 'list'
    emit('saved')
  } catch (err) {
    toast.error('Erro ao salvar os indicadores de custos.')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.cost-input-pro {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  font-size: 0.875rem;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cost-input-pro:focus {
  outline: none;
  background: rgba(0, 212, 255, 0.02);
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 212, 255, 0.15);
  transform: translateY(-1px);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
</style>
