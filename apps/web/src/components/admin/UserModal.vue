<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm" @click="close"></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-2xl bg-brand-offset border border-brand-glass-border rounded-3xl p-8 shadow-2xl overflow-hidden group max-h-[90vh] flex flex-col">
      <!-- Decoration -->
      <div
        class="absolute -top-24 -right-24 h-48 w-48 bg-brand-cyan/5 rounded-full blur-3xl group-hover:bg-brand-cyan/10 transition-all">
      </div>

      <div class="relative z-10 flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <UserRoundPlus v-if="!user" class="h-5 w-5 text-brand-cyan" />
          <UserRoundCog v-else class="h-5 w-5 text-brand-cyan" />
          {{ user ? 'Editar Usuário' : 'Novo Usuário' }}
        </h3>
        <button @click="close" class="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <X class="h-5 w-5 text-white/40" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="relative z-10 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Seção: Informações Básicas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Nome Completo</label>
            <input v-model="form.name" type="text"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="Ex: João da Silva" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">E-mail</label>
            <input v-model="form.email" type="text"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="email@exemplo.com" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">CPF</label>
            <input v-model="form.cpf" type="text" v-maska="'###.###.###-##'"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="000.000.000-00" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">WhatsApp</label>
            <input v-model="form.phone" type="text" v-maska="'(##) #####-####'"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="(00) 00000-0000" />
          </div>
        </div>

        <!-- Seção: Senha e Cargo -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">
              {{
                user
                  ? `Nova Senha
              (Opcional)`
                  : `Senha Inicial`
              }}
            </label>
            <input v-model="form.password" type="password"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="••••••••" />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Cargo</label>
            <CustomSelect v-model="form.type" :options="availableRoles" placeholder="Selecione o cargo" />
          </div>
        </div>

        <!-- Seção: Hierarquia -->
        <div v-if="form.type === 'seller' || form.type === 'sdr'" class="space-y-1.5">
          <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">
            Coordenador Responsável
          </label>
          <CustomSelect v-model="form.head_id" :options="headsOptions" placeholder="Selecione o Coordenador"
            :disabled="authStore.userRole === 'coord'" searchable allow-clear />
        </div>

        <!-- Seção: Vínculo com Unidades de Negócio -->
        <div class="space-y-3">
          <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest flex items-center gap-2">
            <Building2 class="h-3 w-3" />
            {{ form.type === 'head' ? 'Unidade de Negócio do Head' : 'Unidades de Negócio Vinculadas' }}
          </label>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <label v-for="bu in visibleBusiness" :key="bu.id"
              class="flex items-center gap-3 p-2.5 rounded-xl bg-brand-surface border border-brand-glass-border hover:border-brand-cyan/30 cursor-pointer transition-all group/item select-none"
              :class="{
                'border-brand-cyan/50 bg-brand-cyan/5': selectedBUs.includes(bu.id!),
              }">
              <div class="relative flex items-center justify-center shrink-0">
                <input type="checkbox" :value="bu.id" v-model="selectedBUs"
                  class="peer appearance-none h-5 w-5 rounded-lg border border-brand-glass-border checked:bg-brand-cyan checked:border-brand-cyan transition-all" />
                <Check
                  class="absolute h-3.5 w-3.5 text-brand-deep opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>

              <!-- Logo Discreta -->
              <div v-if="bu.img_base64"
                class="h-6 w-6 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-brand-offset">
                <img :src="bu.img_base64" class="h-full w-full object-cover" />
              </div>
              <div v-else class="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                <Building2 class="h-3 w-3 text-white/20" :style="{ color: bu.color || undefined }" />
              </div>

              <span
                class="text-[11px] font-bold text-white/70 group-hover/item:text-brand-cyan transition-colors truncate">
                {{ bu.name }}
              </span>
            </label>
          </div>
        </div>

        <div class="pt-6 flex gap-3 sticky bottom-0 bg-brand-offset py-2">
          <button type="button" @click="close"
            class="flex-1 px-4 py-4 rounded-xl bg-brand-surface border border-brand-glass-border text-xs font-bold hover:bg-white/5 transition-all">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/20">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            {{ loading ? 'Sincronizando...' : user ? 'Atualizar Vendedor' : 'Criar Vendedor' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { UserRoundPlus, UserCog, X, Loader2, Building2, Save, UserRoundCog } from '@lucide/vue'
