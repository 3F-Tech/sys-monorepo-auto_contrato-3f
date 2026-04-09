<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header with Action (Refined Pro Max Layout) -->
    <div
      class="flex flex-col lg:flex-row justify-between gap-8 pt-2 pb-4 items-start lg:items-center border-b border-white/5 mb-4 px-2">
      <div class="flex items-center gap-3 group/title cursor-default">
        <div
          class="p-2 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20 group-hover/title:bg-brand-cyan/20 transition-all duration-500 shadow-lg shadow-brand-cyan/5">
          <Target class="h-6 w-6 text-brand-cyan" />
        </div>
        <div class="flex flex-col">
          <h3
            class="text-2xl font-black text-white tracking-tighter leading-tight group-hover/title:text-brand-cyan transition-colors">
            Metas de Performance
          </h3>
          <div class="flex items-center gap-2">
            <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan animate-pulse"></div>
            <span class="text-[10px] text-white/30 font-black uppercase tracking-[0.25em]">
              {{ currentPeriodLabel }}
            </span>
          </div>
        </div>
      </div>

      <!-- Premium Dashboard Status Bar (Countdown) -->
      <div v-if="isCurrentMonth"
        class="flex flex-col items-center justify-center min-w-[280px] px-8 py-5 rounded-3xl bg-white/[0.02] backdrop-blur-xl border border-white/10 relative group/timer shadow-2xl shadow-black/40 hover:bg-white/[0.04] hover:border-brand-cyan/20 transition-all duration-500 z-30">
        <!-- Clipping Layer for Shimmer (Does not affect tooltip) -->
        <div class="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover/timer:animate-[shimmer_3s_infinite]">
          </div>
        </div>

        <!-- Information Icon Trigger (Icon Only) -->
        <div class="absolute top-3 right-3 z-40">
          <div class="group/info relative cursor-help">
            <Info class="h-3 w-3 text-brand-cyan/40 group-hover/info:text-brand-cyan transition-colors" />

            <!-- Tooltip Floating Card (Inverted to Bottom) -->
            <div
              class="absolute top-full right-0 mt-2 w-48 p-4 rounded-2xl bg-brand-offset/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible -translate-y-2 group-hover/info:translate-y-0 transition-all duration-300 z-[70] pointer-events-none">
              <div class="flex items-center gap-2 mb-2">
                <div class="p-1 rounded-md bg-brand-cyan/10">
                  <Clock class="h-3 w-3 text-brand-cyan" />
                </div>
                <span class="text-[10px] font-black text-white uppercase tracking-widest">Fechamento</span>
              </div>
              <p class="text-[9px] font-bold text-white/40 leading-relaxed uppercase tracking-tight">
                O ciclo de performance deste mês é vigente até às 23:59 do último dia do calendário.
              </p>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-center relative z-10 w-full mt-2">
          <span class="text-[9px] font-black text-brand-cyan/40 uppercase tracking-[0.4em] mb-4">Tempo Restante</span>
          <div class="flex items-center justify-center gap-6 w-full">
            <div class="flex flex-col items-center">
              <span class="text-4xl font-black text-white tabular-nums leading-none tracking-tighter">
                {{ countdown.days }}
              </span>
              <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-3">dias</span>
            </div>

            <div class="flex flex-col items-center">
              <span class="text-4xl font-black text-white tabular-nums leading-none tracking-tighter">
                {{ countdown.hours }}
              </span>
              <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-3">horas</span>
            </div>

            <div class="flex flex-col items-center">
              <span class="text-4xl font-black text-white tabular-nums leading-none tracking-tighter">
                {{ countdown.minutes }}
              </span>
              <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-3">min</span>
            </div>

            <div class="flex flex-col items-center">
              <span
                class="text-4xl font-black text-brand-cyan animate-pulse tabular-nums leading-none tracking-tighter">
                {{ countdown.seconds }}
              </span>
              <span class="text-[8px] font-black text-brand-cyan/20 uppercase tracking-[0.2em] mt-3">seg</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Panel -->
      <div v-if="canSetGoals" class="flex flex-col gap-2 min-w-[200px] lg:self-stretch justify-center">
        <button @click="$emit('open-costs')"
          class="group flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.05] shadow-lg shadow-black/20 hover:shadow-brand-cyan/10 active:scale-95 transition-all duration-500 transform w-full">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-white/5 group-hover:bg-brand-cyan/10 transition-colors">
              <DollarSign
                class="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
            </div>
            <div class="flex flex-col items-start gap-1">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Configurar Custos</span>
              <span class="text-[8px] font-black text-brand-cyan/40 uppercase tracking-widest leading-none">
                Ajuste Mensal
              </span>
            </div>
          </div>
          <ArrowRight
            class="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
        </button>

        <button @click="$emit('open-settings')"
          class="group flex items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-white/40 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/[0.05] shadow-lg shadow-black/20 hover:shadow-brand-cyan/10 active:scale-95 transition-all duration-500 transform w-full">
          <div class="flex items-center gap-2">
            <div class="p-2 rounded-lg bg-white/5 group-hover:bg-brand-cyan/10 transition-colors">
              <Settings2
                class="h-3.5 w-3.5 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
            </div>
            <div class="flex flex-col items-start gap-1">
              <span class="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Definir Metas</span>
              <span class="text-[8px] font-black text-brand-cyan/40 uppercase tracking-widest leading-none">
                Ajuste Mensal
              </span>
            </div>
          </div>
          <ArrowRight
            class="h-3 w-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500" />
        </button>
      </div>
    </div>

    <div class="space-y-8">
      <!-- Warning Banner when no goal (Only for Month view) -->
      <div v-if="!hasGoal && periodType === 'month'"
        class="flex flex-col sm:flex-row items-center gap-3 px-6 py-4 rounded-3xl bg-amber-500/5 border border-amber-500/10 text-amber-200/70 mb-4 mx-2 animate-in slide-in-from-top-3 duration-500 group">
        <div
          class="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 group-hover:scale-110 transition-transform duration-500">
          <AlertCircle class="h-5 w-5 text-amber-400" />
        </div>
        <div class="flex flex-col items-center sm:items-start flex-1 text-center sm:text-left">
          <span class="text-xs font-black uppercase tracking-widest text-amber-400">
            Meta não definida para este período
          </span>
          <span class="text-[10px] font-medium opacity-60 uppercase tracking-widest mt-1">
            Os indicadores abaixo refletem apenas o desempenho real acumulado.
          </span>
        </div>
        <button v-if="canSetGoals" @click="$emit('open-settings')"
          class="px-5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-200 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
          Configurar Metas Agora
        </button>
      </div>

      <!-- Goals Overview: Gráfico + Painel de Metas -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">

        <!-- Gráfico de Evolução (col-9) -->
        <div
          class="lg:col-span-9 p-6 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <div class="flex flex-wrap items-center gap-3">
              <span class="text-[10px] font-black text-white/25 uppercase tracking-[0.2em]">Evolução</span>
              <!-- Seletor de Métrica -->
              <div class="flex p-0.5 bg-white/5 rounded-xl border border-white/5">
                <button @click="chartMetric = 'p1'"
                  :class="chartMetric === 'p1' ? 'bg-brand-cyan text-brand-deep shadow-lg' : 'text-white/40 hover:text-white'"
                  class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300">P1</button>
                <button @click="chartMetric = 'tcv'"
                  :class="chartMetric === 'tcv' ? 'bg-brand-blue text-white shadow-lg' : 'text-white/40 hover:text-white'"
                  class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300">TCV</button>
                <button @click="chartMetric = 'nmrr'"
                  :class="chartMetric === 'nmrr' ? 'bg-violet-500 text-white shadow-lg' : 'text-white/40 hover:text-white'"
                  class="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300">NMRR</button>
              </div>
            </div>
            <div class="flex gap-3">
              <div class="flex items-center gap-2">
                <div class="w-2 h-0.5" :style="{ backgroundColor: metricColor, boxShadow: `0 0 8px ${metricColor}80` }">
                </div>
                <span class="text-[11px] font-bold text-white/40 uppercase tracking-tighter">Realizado</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 h-0.5 bg-white/20 border-t border-dashed border-white/40"></div>
                <span class="text-[11px] font-bold text-white/40 uppercase tracking-tighter">Planejado</span>
              </div>
              <div v-if="hasProjection" class="flex items-center gap-2">
                <div class="w-2 h-0.5 border-t border-dashed" :style="{ borderColor: metricColor + '88' }"></div>
                <span class="text-[11px] font-bold text-white/30 uppercase tracking-tighter">c/ pendentes</span>
              </div>
            </div>
          </div>

          <div class="h-[300px] relative group/chart">
            <apexchart :key="lineChartKey" type="line" height="100%" :options="lineOptions" :series="lineSeries" />
            <!-- Hint interativo -->
            <div class="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
              <span
                class="text-[8px] font-black text-white/15 uppercase tracking-[0.2em] group-hover/chart:text-white/30 transition-colors duration-500">
                Clique nos pontos para ver contratos
              </span>
            </div>
          </div>

          <!-- Granularity Switcher -->
          <div v-if="periodType !== 'all'" class="flex items-center justify-center mt-4">
            <div class="flex items-center gap-2.5 p-0.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <button @click="prevGranularity"
                class="p-2 rounded-xl text-white/50 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-colors">
                <ChevronLeft class="h-4 w-4" />
              </button>
              <div class="w-40 text-center flex items-center justify-center gap-2">
                <Calendar class="h-3.5 w-3.5 text-brand-cyan/50" />
                <span class="text-[10px] font-black uppercase tracking-widest text-white/90">
                  {{ granularityLabel }}
                </span>
              </div>
              <button @click="nextGranularity"
                class="p-2 rounded-xl text-white/50 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-colors">
                <ChevronRight class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Painel de Meta Circular (col-3) -->
        <div
          class="lg:col-span-3 p-6 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 flex flex-col items-center justify-center gap-4">

          <!-- Gráfico radial -->
          <div class="relative w-full max-w-[240px] aspect-square">
            <apexchart type="radialBar" height="100%" :options="radialOptions"
              :series="[activeMetric.hasTarget ? Math.min(activeMetric.percent, 100) : 0]" />
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <!-- Número principal: máxima presença -->
              <div class="flex items-end leading-none gap-0.5">
                <span class="text-5xl font-black tracking-tighter leading-none"
                  :class="activeMetric.hasTarget ? 'text-white' : 'text-white/15'">{{ activeMetric.hasTarget ?
                    activeMetric.percent.toFixed(0) : '--' }}</span>
                <span v-if="activeMetric.hasTarget" class="text-2xl font-black leading-none mb-1.5"
                  :class="activeMetric.percentColor">%</span>
              </div>
              <span class="text-[9px] font-black text-white/25 uppercase tracking-[0.2em] mt-2 text-center">
                {{ activeMetric.label }}
              </span>
            </div>
          </div>

          <!-- Realizado / Meta -->
          <div class="grid grid-cols-2 gap-3 w-full pt-4 border-t border-white/[0.06]">
            <div class="text-center space-y-1">
              <p class="text-[8px] font-black text-white/20 uppercase tracking-widest">Realizado</p>
              <p class="text-sm font-black leading-none" :class="activeMetric.percentColor">
                {{ formatCurrency(activeMetric.actual) }}
              </p>
            </div>
            <div class="text-center space-y-1 border-l border-white/[0.06]">
              <p class="text-[8px] font-black text-white/20 uppercase tracking-widest">Meta Total</p>
              <p class="text-sm font-black leading-none text-white/50">
                {{ formatCurrency(activeMetric.target) }}
              </p>
            </div>
          </div>

          <!-- Status -->
          <div class="text-center">
            <span v-if="!activeMetric.hasTarget" class="text-[9px] text-white/20 uppercase tracking-widest">
              Meta não definida
            </span>
            <span v-else-if="activeMetric.remaining > 0" class="text-sm font-black uppercase tracking-wide"
              :class="activeMetric.percentColor">Falta {{ formatCurrency(activeMetric.remaining) }}</span>
            <span v-else class="text-sm font-black text-brand-cyan uppercase tracking-wide animate-pulse">
              Meta Batida!
            </span>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Modal: Contratos do Período -->
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="selectedPeriodData" @click.self="closeContractsModal"
        class="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div
          class="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-[2.5rem] bg-brand-offset border border-white/10 shadow-2xl overflow-hidden">
          <!-- Header -->
          <div class="flex items-center justify-between px-7 py-5 border-b border-white/[0.06]">
            <div>
              <p class="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] mb-1">Contratos Fechados</p>
              <h4 class="text-lg font-black text-white tracking-tight">{{ selectedPeriodData.label }}</h4>
            </div>
            <button @click="closeContractsModal"
              class="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Contracts list -->
          <div class="overflow-y-auto flex-1 px-7 py-4 space-y-3">
            <div v-for="c in selectedPeriodData.contracts" :key="c.id"
              class="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-3">
              <!-- Title + seller/BU row -->
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-black text-white leading-tight truncate">{{ c.title || '(sem título)' }}</p>
                  <p class="text-[10px] font-bold text-white/30 uppercase tracking-wide mt-0.5">
                    {{ getSellerName(c.seller_id) }} · {{ getBuName(c.bu_id) }}
                  </p>
                </div>
                <span
                  class="text-[9px] font-black text-brand-cyan/70 bg-brand-cyan/10 border border-brand-cyan/20 rounded-full px-2.5 py-1 whitespace-nowrap shrink-0">
                  {{ formatDate(c.signed_date) }}
                </span>
              </div>
              <!-- Financial metrics -->
              <div class="grid grid-cols-3 gap-2">
                <div class="bg-white/[0.03] rounded-xl p-2.5 text-center">
                  <p class="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Mensalidade</p>
                  <p class="text-xs font-black text-white/70">{{ formatCurrency(parseFloat(c.monthly_fee) || 0) }}</p>
                </div>
                <div class="bg-white/[0.03] rounded-xl p-2.5 text-center">
                  <p class="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">Implementação</p>
                  <p class="text-xs font-black text-white/70">{{ formatCurrency(parseFloat(c.implementation_fee) || 0)
                    }}</p>
                </div>
                <div class="bg-white/[0.03] rounded-xl p-2.5 text-center">
                  <p class="text-[8px] font-black text-white/20 uppercase tracking-widest mb-1">P1</p>
                  <p class="text-xs font-black text-brand-cyan">{{ formatCurrency(parseFloat(c.first_payment_amount) ||
                    parseFloat(c.monthly_fee) || 0) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="px-7 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <span class="text-[10px] font-black text-white/20 uppercase tracking-widest">
              {{ selectedPeriodData.contracts.length }} contrato{{ selectedPeriodData.contracts.length !== 1 ? 's' : ''
              }}
            </span>
            <button @click="closeContractsModal"
              class="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors active:scale-95">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import {
  Settings2,
  DollarSign,
  Clock,
  Info,
  ArrowRight,
  Target,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  X,
} from '@lucide/vue'
import VueApexCharts from 'vue3-apexcharts'
import { useAuthStore } from '../../store/auth'
import { useSellerStore } from '../../store/seller'
import { useBuStore } from '../../store/bu'
import type { Goal } from '../../api/goalService'

const apexchart = VueApexCharts

const props = defineProps<{
  goal: Goal | null
  goals: Goal[]
  periodType: 'month' | 'quarter' | 'year' | 'all'
  currentRange: {
    p1: { start: Date; end: Date }
    gen: { start: Date; end: Date }
    months: { m: number; y: number }[]
  }
  actuals: {
    p1: number
    tcv: number
    nmrr: number
    implementation: number
    monthly: number
  }
  contracts: any[]
}>()

defineEmits(['open-settings', 'open-periods', 'open-costs'])

const authStore = useAuthStore()
const sellerStore = useSellerStore()
const buStore = useBuStore()
const canSetGoals = computed(() => {
  const type = authStore.user?.type
  return type === 'admin' || type === 'head' || type === 'coord'
})

const hasGoal = computed(() => !!props.goal)
const currentPeriodLabel = computed(() => {
  if (!props.currentRange?.months) return 'Carregando...'

  if (props.periodType === 'month') {
    const [year, month] = props.currentRange.months[0]
      ? [props.currentRange.months[0].y, props.currentRange.months[0].m]
      : [new Date().getFullYear(), new Date().getMonth() + 1]
    const d = new Date(year, month - 1, 1)
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  }

  if (props.periodType === 'all') return 'Geral (Todo o histórico)'

  const months = props.currentRange.months
  if (months.length > 0) {
    const first = new Date(months[0].y, months[0].m - 1, 1)
    const last = new Date(months[months.length - 1].y, months[months.length - 1].m - 1, 1)

    if (props.periodType === 'year') return `Ano de ${months[0].y}`
    return `${first.toLocaleDateString('pt-BR', { month: 'short' })} - ${last.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}`
  }

  return 'Período Selecionado'
})

const isCurrentMonth = computed(() => {
  if (props.periodType !== 'month' || !props.currentRange?.months) return false
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  const displayMonth = props.currentRange.months[0]?.m
  const displayYear = props.currentRange.months[0]?.y

  return displayMonth === currentMonth && displayYear === currentYear
})

// Helper Functions
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(val)
}

const formatCompactCurrency = (val: number) => {
  if (Math.abs(val) >= 1000000) return `R$ ${(val / 1000000).toFixed(1).replace('.0', '').replace('.', ',')}M`
  if (Math.abs(val) >= 1000) return `R$ ${(val / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k`
  return `R$ ${Math.round(val)}`
}

// Countdown Logic
const countdown = ref({
  days: '00',
  hours: '00',
  minutes: '00',
  seconds: '00',
})
let timerInterval: any = null

const updateCountdown = () => {
  const now = new Date()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
  const diff = lastDay.getTime() - now.getTime()

  if (diff <= 0) {
    countdown.value = { days: '00', hours: '00', minutes: '00', seconds: '00' }
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24))
      .toString()
      .padStart(2, '0'),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      .toString()
      .padStart(2, '0'),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      .toString()
      .padStart(2, '0'),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
      .toString()
      .padStart(2, '0'),
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && selectedPeriodData.value) closeContractsModal()
}

