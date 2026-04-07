<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl" @click="close"></div>

    <div
      class="relative w-full max-w-2xl bg-brand-offset border border-brand-glass-border rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-300"
    >
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-brand-cyan/10">
              <DollarSign class="h-5 w-5 text-brand-cyan" />
            </div>
            <h3 class="text-2xl font-black text-white tracking-tighter uppercase focus:outline-none">Configurar CAC</h3>
          </div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold">
            Defina o custo por aquisição por BU para {{ monthName }} de {{ year }}
          </p>
        </div>
        <button @click="close" class="p-2 text-white/20 hover:text-white transition-colors">
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Info Alert -->
      <div class="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-start gap-4">
        <div class="p-2 rounded-xl bg-brand-cyan/10 mt-0.5">
          <Info class="h-4 w-4 text-brand-cyan" />
        </div>
        <p class="text-[10px] text-brand-cyan/80 uppercase font-black tracking-widest leading-relaxed">
          Os valores salvos permanecem os mesmos nos meses seguintes até serem alterados. O valor de
          <strong>3F Venture</strong>
          será sempre a média automática das BUs abaixo.
        </p>
      </div>

      <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
        <div
          v-for="bu in filteredBusinesses"
          :key="bu.id"
          class="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand-cyan/30 transition-all duration-500"
        >
          <div class="flex items-center justify-between gap-6">
            <div class="flex items-center gap-4">
              <div
                class="h-12 w-12 rounded-2xl bg-brand-surface border border-brand-glass-border flex items-center justify-center text-brand-cyan font-black"
              >
                {{ bu.name?.[0] }}
              </div>
              <div class="space-y-0.5">
                <p class="text-xs font-black text-white uppercase">{{ bu.name }}</p>
                <div v-if="isInherited(bu.id)" class="flex items-center gap-2">
                  <div class="h-1 w-1 rounded-full bg-orange-400/40"></div>
                  <p class="text-[8px] text-orange-400/60 uppercase font-black tracking-widest">
                    Valor herdado do mês anterior
                  </p>
                </div>
              </div>
            </div>

            <div class="relative w-40">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
              <input
                :value="form[bu.id as number]"
                @input="updateForm(bu.id as number, ($event.target as HTMLInputElement).value)"
                type="number"
                step="0.01"
                class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all placeholder:text-white/5"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 pt-4 border-t border-white/5">
        <button
          @click="close"
          class="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase text-white/40 hover:bg-white/10 hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="flex-[2] py-4 rounded-2xl bg-brand-cyan text-brand-deep shadow-xl shadow-brand-cyan/20 text-xs font-black uppercase hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          <span v-if="saving" class="flex items-center justify-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" />
            Salvando...
          </span>
          <span v-else>Salvar Indicadores</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue'
  import { DollarSign, X, Info, Loader2 } from '@lucide/vue'
  import { useBuStore } from '../../store/bu'
  import { useCacStore } from '../../store/cac'
  import { useToast } from '../../composables/useToast'

  const props = defineProps<{
    isOpen: boolean
    month: number
    year: number
  }>()

  const emit = defineEmits(['close', 'saved'])

  const buStore = useBuStore()
  const cacStore = useCacStore()
  const toast = useToast()

  const form = ref<Record<number, number>>({})
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

  const filteredBusinesses = computed(() => buStore.businesses)

  watch(
    () => props.isOpen,
    async (val) => {
      if (val) {
        await buStore.fetchBusinesses()
        await cacStore.fetchCac(props.month, props.year)

        // Inicializar form com valores do store
        const initialForm: Record<number, number> = {}
        buStore.businesses.forEach((bu) => {
          const cacValue = cacStore.getBuCac(bu.id as number)
          initialForm[bu.id as number] = cacValue ? Number(cacValue.amount) : 0
        })
        form.value = initialForm
      }
    },
  )

  const isInherited = (buId: any) => {
    const cacValue = cacStore.getBuCac(buId as number)
    return cacValue?.is_inherited || false
  }

  const updateForm = (buId: number, value: string) => {
    form.value[buId] = parseFloat(value) || 0
  }

  const close = () => {
    emit('close')
  }

  const handleSave = async () => {
    saving.value = true
    try {
      for (const buId in form.value) {
        await cacStore.saveCac(Number(buId), form.value[buId], props.month, props.year)
      }
      toast.success('Indicadores de CAC salvos com sucesso!')
      emit('saved')
      close()
    } catch (err) {
      toast.error('Erro ao salvar alguns indicadores.')
    } finally {
      saving.value = false
    }
  }
</script>
