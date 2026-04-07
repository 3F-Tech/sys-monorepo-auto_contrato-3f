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

      <!-- Top Overview Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-3">
        <!-- Overall Progress Radial -->
        <div
          class="lg:col-span-4 p-6 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 hover:border-brand-cyan/30 transition-all duration-500 relative group">
          <!-- Clipping Layer for Background Effect (Allows tooltip overflow) -->
          <div class="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
            <div
              class="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            </div>
          </div>

          <div class="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
            <div class="flex flex-col items-center gap-3 w-full">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]">
                  Progresso Geral
                </span>
              </div>

              <!-- Tab Switcher -->
              <div class="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit">
                <button @click="radialTab = 'p1'" :class="radialTab === 'p1'
                  ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105'
                  : 'text-white/40 hover:text-white'
                  "
                  class="px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300">
                  P1
                </button>
                <button @click="radialTab = 'tcv'" :class="radialTab === 'tcv'
                  ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105'
                  : 'text-white/40 hover:text-white'
                  "
                  class="px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300">
                  TCV
                </button>
              </div>
            </div>

            <div class="relative w-full aspect-square max-w-[240px]">
              <apexchart type="radialBar" height="100%" :options="radialOptions" :series="[radialMetric.percent]" />
              <div class="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
                <span class="text-4xl font-black tracking-tighter"
                  :class="radialMetric.hasTarget ? 'text-white' : 'text-white/20'">
                  {{ radialMetric.hasTarget ? radialMetric.percent.toFixed(0) : '--' }}
                  <span v-if="radialMetric.hasTarget" class="text-xl ml-1" :class="radialMetric.percentColor">%</span>
                </span>
                <span class="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1 text-center px-4">
                  {{ radialMetric.hasTarget ? `${radialMetric.key.toUpperCase()} Atingido` : 'Meta não definida' }}
                </span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8 w-full pt-4 border-t border-brand-cyan/10">
              <div class="text-center">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Realizado</p>
                <p class="text-sm font-bold text-brand-cyan">
                  {{ formatCurrency(radialMetric.actual) }}
                </p>
              </div>
              <div class="text-center border-l border-brand-cyan/10">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Meta Total</p>
                <p class="text-sm font-bold text-white/60">
                  {{ formatCurrency(radialMetric.target) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Comparison Chart -->
        <div
          class="lg:col-span-8 p-6 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 relative overflow-hidden">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <span class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]">
              Evolução P1 (Meta vs Realizado)
            </span>
            <div class="flex flex-wrap items-center gap-3 sm:gap-3">
              <div class="flex gap-3">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-0.5 bg-brand-cyan shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>
                  <span class="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Realizado</span>
                </div>
                <div class="flex items-center gap-2">
                  <div class="w-2 h-0.5 bg-white/20 border-t border-dashed border-white/40"></div>
                  <span class="text-[9px] font-bold text-white/40 uppercase tracking-tighter">Planejado</span>
                </div>
              </div>
            </div>
          </div>

          <div class="h-[350px]">
            <apexchart :key="lineChartKey" type="line" height="100%" :options="lineOptions" :series="lineSeries" />
          </div>

          <!-- Bottom Pagination Control (Granularity Switcher) -->
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
      </div>

      <!-- Metrics Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div v-for="metric in displayMetrics" :key="metric.key"
          class="p-6 rounded-[2.2rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.05] transition-all duration-500 group relative overflow-hidden">
          <div
            class="absolute -top-12 -right-12 w-24 h-24 bg-brand-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          </div>

          <div class="flex items-start justify-between mb-6 relative z-10">
            <div
              class="p-2.5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-brand-cyan/20 transition-colors duration-500">
              <DollarSign class="h-3.5 w-3.5 text-white/40 group-hover:text-brand-cyan transition-colors" />
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black" :class="metric.percentColor">
                {{ metric.hasTarget ? metric.percent.toFixed(0) + '%' : '--' }}
              </p>
              <p class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">
                {{ metric.hasTarget ? 'atingido' : 'sem meta' }}
              </p>
            </div>
          </div>

          <div class="space-y-4 relative z-10">
            <div>
              <p class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.1em] mb-1.5">
                {{ metric.label }} (Meta)
              </p>
              <p
                class="text-xl font-black text-white tracking-tight group-hover:text-brand-cyan transition-colors duration-500">
                {{ formatCurrency(metric.target) }}
              </p>
            </div>

            <div class="space-y-2">
              <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                <div class="h-full transition-all duration-1000 ease-out rounded-full relative" :class="metric.barColor"
                  :style="{ width: Math.min(metric.percent, 100) + '%' }">
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]">
                  </div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-medium text-white/50 uppercase">
                  Realizado: {{ formatCurrency(metric.actual) }}
                </span>
                <span class="text-[9px] font-black text-white/40" v-if="!metric.hasTarget">Meta não definida</span>
                <span class="text-[9px] font-black text-white/40" v-else-if="metric.remaining > 0">
                  Falta {{ formatCurrency(metric.remaining) }}
                </span>
                <span v-else class="text-[9px] font-black text-brand-cyan uppercase tracking-tighter animate-pulse">
                  Meta Batida!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
} from '@lucide/vue'
import VueApexCharts from 'vue3-apexcharts'
import { useAuthStore } from '../../store/auth'
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

