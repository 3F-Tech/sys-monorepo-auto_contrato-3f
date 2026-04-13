<template>
  <div class="space-y-8">
    <!-- Seção: Contratado/Contratada -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">
          {{ isContracted ? 'CONTRATADO' : 'CONTRATADA' }}
        </h3>
      </div>

      <!-- Bloco: Contratada -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2 opacity-60 md:col-span-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DA {{ isContracted ?
            'CONTRATADO' : 'CONTRATADA' }}</label>
          <input type="text" :value="fixedSignatories.contracted.name" class="input-glass w-full cursor-not-allowed"
            readonly />
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL DA {{ isContracted ?
            'CONTRATADO' : 'CONTRATADA' }}</label>
          <input type="text" :value="fixedSignatories.contracted.email" class="input-glass w-full cursor-not-allowed"
            readonly />
        </div>
        <div class="space-y-2 opacity-60">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA {{ isContracted ?
            'CONTRATADO' : 'CONTRATADA' }}</label>
          <input type="text" :value="formatCpf(fixedSignatories.contracted.cpf)"
            class="input-glass w-full cursor-not-allowed" readonly />
        </div>
      </div>
    </div>

    <!-- Seção: Testemunhas Fixas -->
    <div class="space-y-6 pt-6 border-t border-brand-glass-border">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">
          TESTEMUNHAS (FIXAS)
        </h3>
      </div>
      <template v-for="(witness, idx) in fixedSignatories.witnesses" :key="idx">
        <div :class="['grid grid-cols-1 md:grid-cols-2 gap-6', idx > 0 ? 'pt-6 border-t border-white/5' : '']">
          <div class="space-y-2 opacity-60 text-brand-cyan md:col-span-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {{ idx === 0 ? `TESTEMUNHA` : 'HEAD BU' }}
            </label>
            <input type="text" :value="witness.name" class="input-glass w-full cursor-not-allowed !border-brand-cyan/20"
              readonly />
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {{ idx === 0 ? `EMAIL TESTEMUNHA` : 'EMAIL HEAD BU' }}
            </label>
            <input type="text" :value="witness.email" class="input-glass w-full cursor-not-allowed" readonly />
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              {{ idx === 0 ? `CPF TESTEMUNHA` : 'CPF HEAD BU' }}
            </label>
            <input type="text" :value="formatCpf(witness.cpf)" class="input-glass w-full cursor-not-allowed" readonly />
          </div>
        </div>
      </template>

      <!-- Bloco: Equipe de Vendas (Coordenador + Vendedor) -->
      <div class="pt-6 border-t border-white/5">
        <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2 mb-4">
          <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
            <UsersRound class="h-5 w-5" />
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">
            EQUIPE DE VENDAS (TESTEMUNHAS)
          </h3>
        </div>

        <!-- Coordenador da BU (Select) -->
        <div v-if="loadingCoords" class="text-white/30 text-xs italic py-2">Buscando coordenadores...</div>
        <div v-else-if="coordOptions.length === 0"
          class="p-3 rounded-xl bg-white/5 border border-brand-glass-border text-white/30 text-xs italic mb-6">
          Nenhum coordenador encontrado para esta BU.
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="space-y-2 md:col-span-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO COORDENADOR</label>
            <CustomSelect v-model="selectedCoordId" :options="coordOptions" placeholder="SELECIONE O COORDENADOR DA BU"
              searchable allow-clear variant="form" class="w-full" />
          </div>
          <template v-if="selectedCoord">
            <div class="space-y-2 opacity-60">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL COORDENADOR</label>
              <input type="text" :value="selectedCoord.email"
                class="input-glass w-full cursor-not-allowed !border-brand-cyan/20" readonly />
            </div>
            <div class="space-y-2 opacity-60">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF COORDENADOR</label>
              <input type="text" :value="formatCpf(selectedCoord.cpf)"
                class="input-glass w-full cursor-not-allowed !border-brand-cyan/20" readonly />
            </div>
          </template>
        </div>

        <!-- Vendedor -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
          <div class="space-y-2 opacity-60 md:col-span-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              NOME DO VENDEDOR
            </label>
            <input type="text" id="NOME VENDEDOR" :value="form['NOME VENDEDOR']"
              class="input-glass w-full cursor-not-allowed" readonly />
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              EMAIL VENDEDOR
            </label>
            <input type="text" id="EMAIL VENDEDOR" :value="form['EMAIL VENDEDOR']"
              class="input-glass w-full cursor-not-allowed" readonly />
          </div>
          <div class="space-y-2 opacity-60">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">
              CPF VENDEDOR
            </label>
            <input type="text" id="CPF VENDEDOR" :value="formatCpf(form['CPF VENDEDOR'])"
              class="input-glass w-full cursor-not-allowed" readonly />
          </div>
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
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">
            Testemunha Adicional {{ i }} (Cliente)
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
              class="input-glass w-full" placeholder="NOME COMPLETO" :class="[
                errors && errors['NOME TESTEMUNHA ' + i]
                  ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5'
                  : '',
              ]" />
            <span v-if="errors && errors['NOME TESTEMUNHA ' + i]" role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">
              {{ errors['NOME TESTEMUNHA ' + i] }}
            </span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">EMAIL DA TESTEMUNHA</label>
            <input type="email" :id="'EMAIL TESTEMUNHA ' + i" v-model="form['EMAIL TESTEMUNHA ' + i]"
              class="input-glass w-full" placeholder="email@exemplo.com" :class="[
                errors && errors['EMAIL TESTEMUNHA ' + i]
                  ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5'
                  : '',
              ]" />
            <span v-if="errors && errors['EMAIL TESTEMUNHA ' + i]" role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">
              {{ errors['EMAIL TESTEMUNHA ' + i] }}
            </span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA TESTEMUNHA</label>
            <input type="text" :id="'CPF TESTEMUNHA ' + i" v-model="form['CPF TESTEMUNHA ' + i]"
              v-maska="'###.###.###-##'" class="input-glass w-full" placeholder="000.000.000-00" :class="[
                errors && errors['CPF TESTEMUNHA ' + i]
                  ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5'
                  : '',
              ]" />
            <span v-if="errors && errors['CPF TESTEMUNHA ' + i]" role="alert"
              class="text-[9px] text-red-500 font-bold mt-1 block">
              {{ errors['CPF TESTEMUNHA ' + i] }}
            </span>
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
import { ref, computed, onMounted, watch } from 'vue'
import { User as UserIcon, Plus, Trash2, ShieldCheck, UsersRound } from '@lucide/vue'
import { getSellers } from '../../gen/hooks/getSellers'
import { getSellersEmailEmail } from '../../gen/hooks/getSellersEmailEmail'
import client from '../../api/client'
import type { Sellers } from '../../gen/types/Sellers'
import CustomSelect from '../ui/CustomSelect.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  buName: {
    type: String,
    default: '',
  },
  buId: {
    type: [String, Number],
    default: null,
  },
})