onMounted(() => {
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  window.removeEventListener('keydown', onKeydown)
})

const granularityOptions = computed(() => {
  if (props.periodType === 'month') {
    const m = props.currentRange?.months?.[0]
    const weeks = m ? computeCalendarWeeks(m.y, m.m) : []
    const options = [{ value: 'all', label: 'Mês Inteiro' }]
    weeks.forEach((_: any, i: number) => {
      options.push({ value: `week${i + 1}`, label: `Semana ${i + 1}` })
    })
    return options
  }

  if (props.periodType === 'all') {
    const options = [{ value: 'all', label: 'Geral' }]
    const curYear = new Date().getFullYear()
    for (let y = 2026; y <= curYear; y++) {
      options.push({ value: `year_${y}`, label: String(y) })
    }
    return options
  }

  const options = [
    {
      value: 'all',
      label: props.periodType === 'quarter' ? 'Trimestre' : props.periodType === 'year' ? 'Ano Inteiro' : 'Geral',
    },
  ]

    ; (props.currentRange?.months || []).forEach((mObj) => {
      const d = new Date(mObj.y, mObj.m - 1, 1)
      const label = d.toLocaleDateString('pt-BR', { month: 'long' })
      options.push({ value: `month_${mObj.m}_${mObj.y}`, label: label.charAt(0).toUpperCase() + label.slice(1) })
    })

  return options
})

