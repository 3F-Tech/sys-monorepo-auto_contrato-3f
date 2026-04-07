<template>
  <div class="space-y-6">
    <!-- Header with Filters -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div class="flex flex-wrap items-center gap-3">
        <!-- Target Type Filter -->
        <div class="min-w-[160px]">
          <label class="text-[9px] font-black text-brand-cyan uppercase tracking-widest mb-1.5 block ml-1">
            Filtrar por Tipo
          </label>
          <div class="flex items-center gap-2">
            <button v-for="type in typeFilters" :key="type.value" @click="activeType = type.value" :class="[
              'px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border transition-all',
              activeType === type.value
                ? 'bg-brand-cyan/20 border-brand-cyan/30 text-brand-cyan'
                : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10',
            ]">
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="h-8 w-px bg-white/10 mx-2 hidden md:block"></div>

        <!-- Date Filters -->
        <div class="flex items-center gap-3">
          <div class="min-w-[140px]">
            <label class="text-[9px] font-black text-brand-cyan uppercase tracking-widest mb-1.5 block ml-1">Ano</label>
            <CustomSelect v-model="filterYear" :options="yearOptions" small />
          </div>
          <div class="min-w-[140px]">
            <label class="text-[9px] font-black text-brand-cyan uppercase tracking-widest mb-1.5 block ml-1">Mês</label>
            <CustomSelect v-model="filterMonth" :options="monthOptions" small />
          </div>
        </div>
      </div>

      <button @click="$emit('add')"
        class="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-cyan text-brand-deep text-[11px] font-black uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20">
        <Plus class="h-4 w-4" />
        Adicionar Nova Meta
      </button>
    </div>

    <!-- Goals Table Wrapper -->
    <div class="flex-1 flex flex-col min-h-0">
      <div
        class="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.03] backdrop-blur-md shadow-2xl flex flex-col min-h-0">
        <div class="overflow-x-auto custom-scrollbar flex-1 min-h-0">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr class="border-b border-white/5 bg-white/[0.02]">
                <th class="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
                  Alvo do Objetivo
                </th>
                <th class="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-center">
                  Tipo
                </th>
                <th class="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Mês Base</th>
                <th class="px-6 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Meta de P1</th>

                <th class="px-8 py-5 text-[10px] font-black text-white/40 uppercase tracking-[0.3em] text-right">
                  Controle
                </th>
              </tr>
            </thead>
            <tbody class="divide-y-0">
              <tr v-for="goal in paginatedGoals" :key="goal.id"
                class="hover:bg-brand-cyan/[0.04] transition-all duration-300 group relative">
                <td class="px-8 py-5">
                  <div class="flex items-center gap-4">
                    <div
                      class="h-10 w-10 rounded-2xl bg-brand-cyan/10 flex items-center justify-center border border-white/20 shadow-lg shadow-brand-cyan/5 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
                      <template v-if="getTargetImage(goal)">
                        <img :src="getTargetImage(goal)" class="h-full w-full object-cover" />
                      </template>
                      <template v-else>
                        <component :is="goal.target_type === 'bu'
                          ? Building
                          : goal.target_type === 'head' || goal.target_type === 'team'
                            ? Users
                            : User
                          " class="h-5 w-5 text-brand-cyan" />
                      </template>
                    </div>
                    <div>
                      <div class="text-xs font-black text-white group-hover:text-brand-cyan transition-colors">
                        {{ getTargetName(goal) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5 text-center">
                  <span :class="[
                    'px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-inner',
                    goal.target_type === 'bu'
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                      : goal.target_type === 'team'
                        ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                        : goal.target_type === 'head'
                          ? 'bg-brand-cyan/10 border-brand-cyan/30 text-brand-cyan'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
                  ]">
                    {{
                      goal.target_type === 'bu'
                        ? 'BU'
                        : goal.target_type === 'team'
                          ? 'Equipe'
                          : goal.target_type === 'head'
                            ? 'Head'
                            : 'Vendedor'
                    }}
                  </span>
                </td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-2">
                    <Calendar class="h-3 w-3 text-white/20" />
                    <div class="text-[11px] font-black text-white/70 tabular-nums">
                      {{ getMonthName(goal.month) }}
                      <span class="text-white/20 mx-1">/</span>
                      {{ goal.year }}
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="space-y-1">
                    <div class="text-[12px] font-black text-brand-cyan tabular-nums leading-none">
                      {{ formatCurrency(goal.nmrr) }}
                    </div>
                    <div class="text-[8px] font-bold text-white/20 uppercase tracking-widest">NMRR</div>
                  </div>
                </td>

                <td class="px-6 py-5">
                  <div class="space-y-1">
                    <div class="text-[12px] font-black text-white tabular-nums leading-none">
                      {{ formatCurrency(goal.tcv) }}
                    </div>
                    <div class="text-[8px] font-bold text-white/20 uppercase tracking-widest">TCV</div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <div class="space-y-1">
                    <div class="text-[12px] font-black text-brand-blue tabular-nums leading-none">
                      {{ formatCurrency(goal.p1) }}
                    </div>
                    <div class="text-[8px] font-bold text-white/20 uppercase tracking-widest">P1</div>
                  </div>
                </td>

                <td class="px-8 py-5 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button @click="$emit('edit', goal)"
                      class="p-2.5 rounded-xl bg-white/5 text-white/40 hover:bg-brand-cyan/20 hover:text-brand-cyan transition-all duration-300 hover:scale-110 active:scale-90 border border-transparent hover:border-brand-cyan/30 group/btn"
                      title="Editar meta">
                      <Edit3 class="h-4 w-4" />
                    </button>
                    <!-- Confirmação de exclusão em dois cliques -->
                    <button v-if="confirmDeleteId !== goal.id" @click="requestDelete(goal.id)"
                      class="p-2.5 rounded-xl bg-white/5 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition-all duration-300 hover:scale-110 active:scale-90 border border-transparent hover:border-red-500/30"
                      title="Excluir meta">
                      <Trash2 class="h-4 w-4" />
                    </button>
                    <button v-else @click="confirmDelete(goal.id)" :disabled="deleting === goal.id"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-black uppercase tracking-wider hover:bg-red-500/30 active:scale-95 transition-all disabled:opacity-50"
                      title="Clique para confirmar">
                      <Loader2 v-if="deleting === goal.id" class="h-3.5 w-3.5 animate-spin" />
                      <Trash2 v-else class="h-3.5 w-3.5" />
                      {{ deleting === goal.id ? '...' : 'Confirmar' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredGoals.length === 0">
                <td colspan="7" class="px-6 py-32 text-center">
                  <div class="flex flex-col items-center gap-4">
                    <div
                      class="h-16 w-16 rounded-[2rem] bg-brand-cyan/5 flex items-center justify-center animate-pulse">
                      <Target class="h-8 w-8 text-brand-cyan/20" />
                    </div>
                    <div class="space-y-1">
                      <p class="text-[11px] font-black uppercase tracking-[0.4em] text-white/30">
                        Nenhum objetivo para o período
                      </p>
                      <p class="text-[9px] font-bold text-white/10 uppercase tracking-widest">
                        Ajuste os filtros para ampliar a busca
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div v-if="totalPages > 1"
          class="px-8 py-4 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
          <div class="text-[10px] font-black text-white/20 uppercase tracking-widest">
            Página {{ currentPage }} de {{ totalPages }}
            <span class="mx-2">•</span>
            {{ filteredGoals.length }}
            registros
          </div>
          <div class="flex items-center gap-2">
            <button @click="currentPage > 1 ? currentPage-- : null" :disabled="currentPage === 1"
              class="p-2 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:bg-brand-cyan/10 hover:text-brand-cyan disabled:opacity-20 transition-all">
              <ChevronLeft class="h-4 w-4" />
            </button>
            <button @click="currentPage < totalPages ? currentPage++ : null" :disabled="currentPage === totalPages"
              class="p-2 rounded-lg bg-white/5 border border-white/5 text-white/40 hover:bg-brand-cyan/10 hover:text-brand-cyan disabled:opacity-20 transition-all">
              <ChevronRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Target,
  Plus,
  Edit3,
  Trash2,
  Building,
  Users,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from '@lucide/vue'
import CustomSelect from '../ui/CustomSelect.vue'
import { useSellerStore } from '../../store/seller'
import { useGoalStore } from '../../store/goals'
import { useAuthStore } from '../../store/auth'
import { useTeamStore } from '../../store/team'
import type { Goal } from '../../api/goalService'
import type { Business } from '../../gen/types/Business'

const props = defineProps<{
  goals: Goal[]
  business: Business[]
}>()

const emit = defineEmits(['add', 'edit'])

const sellerStore = useSellerStore()
const goalStore = useGoalStore()
const authStore = useAuthStore()
const teamStore = useTeamStore()

const activeType = ref('all')
const filterYear = ref(new Date().getFullYear())
const filterMonth = ref(new Date().getMonth() + 1)
const confirmDeleteId = ref<number | null>(null)
const deleting = ref<number | null>(null)
let confirmTimer: ReturnType<typeof setTimeout> | null = null

const requestDelete = (id: number) => {
  if (confirmTimer) clearTimeout(confirmTimer)
  confirmDeleteId.value = id
  // Auto-cancela confirmação após 3s
  confirmTimer = setTimeout(() => {
    confirmDeleteId.value = null
  }, 3000)
}

const confirmDelete = async (id: number) => {
  if (confirmTimer) clearTimeout(confirmTimer)
  deleting.value = id
  try {
    await goalStore.deleteGoal(id)
    confirmDeleteId.value = null
  } catch (err) {
    console.error('Erro ao excluir meta:', err)
  } finally {
    deleting.value = null
  }
}

// Pagination
const currentPage = ref(1)
const itemsPerPage = 5

const typeFilters = computed(() => {
  const filters = [
    { value: 'all', label: 'Todas' },
    { value: 'seller', label: 'Vendedores' },
  ]

  if (['admin', 'coord'].includes(authStore.user?.type || '')) {
    filters.splice(1, 0, { value: 'bu', label: 'BUs' })
  }

  return filters
})

const monthOptions = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Fev' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Abr' },
  { value: 5, label: 'Mai' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Ago' },
  { value: 9, label: 'Set' },
  { value: 10, label: 'Out' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dez' },
]

const yearOptions = [
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
  { value: 2027, label: '2027' },
  { value: 2028, label: '2028' },
]

const filteredGoals = computed(() => {
  return props.goals.filter((g) => {
    const matchType = activeType.value === 'all' || g.target_type === activeType.value
    const matchYear = g.year === filterYear.value
    const matchMonth = g.month === filterMonth.value
    return matchType && matchYear && matchMonth
  })
})

const totalPages = computed(() => Math.ceil(filteredGoals.value.length / itemsPerPage))

const paginatedGoals = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredGoals.value.slice(start, start + itemsPerPage)
})

// Reset pagination when filters change
watch([activeType, filterYear, filterMonth], () => {
  currentPage.value = 1
})

const getTargetName = (goal: Goal) => {
  if (goal.target_type === 'bu') {
    return props.business.find((b) => b.id === Number(goal.target_id))?.name || 'BU Desconhecida'
  }
  if (goal.target_type === 'team') {
    return teamStore.teams.find((t) => t.id.toString() === goal.target_id.toString())?.name || 'Equipe Desconhecida'
  }
  return (
    sellerStore.allSellers.find((s) => s.id?.toString() === goal.target_id?.toString())?.name ||
    'Vendedor Desconhecido'
  )
}

const getTargetImage = (goal: Goal) => {
  if (goal.target_type === 'bu') {
    const bu = props.business.find((b) => b.id === Number(goal.target_id))
    return bu?.img_base64 || null
  }
  return null
}

const getMonthName = (month: number | undefined) => {
  if (month === undefined) return ''
  return monthOptions.find((m) => m.value === month)?.label || ''
}

const formatCurrency = (val: string | number | null | undefined) => {
  if (val === null || val === undefined) return 'R$ 0,00'
  const num = typeof val === 'string' ? parseFloat(val) : val
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
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