const isContracted = ref(false)

// ─── Formatador de CPF Visual ──────────────────────────────────────────────────
const formatCpf = (cpfStr: string | null | undefined) => {
  if (!cpfStr) return ''
  const c = String(cpfStr).replace(/\D/g, '')
  if (c.length !== 11) return cpfStr
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9, 11)}`
}

const PEOPLE = {
  NATI: { name: 'Natália Selister Piccoli', email: 'natalia@3fventure.com.br', cpf: '013.266.710-06' },
  LUIS: { name: 'Luís Fernando Mauri Menti', email: 'luisfernando@3fventure.com.br', cpf: '023.275.400-46' },
}

const count = ref(0)

// ─── Busca de Heads Locais (Dinâmico) ────────────────────────────────────────
const allHeads = ref<Sellers[]>([])

const currentHeadForBU = computed(() => {
  if (!props.buId) return null
  const buIdStr = String(props.buId)
  // Retorna o Head associado a esta BU (Apenas 1 por BU conforme a regra)
  return allHeads.value.find((h) =>
    (h as any).seller_business?.some((sb: any) => String(sb.business_id) === buIdStr),
  )
})

const fetchHeads = async () => {
  try {
    const result = await getSellers({ type: 'head' }, { client })
    allHeads.value = result as Sellers[]
  } catch (e) {
    console.warn('Erro ao buscar heads:', e)
    allHeads.value = []
  }
}

const fixedSignatories = computed(() => {
  const bu = props.buName.toLowerCase()

  let contracted = PEOPLE.LUIS
  let baseWitnesses = [PEOPLE.NATI]

  if (bu.includes('bomma')) {
    contracted = PEOPLE.NATI
    baseWitnesses = [PEOPLE.LUIS]
  } else if (bu.includes('seed')) {
    contracted = PEOPLE.LUIS
    baseWitnesses = [PEOPLE.NATI]
  }
  // Impulse: Contracted Luis, Witness Nati

  // Se temos um head cadastrado no BD para essa BU, adicionamos como Testemunha Fixa
  if (currentHeadForBU.value) {
    baseWitnesses.push({
      name: currentHeadForBU.value.name || '',
      email: currentHeadForBU.value.email || '',
      cpf: currentHeadForBU.value.cpf || ''
    })
  }

  return {
    contracted,
    witnesses: baseWitnesses,
  }
})

// Update form with fixed data
const updateFixedData = () => {
  const sigs = fixedSignatories.value
  const isDebug = props.form['isDebug']

  const getEmail = (originalEmail: string) => {
    if (!isDebug) return originalEmail
    const targetEmails = [
      'luisfernando@3fventure.com.br',
      'natalia@3fventure.com.br'
    ]
    if (targetEmails.includes(originalEmail.toLowerCase())) {
      return originalEmail.replace('@', '+test@')
    }
    return originalEmail
  }

  // Fill Fixed Witnesses
  sigs.witnesses.forEach((w, i) => {
    props.form[`NOME TESTEMUNHA FIXA ${i + 1}`] = w.name
    props.form[`EMAIL TESTEMUNHA FIXA ${i + 1}`] = getEmail(w.email)
    props.form[`CPF TESTEMUNHA FIXA ${i + 1}`] = w.cpf
  })

  // Seller
  props.form[`NOME TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = props.form['NOME VENDEDOR'] || ''
  props.form[`EMAIL TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = getEmail(props.form['EMAIL VENDEDOR'] || '')
  props.form[`CPF TESTEMUNHA FIXA ${sigs.witnesses.length + 1}`] = props.form['CPF VENDEDOR'] || ''
}

watch(() => props.buName, updateFixedData, { immediate: true })
watch(() => props.form['NOME VENDEDOR'], updateFixedData)
watch(() => props.form['CPF VENDEDOR'], updateFixedData)

// ─── Coordenadores da BU ─────────────────────────────────────────────────────

const loadingCoords = ref(false)
const allCoords = ref<Sellers[]>([])
const selectedCoordId = ref<string | null>(null)

const coordOptions = computed(() => {
  if (!props.buId) return []

  const buIdStr = String(props.buId)
  return allCoords.value
    .filter((c) => (c as any).seller_business?.some((sb: any) => String(sb.business_id) === buIdStr))
    .map((c) => ({ value: String(c.id), label: c.name || '' }))
})

const selectedCoord = computed(() => {
  if (!selectedCoordId.value) return null
  return allCoords.value.find((c) => String(c.id) === selectedCoordId.value) || null
})

const fetchCoords = async () => {
  loadingCoords.value = true
  try {
    const result = await getSellers({ type: 'coord' }, { client })
    allCoords.value = result as Sellers[]
    // Auto-seleciona o primeiro coordenador disponível para a BU
    await autoSelectFirstCoord()
  } catch (e) {
    console.warn('Erro ao buscar coordenadores:', e)
    allCoords.value = []
  } finally {
    loadingCoords.value = false
  }
}

const autoSelectFirstCoord = async () => {
  // 1. Tentar selecionar o Coordenador configurado (head_id) para o vendedor atual
  const vendorEmail = props.form['EMAIL VENDEDOR']
  if (vendorEmail) {
    try {
      const seller = await getSellersEmailEmail(vendorEmail, { client })
      if (seller && (seller as any).head_id) {
        const headId = String((seller as any).head_id)
        // Verifica se esse coordenador está na lista de opções para esta BU
        if (coordOptions.value.some((opt) => opt.value === headId)) {
          selectedCoordId.value = headId
          return
        }
      }
    } catch (e) {
      console.warn('Erro ao buscar head_id do vendedor:', e)
    }
  }

  // 2. Fallback: seleciona o primeiro se nada foi setado
  if (!selectedCoordId.value && coordOptions.value.length > 0) {
    selectedCoordId.value = coordOptions.value[0].value
  }
}

// Preenche o form com os dados do coordenador selecionado
watch(selectedCoord, (coord) => {
  const sigs = fixedSignatories.value
  const coordIdx = sigs.witnesses.length + 2 // posição da testemunha 4

  if (coord) {
    props.form['NOME COORD BU'] = coord.name || ''
    props.form['CPF COORD BU'] = coord.cpf || ''
    // Testemunha fixa slot para o coordenador
    props.form[`NOME TESTEMUNHA FIXA ${coordIdx}`] = coord.name || ''
    props.form[`EMAIL TESTEMUNHA FIXA ${coordIdx}`] = coord.email || ''
    props.form[`CPF TESTEMUNHA FIXA ${coordIdx}`] = coord.cpf || ''
  } else {
    props.form['NOME COORD BU'] = ''
    props.form['CPF COORD BU'] = ''
    props.form[`NOME TESTEMUNHA FIXA ${coordIdx}`] = ''
    props.form[`EMAIL TESTEMUNHA FIXA ${coordIdx}`] = ''
    props.form[`CPF TESTEMUNHA FIXA ${coordIdx}`] = ''
  }
})

onMounted(async () => {
  await fetchHeads()
  await fetchCoords()

  // Restaurar testemunhas extras já preenchidas
  for (let i = 6; i >= 1; i--) {
    if (props.form[`NOME TESTEMUNHA ${i}`] || props.form[`CPF TESTEMUNHA ${i}`]) {
      count.value = i
      break
    }
  }

  // ─── Identifica se é contratado ou contratada ────────────────────────────────────────
  isContracted.value = fixedSignatories.value.contracted.name.toLowerCase().includes('fernando') ? true : false

})

// Rebusca coordenadores se a BU mudar
watch(
  () => props.buId,
  async () => {
    selectedCoordId.value = null
    await fetchCoords()
  },
)

const removeWitness = (i: number) => {
  props.form[`NOME TESTEMUNHA ${i}`] = ''
  props.form[`EMAIL TESTEMUNHA ${i}`] = ''
  props.form[`CPF TESTEMUNHA ${i}`] = ''
  count.value--
}
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
}
</style>