const getDefaultGranularity = () => {
  // Para mês, tenta pegar a semana atual
  if (props.periodType === 'month') {
    const m = props.currentRange?.months?.[0]
    const goalMonth = m?.m || props.goal?.month || new Date().getMonth() + 1
    const goalYear = m?.y || props.goal?.year || new Date().getFullYear()
    const startDate = new Date(goalYear, goalMonth - 1, 1)
    const endDate = new Date(goalYear, goalMonth, 0, 23, 59, 59)
    const today = new Date()

    if (today < startDate || today > endDate) return 'all'

    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const weeks = computeCalendarWeeks(goalYear, goalMonth)
    const weekNum = weeks.findIndex((w) => diffDays >= w.start && diffDays <= w.end)
    return weekNum >= 0 ? `week${weekNum + 1}` : 'all'
  }

  if (props.periodType === 'all') {
    return 'all'
  }

  return 'all'
}

// Component State
const selectedGranularity = ref(getDefaultGranularity())

const granularityLabel = computed(() => {
  return granularityOptions.value.find((o) => o.value === selectedGranularity.value)?.label || 'Selecionar'
})

const prevGranularity = () => {
  const currentIndex = granularityOptions.value.findIndex((o) => o.value === selectedGranularity.value)
  if (currentIndex === 0) {
    selectedGranularity.value = granularityOptions.value[granularityOptions.value.length - 1].value
  } else {
    selectedGranularity.value = granularityOptions.value[currentIndex - 1].value
  }
}