onMounted(() => {
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

const granularityOptions = computed(() => {
  if (props.periodType === 'month') {
    return [
      { value: 'all', label: 'Mês Inteiro' },
      { value: 'week1', label: 'Semana 1' },
      { value: 'week2', label: 'Semana 2' },
      { value: 'week3', label: 'Semana 3' },
      { value: 'week4', label: 'Semana 4' },
    ]
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
    const goalMonth = props.goal?.month || new Date().getMonth() + 1
    const goalYear = props.goal?.year || new Date().getFullYear()
    const startDate = new Date(goalYear, goalMonth - 1, 6)
    const endDate = new Date(goalYear, goalMonth, 5, 23, 59, 59)
    const today = new Date()

    if (today < startDate || today > endDate) return 'all'

    const diffDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays >= 0 && diffDays < 7) return 'week1'
    if (diffDays >= 7 && diffDays < 13) return 'week2'
    if (diffDays >= 13 && diffDays < 21) return 'week3'
    if (diffDays >= 21) return 'week4'
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

const radialTab = ref<'p1' | 'tcv'>('p1')
const radialMetric = computed(() => {
  return (
    displayMetrics.value.find((m) => m.key === radialTab.value) || {
      key: radialTab.value,
      label: '',
      target: 0,
      actual: 0,
      percent: 0,
      remaining: 0,
      barColor: '',
      percentColor: '',
      hasTarget: false,
    }
  )
})

const getHexColor = (barColor: string) => {
  if (barColor.includes('rose')) return '#f43f5e'
  if (barColor.includes('amber')) return '#fbbf24'
  if (barColor.includes('emerald')) return '#10b981'
  if (barColor.includes('blue')) return '#3b82f6'
  if (barColor.includes('white/10')) return '#475569' // Slate-600 para estado neutro
  return '#00d4ff'
}

const radialOptions = computed(() => ({
  chart: { id: 'goal-radial-bar', sparkline: { enabled: true } },
  colors: [getHexColor(radialMetric.value.barColor)],
  plotOptions: {
    radialBar: {
      hollow: { size: '75%' },
      track: { background: 'rgba(255,255,255,0.05)' },
      dataLabels: { show: false },
    },
  },
  stroke: { lineCap: 'round' as const },
}))

const dailyData = computed(() => {
  console.log("displayMetrics: ", displayMetrics.value)
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

    const startDate = new Date(goalParams.year, goalParams.month - 1, 6)
    const endDate = new Date(goalParams.year, goalParams.month, 5)
    const totalDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const dailyActuals = new Array(totalDays).fill(0)

    if (props.contracts.length) {
      props.contracts.forEach((c) => {
        if (!c.signed) return
        const rawDate = c.first_payment_date || c.created_at || ''
        const dateStr = rawDate.includes('T') ? rawDate.split('T')[0] : rawDate
        const date = new Date(dateStr + 'T12:00:00')
        const diffDays = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
        if (diffDays >= 0 && diffDays < totalDays) {
          let val = parseFloat(c.first_payment_amount) || 0
          if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
          dailyActuals[diffDays] += val
        }
      })
    }

    const cumulativeActuals = [...dailyActuals]
    cumulativeActuals.reduce((acc, val, i, arr) => {
      arr[i] = acc + val
      return arr[i]
    }, 0)

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

    const dailyTargets = new Array(totalDays).fill(0)
    const checkpoints = [
      { day: 0, val: 0 },
      { day: 6, val: p1 },
      { day: 12, val: p2 },
      { day: 20, val: p3 },
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

    return { cumulativeActuals, dailyTargets, categories, p1, p2, p3, p4, totalDays }
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

    let cumActual = 0
    let cumTarget = 0

    monthsRange.forEach((mObj) => {
      const d = new Date(mObj.y, mObj.m - 1, 1)
      categories.push(d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase())
      const startP1 = new Date(mObj.y, mObj.m - 1, 6)
      const endP1 = new Date(mObj.y, mObj.m, 5, 23, 59, 59)
      const monthActual = props.contracts.reduce((acc, c) => {
        if (!c.signed) return acc
        const rawDt = c.first_payment_date || c.created_at || ''
        const dtStr = rawDt.includes('T') ? rawDt.split('T')[0] : rawDt
        const dt = new Date(dtStr + 'T12:00:00')
        if (dt >= startP1 && dt <= endP1) {
          let val = parseFloat(c.first_payment_amount) || 0
          if (val === 0) val = (parseFloat(c.implementation_fee) || 0) + (parseFloat(c.monthly_fee) || 0)
          return acc + val
        }
        return acc
      }, 0)
      cumActual += monthActual
      monthlyActuals.push(Number(cumActual.toFixed(2)))
      const goalForMonth = props.goals.find((g) => g.month === mObj.m && g.year === mObj.y)
      cumTarget += Number(goalForMonth?.p1 || 0)
      monthlyTargets.push(Number(cumTarget.toFixed(2)))
    })

    return {
      cumulativeActuals: monthlyActuals,
      dailyTargets: monthlyTargets,
      categories,
      totalDays: monthsRange.length,
    }
  }
})

const chartData = computed(() => {
  const { cumulativeActuals, dailyTargets, categories, totalDays } = dailyData.value
  const isIndividualMonth = selectedGranularity.value.startsWith('month_')

  if (props.periodType !== 'month' && !isIndividualMonth) {
    return { categories, actuals: cumulativeActuals, targets: dailyTargets }
  }

  const { p1, p2, p3, p4 } = dailyData.value as any

  if (selectedGranularity.value === 'all') {
    return {
      categories: ['D1-7', 'D8-13', 'D14-21', 'D22-EOF'],
      actuals: [
        cumulativeActuals[6] || 0,
        cumulativeActuals[12] || 0,
        cumulativeActuals[20] || 0,
        cumulativeActuals[totalDays - 1] || 0,
      ],
      targets: [p1, p2, p3, p4],
    }
  }

  let startIdx = 0
  let endIdx = 6
  if (selectedGranularity.value === 'week1') {
    startIdx = 0
    endIdx = 6
  } else if (selectedGranularity.value === 'week2') {
    startIdx = 7
    endIdx = 12
  } else if (selectedGranularity.value === 'week3') {
    startIdx = 13
    endIdx = 20
  } else if (selectedGranularity.value === 'week4') {
    startIdx = 21
    endIdx = totalDays - 1
  }
  // Se for um mês específico dentro de um trimestre, mostramos o mês inteiro agrupado por semanas
  else if (isIndividualMonth) {
    return {
      categories: ['D1-7', 'D8-13', 'D14-21', 'D22-EOF'],
      actuals: [
        cumulativeActuals[6] || 0,
        cumulativeActuals[12] || 0,
        cumulativeActuals[20] || 0,
        cumulativeActuals[totalDays - 1] || 0,
      ],
      targets: [p1, p2, p3, p4],
    }
  }

  return {
    categories: (categories as any).slice(startIdx, endIdx + 1),
    actuals: cumulativeActuals.slice(startIdx, endIdx + 1).map((v) => Number(v.toFixed(2))),
    targets: dailyTargets.slice(startIdx, endIdx + 1).map((v) => Number(v.toFixed(2))),
  }
})

const lineOptions = computed(() => ({
  chart: {
    id: 'p1-evolution-line',
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: 'Outfit, sans-serif',
    dropShadow: {
      enabled: true,
      top: 10,
      left: 0,
      blur: 15,
      opacity: 0.2,
      color: '#00d4ff',
    },
  },
  stroke: { curve: 'smooth' as const, width: [4, 2], dashArray: [0, 5] },
  colors: ['#00d4ff', 'rgba(255,255,255,0.2)'],
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
    size: 4,
    strokeColors: '#00d4ff',
    strokeWidth: 2,
    colors: ['#0b0f1a'],
  },
  tooltip: {
    theme: 'dark',
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => formatCurrency(val) },
  },
  legend: { show: false },
}))

const lineSeries = computed(() => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const actualData = chartData.value.actuals.map((v, idx) => {
    let isFuture = false

    if (props.periodType === 'month' || selectedGranularity.value.startsWith('month_')) {
      // No modo diário do mês: compara cada dia com hoje
      const goalMonth = props.goal?.month || props.currentRange?.months[0]?.m || now.getMonth() + 1
      const goalYear = props.goal?.year || props.currentRange?.months[0]?.y || now.getFullYear()
      const startDate = new Date(goalYear, goalMonth - 1, 6)

      // Se for agrupado por semanas no "all" ou "month_..."
      if (selectedGranularity.value === 'all' || selectedGranularity.value.startsWith('month_')) {
        const milestones = [6, 12, 20, 30] // Dias de corte aproximados
        const checkDate = new Date(startDate)
        checkDate.setDate(checkDate.getDate() + milestones[idx])
        if (checkDate > now) isFuture = true
      } else {
        // Se for detalhado dia a dia (weekX)
        const weekPrefix = selectedGranularity.value.replace('week', '')
        const startOffsets = [0, 7, 13, 21]
        const offset = startOffsets[parseInt(weekPrefix) - 1] || 0
        const checkDate = new Date(startDate)
        checkDate.setDate(checkDate.getDate() + offset + idx)
        if (checkDate > now) isFuture = true
      }
    } else {
      // No modo trimestral/anual/all (comparação por meses)
      const monthsRange = props.currentRange?.months || []
      const mObj = monthsRange[idx]
      if (mObj) {
        const monthDate = new Date(mObj.y, mObj.m - 1, 1)
        // Se o mês do gráfico é posterior ao mês atual
        const currentMonthFirstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        if (monthDate > currentMonthFirstDay) isFuture = true
      }
    }

    return isFuture ? null : (Number(v) || 0)
  })

  const series = [
    {
      name: 'Realizado',
      data: actualData,
    },
  ]
  if (hasGoal.value) {
    series.push({
      name: 'Planejado',
      data: chartData.value.targets.map((v) => Number(v) || 0),
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
</style>