import CustomSelect from '../ui/CustomSelect.vue'
import client from '../../api/client'
import type { Sellers } from '../../gen/types/Sellers'
import type { Business } from '../../gen/types/Business'

type SellerWithRelations = Sellers & {
  seller_business?: {
    business_id: number
    business: Business
  }[]
}
import { postSellers } from '../../gen/hooks/postSellers'
import { deleteSellersId } from '../../gen/hooks/deleteSellersId'
import { putSellersId } from '../../gen/hooks/putSellersId'
import { getSellers } from '../../gen/hooks/getSellers'
import { getBusiness } from '../../gen/hooks/getBusiness'
import { putSellerBusiness } from '../../gen/hooks/putSellerBusiness'
import crypto from 'crypto-js'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'

const props = defineProps<{
  isOpen: boolean
  user: SellerWithRelations | null
}>()

const emit = defineEmits(['close', 'saved'])

const authStore = useAuthStore()
const toast = useToast()
const loading = ref(false)
const allBusiness = ref<Business[]>([])
const heads = ref<Sellers[]>([])
const selectedBUs = ref<number[]>([])

const visibleBusiness = computed(() => {
  if (authStore.userRole === 'coord') {
    const coordBuIds = ((authStore.user as any)?.seller_business || []).map((sb: any) => sb.business_id)
    return allBusiness.value.filter((b) => coordBuIds.includes(b.id))
  }
  return allBusiness.value
})

const availableRoles = computed(() => {
  if (authStore.userRole === 'admin') {
    return [
      { value: 'seller', label: 'Vendedor' },
      { value: 'sdr', label: 'SDR' },
      { value: 'coord', label: 'Coordenador de Equipe' },
      { value: 'head', label: 'Head de BU' },
      { value: 'admin', label: 'Administrador' },
    ]
  }
  // Heads e Coords só podem criar vendedores e SDRs
  return [
    { value: 'seller', label: 'Vendedor' },
    { value: 'sdr', label: 'SDR' },
  ]
})

const headsOptions = computed(() => {
  return [
    { value: null, label: 'Nenhum (Vendedor Independente)' },
    ...heads.value.map((h) => ({
      value: h.id?.toString(),
      label: h.name || 'Sem nome',
    })),
  ]
})

const form = ref({
  name: '',
  email: '',
  password: '',
  cpf: '',
  phone: '',
  type: 'seller',
  head_id: null as any,
})

const loadInitialData = async () => {
  try {
    const [busData, sellersData] = await Promise.all([getBusiness({ client }), getSellers({}, { client })])
    allBusiness.value = busData as Business[]

    const fetchedHeads = (sellersData as Sellers[]).filter((s) => s.type === 'coord')

    // Se o usuário logado for coord, garante que ele esteja na lista para o preenchimento automático
    if (authStore.userRole === 'coord' && authStore.user) {
      const alreadyInList = fetchedHeads.some((h) => h.id?.toString() === authStore.user?.id?.toString())
      if (!alreadyInList) {
        fetchedHeads.push(authStore.user as Sellers)
      }
    }

    heads.value = fetchedHeads
  } catch (error) {
    console.error('Erro ao carregar dados auxiliares:', error)
  }
}

watch(
  () => form.value.type,
  (newType) => {
    if (newType === 'head' && selectedBUs.value.length > 1) {
      // Mantém apenas a última selecionada se mudar para head
      selectedBUs.value = [selectedBUs.value[selectedBUs.value.length - 1]]
      toast.warning('Heads de BU podem estar vinculados a apenas uma unidade. Mantendo a última selecionada.')
    }
  },
)