const nextGranularity = () => {
  const currentIndex = granularityOptions.value.findIndex((o) => o.value === selectedGranularity.value)
  if (currentIndex === granularityOptions.value.length - 1) {
    selectedGranularity.value = granularityOptions.value[0].value
  } else {
    selectedGranularity.value = granularityOptions.value[currentIndex + 1].value
  }
}

const chartMetric = ref<'p1' | 'tcv' | 'nmrr'>('p1')

const metricColor = computed(() => {
  if (chartMetric.value === 'tcv') return '#0094ff'
  if (chartMetric.value === 'nmrr') return '#a78bfa'
  return '#00d4ff'
})

const activeMetric = computed(() =>
  displayMetrics.value.find((m) => m.key === chartMetric.value) || displayMetrics.value[0]
)

const getHexFromBarColor = (barColor: string): string => {
  if (barColor.includes('rose')) return '#f43f5e'
  if (barColor.includes('amber')) return '#fbbf24'
  if (barColor.includes('emerald')) return '#10b981'
  if (barColor.includes('blue-5')) return '#3b82f6'
  return '#334155'
}

const radialOptions = computed(() => {
  const color = getHexFromBarColor(activeMetric.value.barColor)
  return {
    chart: { id: 'goal-radial-bar', sparkline: { enabled: true } },
    colors: [color],
    plotOptions: {
      radialBar: {
        hollow: { size: '70%' },
        track: { background: 'rgba(255,255,255,0.04)' },
        dataLabels: { show: false },
      },
    },
    stroke: { lineCap: 'round' as const },
  }
})

const lineChartKey = ref(0)
watch(
  () => [props.goal, props.periodType, props.currentRange],
  () => {
    lineChartKey.value++
    selectedGranularity.value = getDefaultGranularity()
  },
  { deep: true, immediate: true },
)
watch(
  () => selectedGranularity.value,
  () => lineChartKey.value++,
)
watch(
  () => chartMetric.value,
  () => lineChartKey.value++,
)

const displayMetrics = computed(() => {
  const goal = props.goal || { p1: 0, tcv: 0, nmrr: 0 }
  const metrics = [
    {
      key: 'p1',
      label: 'Meta P1',
      target: Number(goal.p1 || 0),
      actual: props.actuals.p1,
    },
    {
      key: 'tcv',
      label: 'Meta TCV',
      target: Number(goal.tcv || 0),
      actual: props.actuals.tcv,
    },
    {
      key: 'nmrr',
      label: 'Meta NMRR',
      target: Number(goal.nmrr || 0),
      actual: props.actuals.nmrr,
    },
  ]

  return metrics.map((m) => {
    const hasTarget = m.target > 0
    const percent = hasTarget ? (m.actual / m.target) * 100 : 0
    const remaining = Math.max(0, m.target - m.actual)
    let barColor = ''
    let percentColor = ''

    if (!hasTarget) {
      // Estado Neutro: Sem meta definida
      barColor = 'bg-white/10'
      percentColor = 'text-white/20'
    } else if (percent < 80) {
      // Vermelho: 0 até 79%
      barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
      percentColor = 'text-rose-400'
    } else if (percent < 100) {
      // Amarelo: 80 até 99%
      barColor = 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
      percentColor = 'text-amber-400'
    } else if (percent <= 110) {
      // Verde: 100 até 110%
      barColor = 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
      percentColor = 'text-emerald-400'
    } else {
      // Azul: Acima de 110%
      barColor = 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
      percentColor = 'text-blue-400'
    }
    return { ...m, percent, remaining, barColor, percentColor, hasTarget }
  })
})


// Helper: calcula semanas do calendário (Domingo→Sábado) para um mês
function computeCalendarWeeks(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const totalDays = new Date(year, month, 0).getDate()
  const firstDayOfWeek = startDate.getDay() // 0=Dom, 6=Sáb
  const weeks: { start: number; end: number }[] = []
  let dayIdx = 0
  // Primeira semana parcial (se o mês não começa no domingo)
  if (firstDayOfWeek !== 0) {
    const daysUntilSat = 6 - firstDayOfWeek
    weeks.push({ start: 0, end: Math.min(daysUntilSat, totalDays - 1) })
    dayIdx = daysUntilSat + 1
  }
  // Semanas completas (Dom→Sáb) + última parcial
  while (dayIdx < totalDays) {
    weeks.push({ start: dayIdx, end: Math.min(dayIdx + 6, totalDays - 1) })
    dayIdx += 7
  }
  return weeks
}

const dailyData = computed(() => {
  // Se estivermos em uma granularidade de Mês Individual (mesmo dentro de trimestre/ano)
  const isIndividualMonth = selectedGranularity.value.startsWith('month_')
  const isMonthMode = props.periodType === 'month' || isIndividualMonth

  if (isMonthMode) {
    let goalParams: { month: number; year: number }
    if (isIndividualMonth) {
      const [_, m, y] = selectedGranularity.value.split('_').map(Number)
      goalParams = { month: m, year: y }
    } else {
      goalParams = {
        month: props.currentRange?.months[0]?.m || props.goal?.month || new Date().getMonth() + 1,
        year: props.currentRange?.months[0]?.y || props.goal?.year || new Date().getFullYear(),
      }
    }

    // Janela: dia 1 do mês até dia 6 do mês seguinte (mesmo threshold do card de meta)
    const startDate = new Date(goalParams.year, goalParams.month - 1, 1)
    const lastDayOfMonth = new Date(goalParams.year, goalParams.month, 0) // último dia do mês
    const totalDays = Math.round((lastDayOfMonth.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const dailyActuals = new Array(totalDays).fill(0)
    const dailyActualsTcv = new Array(totalDays).fill(0)
    const dailyActualsNmrr = new Array(totalDays).fill(0)

    const startOfMonth = new Date(goalParams.year, goalParams.month - 1, 1)
    const endOfMonth = new Date(goalParams.year, goalParams.month, 0, 23, 59, 59)
    const thresholdP1 = new Date(goalParams.year, goalParams.month, 6, 23, 59, 59)

    if (props.contracts.length) {
      props.contracts.forEach((c) => {
        if (!c.signed) return
        const rawSign = c.signed_date || c.created_at || ''
        const signStr = rawSign.includes('T') ? rawSign.split('T')[0] : rawSign
        const signDt = new Date(signStr + 'T12:00:00')
        if (signDt < startOfMonth || signDt > endOfMonth) return
        const diffDays = Math.floor((signDt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays < 0 || diffDays >= totalDays) return
        // TCV e NMRR: sem threshold de pagamento
        dailyActualsTcv[diffDays] += (parseFloat(c.monthly_fee) || 0) * (c.contractual_term || 12) + (parseFloat(c.implementation_fee) || 0)
        dailyActualsNmrr[diffDays] += (parseFloat(c.implementation_fee) || 0) / (c.contractual_term || 12) + (parseFloat(c.monthly_fee) || 0)
        // P1: com threshold de pagamento
        if (c.first_payment_date) {
          const rawPay = c.first_payment_date as string
          const payStr = rawPay.includes('T') ? rawPay.split('T')[0] : rawPay
          const payDt = new Date(payStr + 'T12:00:00')
          if (payDt > thresholdP1) return
        }
        let val = parseFloat(c.first_payment_amount) || 0
        if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
        dailyActuals[diffDays] += val
      })
    }

    // Projeção: contratos pendentes (aprovados, não assinados, não cancelados)
    const dailyPending = new Array(totalDays).fill(0)
    const dailyPendingTcv = new Array(totalDays).fill(0)
    const dailyPendingNmrr = new Array(totalDays).fill(0)
    props.contracts.forEach((c) => {
      if (c.signed || c.canceled_at) return
      const rawDate = c.created_at || ''
      const dateStr = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
      const dateDt = new Date(dateStr + 'T12:00:00')
      if (dateDt < startOfMonth || dateDt > endOfMonth) return
      const diffDays = Math.floor((dateDt.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays < 0 || diffDays >= totalDays) return
      dailyPendingTcv[diffDays] += (parseFloat(c.monthly_fee) || 0) * (c.contractual_term || 12) + (parseFloat(c.implementation_fee) || 0)
      dailyPendingNmrr[diffDays] += (parseFloat(c.implementation_fee) || 0) / (c.contractual_term || 12) + (parseFloat(c.monthly_fee) || 0)
      if (c.first_payment_date) {
        const rawPay = c.first_payment_date as string
        const payStr = rawPay.includes('T') ? rawPay.split('T')[0] : rawPay
        if (new Date(payStr + 'T12:00:00') > thresholdP1) return
      }
      let val = parseFloat(c.first_payment_amount) || 0
      if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
      dailyPending[diffDays] += val
    })

    const cumulate = (arr: number[]) => {
      const r = [...arr]
      r.reduce((acc, val, i, a) => { a[i] = acc + val; return a[i] }, 0)
      return r
    }
    const cumulativeActuals = cumulate(dailyActuals)
    const cumulativeTcv = cumulate(dailyActualsTcv)
    const cumulativeNmrr = cumulate(dailyActualsNmrr)
    const cumPending = cumulate(dailyPending)
    const cumPendingTcv = cumulate(dailyPendingTcv)
    const cumPendingNmrr = cumulate(dailyPendingNmrr)
    const cumulativeProjection = cumulativeActuals.map((v, i) => Number((v + cumPending[i]).toFixed(2)))
    const cumulativeProjectionTcv = cumulativeTcv.map((v, i) => Number((v + cumPendingTcv[i]).toFixed(2)))
    const cumulativeProjectionNmrr = cumulativeNmrr.map((v, i) => Number((v + cumPendingNmrr[i]).toFixed(2)))

    // Meta específica para este mês
    const monthGoal = isIndividualMonth
      ? props.goals.find((g) => g.month === goalParams.month && g.year === goalParams.year)
      : props.goal

    const totalGoal = Number(monthGoal?.p1 || 0)
    const mVals = monthGoal
      ? [monthGoal.p1_period_1, monthGoal.p1_period_2, monthGoal.p1_period_3, monthGoal.p1_period_4]
      : [null, null, null, null]
    let p1, p2, p3, p4
    if (mVals.every((v) => v == null)) {
      p1 = totalGoal / 4
      p2 = p1 * 2
      p3 = p1 * 3
      p4 = totalGoal
    } else {
      p1 = mVals[0] != null ? Number(mVals[0]) : totalGoal / 4
      p2 = mVals[1] != null ? Number(mVals[1]) : (totalGoal / 4) * 2
      p3 = mVals[2] != null ? Number(mVals[2]) : (totalGoal / 4) * 3
      p4 = mVals[3] != null ? Number(mVals[3]) : totalGoal
    }

    const calendarWeeks = computeCalendarWeeks(goalParams.year, goalParams.month)

    const dailyTargets = new Array(totalDays).fill(0)
    const checkpoints = [
      { day: 0, val: 0 },
      { day: Math.round(totalDays * 0.25), val: p1 },
      { day: Math.round(totalDays * 0.5), val: p2 },
      { day: Math.round(totalDays * 0.75), val: p3 },
      { day: totalDays - 1, val: p4 },
    ]
    for (let i = 0; i < checkpoints.length - 1; i++) {
      const startObj = checkpoints[i]
      const endObj = checkpoints[i + 1]
      const daysDiff = endObj.day - startObj.day
      const valDiff = endObj.val - startObj.val
      for (let d = startObj.day; d <= endObj.day; d++) {
        if (d === startObj.day) dailyTargets[d] = startObj.val
        else dailyTargets[d] = startObj.val + (valDiff / daysDiff) * (d - startObj.day)
      }
    }

    const categories = []
    const weekDays = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB']
    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const dateStr = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
      categories.push([dateStr, weekDays[d.getDay()]])
    }

    // Targets TCV e NMRR: interpolação linear simples (sem breakpoints trimestrais)
    const tcvGoalTotal = Number(monthGoal?.tcv || 0)
    const nmrrGoalTotal = Number(monthGoal?.nmrr || 0)
    const dailyTargetsTcv = new Array(totalDays).fill(0).map((_, i) =>
      Number((tcvGoalTotal * (i + 1) / totalDays).toFixed(2))
    )
    const dailyTargetsNmrr = new Array(totalDays).fill(0).map((_, i) =>
      Number((nmrrGoalTotal * (i + 1) / totalDays).toFixed(2))
    )

    return { cumulativeActuals, cumulativeTcv, cumulativeNmrr, cumulativeProjection, cumulativeProjectionTcv, cumulativeProjectionNmrr, dailyTargets, dailyTargetsTcv, dailyTargetsNmrr, categories, p1, p2, p3, p4, totalDays, calendarWeeks }
  } else {
    // Range mode (Quarter/Year/All)
    let monthsRange = props.currentRange?.months || []

    if (props.periodType === 'all' && selectedGranularity.value.startsWith('year_')) {
      const targetYear = parseInt(selectedGranularity.value.split('_')[1])
      monthsRange = monthsRange.filter((m) => m.y === targetYear)
    }
    const categories: string[] = []
    const monthlyActuals: number[] = []
    const monthlyTargets: number[] = []
    const monthlyActualsTcv: number[] = []
    const monthlyTargetsTcv: number[] = []
    const monthlyActualsNmrr: number[] = []
    const monthlyTargetsNmrr: number[] = []
    const monthlyProjection: number[] = []
    const monthlyProjectionTcv: number[] = []
    const monthlyProjectionNmrr: number[] = []

    let cumActual = 0, cumTarget = 0, cumTcv = 0, cumTargetTcv = 0, cumNmrr = 0, cumTargetNmrr = 0
    let cumPendingP1 = 0, cumPendingTcv = 0, cumPendingNmrr = 0

    monthsRange.forEach((mObj) => {
      const d = new Date(mObj.y, mObj.m - 1, 1)
      categories.push(d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase())
      const startOfMonth = new Date(mObj.y, mObj.m - 1, 1)
      const endOfMonth = new Date(mObj.y, mObj.m, 0, 23, 59, 59)
      const thresholdP1 = new Date(mObj.y, mObj.m, 6, 23, 59, 59)

      const signedInMonth = props.contracts.filter((c) => {
        if (!c.signed) return false
        const rawSign = c.signed_date || c.created_at || ''
        const signStr = rawSign.includes('T') ? rawSign.split('T')[0] : rawSign
        const signDt = new Date(signStr + 'T12:00:00')
        return signDt >= startOfMonth && signDt <= endOfMonth
      })

      const monthActual = signedInMonth.reduce((acc, c) => {
        if (c.first_payment_date) {
          const rawPay = c.first_payment_date
          const payStr = rawPay.includes('T') ? rawPay.split('T')[0] : rawPay
          if (new Date(payStr + 'T12:00:00') > thresholdP1) return acc
        }
        let val = parseFloat(c.first_payment_amount) || 0
        if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
        return acc + val
      }, 0)

      const monthTcv = signedInMonth.reduce((acc, c) =>
        acc + (parseFloat(c.monthly_fee) || 0) * (c.contractual_term || 12) + (parseFloat(c.implementation_fee) || 0), 0)

      const monthNmrr = signedInMonth.reduce((acc, c) =>
        acc + (parseFloat(c.implementation_fee) || 0) / (c.contractual_term || 12) + (parseFloat(c.monthly_fee) || 0), 0)

      cumActual += monthActual
      monthlyActuals.push(Number(cumActual.toFixed(2)))
      cumTcv += monthTcv
      monthlyActualsTcv.push(Number(cumTcv.toFixed(2)))
      cumNmrr += monthNmrr
      monthlyActualsNmrr.push(Number(cumNmrr.toFixed(2)))

      const goalForMonth = props.goals.find((g) => g.month === mObj.m && g.year === mObj.y)
      cumTarget += Number(goalForMonth?.p1 || 0)
      monthlyTargets.push(Number(cumTarget.toFixed(2)))
      cumTargetTcv += Number(goalForMonth?.tcv || 0)
      monthlyTargetsTcv.push(Number(cumTargetTcv.toFixed(2)))
      cumTargetNmrr += Number(goalForMonth?.nmrr || 0)
      monthlyTargetsNmrr.push(Number(cumTargetNmrr.toFixed(2)))

      const pendingInMonth = props.contracts.filter((c) => {
        if (c.signed || c.canceled_at) return false
        const rawDate = c.created_at || ''
        const dateStr = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
        const dateDt = new Date(dateStr + 'T12:00:00')
        return dateDt >= startOfMonth && dateDt <= endOfMonth
      })
      const monthPendingP1 = pendingInMonth.reduce((acc, c) => {
        if (c.first_payment_date) {
          const rawPay = c.first_payment_date
          const payStr = rawPay.includes('T') ? rawPay.split('T')[0] : rawPay
          if (new Date(payStr + 'T12:00:00') > thresholdP1) return acc
        }
        let val = parseFloat(c.first_payment_amount) || 0
        if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
        return acc + val
      }, 0)
      const monthPendingTcv = pendingInMonth.reduce((acc, c) =>
        acc + (parseFloat(c.monthly_fee) || 0) * (c.contractual_term || 12) + (parseFloat(c.implementation_fee) || 0), 0)
      const monthPendingNmrr = pendingInMonth.reduce((acc, c) =>
        acc + (parseFloat(c.implementation_fee) || 0) / (c.contractual_term || 12) + (parseFloat(c.monthly_fee) || 0), 0)
      cumPendingP1 += monthPendingP1
      cumPendingTcv += monthPendingTcv
      cumPendingNmrr += monthPendingNmrr
      monthlyProjection.push(Number((cumActual + cumPendingP1).toFixed(2)))
      monthlyProjectionTcv.push(Number((cumTcv + cumPendingTcv).toFixed(2)))
      monthlyProjectionNmrr.push(Number((cumNmrr + cumPendingNmrr).toFixed(2)))
    })

    return {
      cumulativeActuals: monthlyActuals,
      cumulativeTcv: monthlyActualsTcv,
      cumulativeNmrr: monthlyActualsNmrr,
      cumulativeProjection: monthlyProjection,
      cumulativeProjectionTcv: monthlyProjectionTcv,
      cumulativeProjectionNmrr: monthlyProjectionNmrr,
      dailyTargets: monthlyTargets,
      dailyTargetsTcv: monthlyTargetsTcv,
      dailyTargetsNmrr: monthlyTargetsNmrr,
      categories,
      totalDays: monthsRange.length,
    }
  }
})

const chartData = computed(() => {
  const data = dailyData.value as any
  const cumulativeActuals = chartMetric.value === 'tcv' ? data.cumulativeTcv :
    chartMetric.value === 'nmrr' ? data.cumulativeNmrr : data.cumulativeActuals
  const dailyTargets = chartMetric.value === 'tcv' ? data.dailyTargetsTcv :
    chartMetric.value === 'nmrr' ? data.dailyTargetsNmrr : data.dailyTargets
  const cumulativeProjection: number[] = chartMetric.value === 'tcv' ? (data.cumulativeProjectionTcv || []) :
    chartMetric.value === 'nmrr' ? (data.cumulativeProjectionNmrr || []) : (data.cumulativeProjection || [])
  const { categories, totalDays } = data
  const isIndividualMonth = selectedGranularity.value.startsWith('month_')

  if (props.periodType !== 'month' && !isIndividualMonth) {
    return { categories, actuals: cumulativeActuals, targets: dailyTargets, projection: cumulativeProjection }
  }

  const { p1, p2, p3, p4 } = data

  const weeks = data.calendarWeeks || []

  // Visão "Mês Inteiro" ou mês individual dentro de trimestre
  if (selectedGranularity.value === 'all' || isIndividualMonth) {
    return {
      categories: weeks.map((w: any) => `D${w.start + 1}-${w.end + 1}`),
      actuals: weeks.map((w: any) => Number((cumulativeActuals[w.end] || 0).toFixed(2))),
      targets: weeks.map((w: any) => Number((dailyTargets[w.end] || 0).toFixed(2))),
      projection: weeks.map((w: any) => Number((cumulativeProjection[w.end] || 0).toFixed(2))),
    }
  }

  // Visão de semana individual (week1, week2, ...)
  const weekIdx = parseInt(selectedGranularity.value.replace('week', '')) - 1
  const week = weeks[weekIdx]
  if (!week) {
    return { categories: [], actuals: [], targets: [], projection: [] }
  }

  // Âncora: inclui último dia da semana anterior (exceto semana 1)
  let startIdx = week.start
  if (weekIdx > 0) {
    startIdx = weeks[weekIdx - 1].end
  }

  return {
    categories: (categories as any).slice(startIdx, week.end + 1),
    actuals: cumulativeActuals.slice(startIdx, week.end + 1).map((v: number) => Number(v.toFixed(2))),
    targets: dailyTargets.slice(startIdx, week.end + 1).map((v: number) => Number(v.toFixed(2))),
    projection: cumulativeProjection.slice(startIdx, week.end + 1).map((v: number) => Number(v.toFixed(2))),
  }
})

// Handler estável para o chart.events.click (fora do computed para o ApexCharts não perder a referência)
const chartClickEvents = {
  click: (_event: any, _ctx: any, config: any) => {
    if (config.dataPointIndex >= 0) {
      onChartDataPointClick(_event, _ctx, config)
    }
  },
}

// --- Modal: Contratos do Período ---
const selectedPeriodData = ref<{ label: string; contracts: any[] } | null>(null)

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '–'
  const str = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  const [year, month, day] = str.split('-')
  return `${day}/${month}/${year}`
}

function getSellerName(sellerId: string | undefined): string {
  if (!sellerId) return '–'
  const s = sellerStore.allSellers.find((s) => s.id?.toString() === sellerId?.toString())
  return s?.name || '–'
}

function getBuName(buId: number | undefined): string {
  if (!buId) return '–'
  const b = buStore.businesses.find((b) => b.id === buId)
  return b?.name || '–'
}

function closeContractsModal() {
  selectedPeriodData.value = null
  document.body.style.overflow = ''
}

function getContractsForPeriod(start: Date, end: Date): any[] {
  return props.contracts.filter((c) => {
    const raw = c.signed_date || c.created_at || ''
    const str = raw.includes('T') ? raw.split('T')[0] : raw
    const dt = new Date(str + 'T12:00:00')
    return dt >= start && dt <= end
  })
}

function getDateRangeForIndex(idx: number): { start: Date; end: Date; label: string } | null {
  const isIndividualMonth = selectedGranularity.value.startsWith('month_')
  const isMonthMode = props.periodType === 'month' || isIndividualMonth

  let start: Date
  let end: Date
  let label: string

  if (isMonthMode) {
    let goalParams: { month: number; year: number }
    if (isIndividualMonth) {
      const parts = selectedGranularity.value.split('_').map(Number)
      goalParams = { month: parts[1], year: parts[2] }
    } else {
      const m = props.currentRange?.months?.[0]
      goalParams = {
        month: m?.m || props.goal?.month || new Date().getMonth() + 1,
        year: m?.y || props.goal?.year || new Date().getFullYear(),
      }
    }
    const startDate = new Date(goalParams.year, goalParams.month - 1, 1)
    const weeks = computeCalendarWeeks(goalParams.year, goalParams.month)
    const fmt2d = (d: Date) =>
      `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`

    if (selectedGranularity.value === 'all' || isIndividualMonth) {
      const week = weeks[idx]
      if (!week) return null
      start = new Date(startDate.getTime() + week.start * 24 * 60 * 60 * 1000)
      end = new Date(startDate.getTime() + week.end * 24 * 60 * 60 * 1000)
      end.setHours(23, 59, 59, 999)
      label = `Semana ${idx + 1} · ${fmt2d(start)} – ${fmt2d(end)}`
    } else {
      const weekIdx = parseInt(selectedGranularity.value.replace('week', '')) - 1
      const week = weeks[weekIdx]
      if (!week) return null
      let startIdx = week.start
      if (weekIdx > 0) startIdx = weeks[weekIdx - 1].end
      const dayOffset = startIdx + idx
      start = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000)
      end = new Date(start)
      end.setHours(23, 59, 59, 999)
      label = `${fmt2d(start)}/${start.getFullYear()}`
    }
  } else {
    let monthsRange = props.currentRange?.months || []
    if (props.periodType === 'all' && selectedGranularity.value.startsWith('year_')) {
      const targetYear = parseInt(selectedGranularity.value.split('_')[1])
      monthsRange = monthsRange.filter((m) => m.y === targetYear)
    }
    const mObj = monthsRange[idx]
    if (!mObj) return null
    start = new Date(mObj.y, mObj.m - 1, 1)
    end = new Date(mObj.y, mObj.m, 0, 23, 59, 59, 999)
    const d = new Date(mObj.y, mObj.m - 1, 1)
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
  }

  return { start: start!, end: end!, label }
}

const pointsWithContracts = computed(() =>
  chartData.value.actuals.map((val, idx) => {
    if (val === null) return false
    const range = getDateRangeForIndex(idx)
    if (!range) return false
    return getContractsForPeriod(range.start, range.end).length > 0
  })
)

function onChartDataPointClick(_event: any, _ctx: any, config: any) {
  const idx = config.dataPointIndex
  if (idx < 0) return

  const range = getDateRangeForIndex(idx)
  if (!range) return

  const contracts = getContractsForPeriod(range.start, range.end)
  if (contracts.length === 0) return

  selectedPeriodData.value = { label: range.label, contracts }
  document.body.style.overflow = 'hidden'
}

const hasProjection = computed(() =>
  props.contracts.some((c) => !c.signed && !c.canceled_at)
)

const lineOptions = computed(() => {
  const strokeWidths = [4]
  const strokeDashes = [0]
  const colors = [metricColor.value]
  const markerStrokeColors = [metricColor.value]
  const markerFillColors = ['#0b0f1a']

  // discrete: pontos SEM contratos ficam menores e acinzentados
  const discreteMarkers = pointsWithContracts.value
    .map((hasC, idx) => hasC ? null : {
      seriesIndex: 0,
      dataPointIndex: idx,
      fillColor: 'rgba(255,255,255,0.04)',
      strokeColor: 'rgba(255,255,255,0.15)',
      size: 4,
      shape: 'circle' as const,
    })
    .filter(Boolean)

  if (hasGoal.value) {
    strokeWidths.push(2)
    strokeDashes.push(5)
    colors.push('rgba(255,255,255,0.2)')
    markerStrokeColors.push('transparent')
    markerFillColors.push('transparent')
  }

  if (hasProjection.value) {
    strokeWidths.push(1)
    strokeDashes.push(4)
    const hex = metricColor.value.replace('#', '')
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    colors.push(`rgba(${r},${g},${b},0.35)`)
    markerStrokeColors.push('transparent')
    markerFillColors.push('transparent')
  }

  return {
    theme: { mode: 'dark' as const },
    chart: {
      id: 'p1-evolution-line',
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: 'Outfit, sans-serif',
      background: 'transparent',
      events: chartClickEvents,
      dropShadow: {
        enabled: true,
        top: 10,
        left: 0,
        blur: 15,
        opacity: 0.2,
        color: metricColor.value,
      },
    },
    stroke: { curve: 'smooth' as const, width: strokeWidths, dashArray: strokeDashes },
    colors,
    grid: {
      borderColor: 'rgba(255,255,255,0.05)',
      padding: { left: 10, right: 10, top: 0, bottom: 0 },
    },
    xaxis: {
      categories: chartData.value.categories,
      labels: {
        style: {
          colors: 'rgba(255,255,255,0.3)',
          fontSize: '10px',
          fontWeight: 900,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      decimalsInFloat: 0,
      labels: {
        style: { colors: 'rgba(255,255,255,0.2)', fontSize: '9px' },
        formatter: (val: number) => {
          if (val === undefined || val === null) return 'R$ 0'
          return formatCompactCurrency(val)
        },
      },
    },
    markers: {
      size: [8, 0, 0],
      strokeColors: markerStrokeColors,
      strokeWidth: 3,
      colors: markerFillColors,
      hover: { size: 13 },
      discrete: discreteMarkers,
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => formatCurrency(val) },
    },
    legend: { show: false },
    states: {
      active: { filter: { type: 'none' } },
    },
  }
})

const lineSeries = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const buildFutureAwareData = (values: number[]) =>
    values.map((v, idx) => {
      let isFuture = false
      if (props.periodType === 'month' || selectedGranularity.value.startsWith('month_')) {
        const goalMonth = props.goal?.month || props.currentRange?.months[0]?.m || now.getMonth() + 1
        const goalYear = props.goal?.year || props.currentRange?.months[0]?.y || now.getFullYear()
        const startDate = new Date(goalYear, goalMonth - 1, 1)
        const weeks = (dailyData.value as any).calendarWeeks || []
        if (selectedGranularity.value === 'all' || selectedGranularity.value.startsWith('month_')) {
          const week = weeks[idx]
          if (week) {
            const checkDate = new Date(startDate)
            checkDate.setDate(checkDate.getDate() + week.start)
            if (checkDate > now) isFuture = true
          }
        } else {
          const weekIdx = parseInt(selectedGranularity.value.replace('week', '')) - 1
          const week = weeks[weekIdx]
          if (week) {
            let dayStart = week.start
            if (weekIdx > 0) dayStart = weeks[weekIdx - 1].end
            const checkDate = new Date(startDate)
            checkDate.setDate(checkDate.getDate() + dayStart + idx)
            if (checkDate > now) isFuture = true
          }
        }
      } else {
        const monthsRange = props.currentRange?.months || []
        const mObj = monthsRange[idx]
        if (mObj) {
          const monthDate = new Date(mObj.y, mObj.m - 1, 1)
          const currentMonthFirstDay = new Date(now.getFullYear(), now.getMonth(), 1)
          if (monthDate > currentMonthFirstDay) isFuture = true
        }
      }
      return isFuture ? null : (Number(v) || 0)
    })

  const series = [
    {
      name: 'Realizado',
      data: buildFutureAwareData(chartData.value.actuals),
    },
  ]
  if (hasGoal.value) {
    series.push({
      name: 'Planejado',
      data: chartData.value.targets.map((v) => Number(v) || 0),
    })
  }
  if (hasProjection.value) {
    series.push({
      name: 'Projeção',
      data: buildFutureAwareData((chartData.value as any).projection || []),
    })
  }
  return series
})
</script>

<style scoped>
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

.animate-[shimmer_2s_infinite] {
  animation: shimmer 2s infinite;
}

:deep(.apexcharts-series-markers .apexcharts-marker) {
  cursor: pointer;
}

:deep(.apexcharts-line-series) {
  cursor: pointer;
}

:deep(.apexcharts-canvas),
:deep(.apexcharts-canvas svg) {
  outline: none !important;
  box-shadow: none !important;
}


.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