watch(selectedBUs, (newVal) => {
  if (form.value.type === 'head' && newVal.length > 1) {
    // Comportamento de rádio para head
    selectedBUs.value = [newVal[newVal.length - 1]]
  }
})

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      await loadInitialData()
      if (props.user) {
        form.value = {
          name: props.user.name || '',
          email: props.user.email || '',
          password: '',
          cpf: props.user.cpf || '',
          phone: props.user.phone || '',
          type: props.user.type || 'seller',
          head_id: props.user.head_id ? props.user.head_id.toString() : null,
        }
        // Extrair IDs das BUs vinculadas
        selectedBUs.value = props.user.seller_business?.map((sb: any) => sb.business_id) || []
      } else {
        form.value = {
          name: '',
          email: '',
          password: '',
          cpf: '',
          phone: '',
          type: availableRoles.value[0]?.value || 'seller',
          head_id: authStore.userRole === 'coord' ? authStore.user?.id?.toString() : null,
        }
        selectedBUs.value = []
      }
    }
  },
)

const close = () => {
  document.body.style.overflow = ''
  emit('close')
}

// Disable body scroll when modal opens, enable when closes
watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  },
)

const handleSubmit = async () => {
  // Validação de campos obrigatórios
  if (!form.value.name?.trim()) {
    toast.error('Por favor, insira o nome completo.')
    return
  }
  const nameParts = form.value.name.trim().split(/\s+/)
  if (nameParts.length < 2) {
    toast.error('Por favor, informe o nome completo (nome e sobrenome).')
    return
  }
  if (!form.value.email?.trim()) {
    toast.error('Por favor, insira o e-mail.')
    return
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  if (!emailRegex.test(form.value.email)) {
    toast.error('E-mail inválido. Verifique e tente novamente.')
    return
  }
  if (!props.user && !form.value.password?.trim()) {
    toast.error('Por favor, insira a senha.')
    return
  }
  const validateCPF = (cpf: string): boolean => {
    const cleanCpf = cpf.replace(/\D/g, '')
    if (cleanCpf.length !== 11) return false
    if (/^(\d)\1+$/.test(cleanCpf)) return false // Evita CPFs como 111.111.111-11

    let sum = 0
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf[i]) * (10 - i)
    }
    let digit1 = sum % 11
    digit1 = digit1 < 2 ? 0 : 11 - digit1

    sum = 0
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf[i]) * (11 - i)
    }
    let digit2 = sum % 11
    digit2 = digit2 < 2 ? 0 : 11 - digit2

    return digit1 === parseInt(cleanCpf[9]) && digit2 === parseInt(cleanCpf[10])
  }

  const cpfClean = (form.value.cpf || '').replace(/\D/g, '')
  if (!cpfClean) {
    toast.error('Por favor, insira o CPF.')
    return
  }
  if (!validateCPF(cpfClean)) {
    toast.error('CPF inválido. Verifique e tente novamente.')
    return
  }
  const phoneClean = (form.value.phone || '').replace(/\D/g, '')
  if (!phoneClean) {
    toast.error('Por favor, insira o WhatsApp.')
    return
  }
  if (phoneClean.length < 11) {
    toast.error('WhatsApp incompleto. Informe DDD + número.')
    return
  }

  loading.value = true
  try {
    let sellerId: any = props.user?.id

    const sellerPayload: any = {
      name: form.value.name,
      email: form.value.email,
      cpf: form.value.cpf,
      phone: form.value.phone,
      type: form.value.type,
      head_id: form.value.head_id && form.value.head_id !== 'null' ? form.value.head_id.toString() : null,
    }

    if (form.value.password) {
      sellerPayload.password = form.value.password
    }

    if (props.user) {
      // Update Seller
      await putSellersId(props.user.id as any, { data: sellerPayload }, { client })
    } else {
      // Create Seller
      const res = await postSellers({ data: sellerPayload }, { client })
      sellerId = (res as any).id
    }

    // Update Business Associations
    if (sellerId) {
      await putSellerBusiness(
        {
          data: {
            seller_id: sellerId,
            business_ids: selectedBUs.value,
          },
        },
        { client },
      )
    }

    toast.success(props.user ? 'Vendedor atualizado com sucesso!' : 'Vendedor criado com sucesso!')
    emit('saved')
    close()
  } catch (error: any) {
    console.error('Falha ao salvar usuário e vínculos:', error)
    const msg =
      error.response?.data?.error ||
      'Ocorreu um erro ao processar sua solicitação. Verifique os dados e tente novamente.'
    toast.error(msg)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.3);
}
</style>
