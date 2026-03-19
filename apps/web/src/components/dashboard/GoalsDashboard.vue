<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header with Action -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6 px-2">
      <div class="space-y-1.5">
        <div class="flex items-center gap-3">
          <div class="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20">
            <Target class="h-5 w-5 text-brand-cyan" />
          </div>
          <h3 class="text-xs font-black uppercase tracking-[0.4em] text-white/90">
            Metas de Performance
          </h3>
        </div>
        <p class="text-[10px] font-medium text-white/30 uppercase tracking-widest ml-11">
          Acompanhamento dinâmico de objetivos • {{ currentPeriodLabel }}
        </p>
      </div>

      <!-- Premium Countdown Timer -->
      <div v-if="hasGoal" class="flex items-center gap-6 sm:gap-8 px-6 sm:px-10 py-5 rounded-[2rem] bg-brand-cyan/5 border border-brand-cyan/10 shadow-2xl shadow-brand-cyan/10 relative overflow-hidden group/timer">
        <!-- Shine effect overflow -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-brand-cyan/10 to-transparent -translate-x-full group-hover/timer:animate-[shimmer_3s_infinite]"></div>
        
        <div class="flex flex-col items-center">
          <span class="text-[9px] font-black text-brand-cyan/50 uppercase tracking-[0.3em] mb-2">Tempo Restante</span>
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="flex flex-col items-center">
              <span class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter">{{ countdown.days }}</span>
              <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">dias</span>
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center">
              <span class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter">{{ countdown.hours }}</span>
              <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">horas</span>
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center">
              <span class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter">{{ countdown.minutes }}</span>
              <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">min</span>
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center">
              <span class="text-3xl font-black text-brand-cyan animate-pulse tabular-nums leading-none tracking-tighter">{{ countdown.seconds }}</span>
              <span class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1">seg</span>
            </div>
          </div>
        </div>
        
        <div class="hidden sm:block h-12 w-px bg-brand-cyan/10"></div>
        
        <div class="hidden sm:flex flex-col items-start">
          <span class="text-[12px] font-black text-white/70 uppercase tracking-[0.3em]">Fechamento</span>
          <p class="text-[8px] font-bold text-brand-cyan uppercase tracking-widest leading-none">Último dia do Mês</p>
        </div>
      </div>
      
      <button v-if="canSetGoals" @click="$emit('open-settings')"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-brand-cyan/10 hover:border-brand-cyan/30 hover:text-brand-cyan transition-all duration-300 text-[10px] font-black uppercase tracking-wider text-white/60 shadow-xl group">
        <Settings2 class="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-500" />
        Configurar Metas
      </button>
    </div>

    <div v-if="hasGoal" class="space-y-8">
      <!-- Top Overview Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Overall Progress Radial -->
        <div class="lg:col-span-4 p-8 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 hover:border-brand-cyan/30 transition-all duration-500 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div class="relative z-10 flex flex-col items-center justify-center h-full space-y-4">
            <span class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]">Progresso Geral</span>
            
            <div class="relative w-full aspect-square max-w-[240px]">
              <apexchart
                type="radialBar"
                height="100%"
                :options="radialOptions"
                :series="[overallPercent]"
              />
              <div class="absolute inset-0 flex flex-col items-center justify-center -translate-y-2">
                <span class="text-4xl font-black text-white tracking-tighter">
                  {{ overallPercent.toFixed(0) }}<span class="text-brand-cyan text-xl">%</span>
                </span>
                <span class="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1">Status Global</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-8 w-full pt-4 border-t border-brand-cyan/10">
              <div class="text-center">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Total Realizado</p>
                <p class="text-sm font-bold text-brand-cyan">{{ formatCurrency(totalActual) }}</p>
              </div>
              <div class="text-center border-l border-brand-cyan/10">
                <p class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1">Total Meta</p>
                <p class="text-sm font-bold text-white/60">{{ formatCurrency(totalTarget) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Comparison Chart -->
        <div class="lg:col-span-8 p-8 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 relative overflow-hidden">
          <div class="flex items-center justify-between mb-8">
            <span class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]">Comparativo de Metas</span>
            <div class="flex gap-4">
              <div class="flex items-center gap-2">
                <div class="w-2 H-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(45,212,191,0.5)]"></div>
                <span class="text-[9px] font-bold text-white/40 uppercase">Realizado</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-2 H-2 rounded-full bg-white/10 border border-white/20"></div>
                <span class="text-[9px] font-bold text-white/40 uppercase">Meta</span>
              </div>
            </div>
          </div>
          
          <div class="h-[280px]">
            <apexchart
              type="bar"
              height="100%"
              :options="barOptions"
              :series="barSeries"
            />
          </div>
        </div>
      </div>

      <!-- Redesigned Grid Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
        <div v-for="metric in displayMetrics" :key="metric.key"
          class="p-6 rounded-[2.2rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.05] transition-all duration-500 group relative overflow-hidden">
          
          <!-- Decorative background -->
          <div class="absolute -top-12 -right-12 w-24 h-24 bg-brand-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

          <div class="flex items-start justify-between mb-6 relative z-10">
            <div class="p-2.5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-brand-cyan/20 transition-colors duration-500">
              <DollarSign class="h-3.5 w-3.5 text-white/40 group-hover:text-brand-cyan transition-colors" />
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black" :class="metric.percentColor">
                {{ metric.percent.toFixed(0) }}%
              </p>
              <p class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5">atingido</p>
            </div>
          </div>

          <div class="space-y-4 relative z-10">
            <div>
              <p class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.1em] mb-1.5">{{ metric.label }} (Meta)</p>
              <p class="text-xl font-black text-white tracking-tight group-hover:text-brand-cyan transition-colors duration-500">
                {{ formatCurrency(metric.target) }}
              </p>
            </div>

            <!-- Progress Indicator -->
            <div class="space-y-2">
              <div class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]">
                <div class="h-full transition-all duration-1000 ease-out rounded-full relative"
                     :class="metric.barColor"
                     :style="{ width: Math.min(metric.percent, 100) + '%' }">
                  <!-- Shimmer effect -->
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-medium text-white/50 uppercase">Progresso: {{ formatCurrency(metric.actual) }}</span>
                <span class="text-[9px] font-black text-white/40" v-if="metric.remaining > 0">
                  Falta {{ formatCurrency(metric.remaining) }}
                </span>
                <span v-else class="text-[9px] font-black text-brand-cyan uppercase tracking-tighter animate-pulse">Meta Batida!</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="py-24 px-6 rounded-[3rem] border border-dashed border-white/10 bg-brand-surface/20 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
      <div class="p-6 rounded-3xl bg-white/5 border border-white/10 ring-8 ring-white/[0.02]">
        <Target class="h-12 w-12 text-white/10" />
      </div>
      <div class="max-w-xs space-y-2">
        <h4 class="text-lg font-black text-white/60 tracking-tight uppercase">Dashboard Inativo</h4>
        <p class="text-xs font-medium text-white/20 leading-relaxed uppercase tracking-widest">
          Nenhuma meta definida para {{ currentPeriodLabel }}. 
          <span v-if="canSetGoals" class="text-brand-cyan/60 block mt-2">Toque em "Configurar" para iniciar.</span>
          <span v-else class="block mt-2">Aguarde a liberação do seu gestor.</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { Target, Settings2, DollarSign, Clock } from 'lucide-vue-next';
import VueApexCharts from 'vue3-apexcharts';
import { useAuthStore } from '../../store/auth';
import type { Goal } from '../../api/goalService';

const apexchart = VueApexCharts;

const props = defineProps<{
  goal: Goal | null;
  actuals: {
    p1: number;
    tcv: number;
    nmrr: number;
    implementation: number;
    monthly: number;
  };
}>();

defineEmits(['open-settings']);

const authStore = useAuthStore();

const canSetGoals = computed(() => {
  const type = authStore.user?.type;
  return type === 'admin' || type === 'head' || type === 'coord';
});

const hasGoal = computed(() => !!props.goal);

const currentPeriodLabel = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
});

// Countdown Logic
const countdown = ref({ days: '00', hours: '00', minutes: '00', seconds: '00' });
let timerInterval: any = null;

const updateCountdown = () => {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); 

  // O encerramento agora é sempre no último dia do mês selecionado
  // Pegamos o último dia do mês atual
  const lastDay = new Date(year, month + 1, 0, 23, 59, 59);
  
  const target = lastDay;
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    countdown.value = { days: '00', hours: '00', minutes: '00', seconds: '00' };
    return;
  }
  
  const d = Math.floor(diff / (1000 * 60 * 60 * 24));
  const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);
  
  countdown.value = {
    days: d.toString().padStart(2, '0'),
    hours: h.toString().padStart(2, '0'),
    minutes: m.toString().padStart(2, '0'),
    seconds: s.toString().padStart(2, '0')
  };
};

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

const displayMetrics = computed(() => {
  if (!props.goal) return [];

  const metrics = [
    { key: 'p1', label: 'Meta P1', target: Number(props.goal.p1 || 0), actual: props.actuals.p1 },
    { key: 'tcv', label: 'Meta TCV', target: Number(props.goal.tcv || 0), actual: props.actuals.tcv },
    { key: 'nmrr', label: 'Meta NMRR', target: Number(props.goal.nmrr || 0), actual: props.actuals.nmrr },
    { key: 'implementation', label: 'Implementação', target: Number(props.goal.implementation || 0), actual: props.actuals.implementation },
    { key: 'monthly', label: 'Recorrência', target: Number(props.goal.monthly || 0), actual: props.actuals.monthly },
  ];

  return metrics.map(m => {
    const percent = m.target > 0 ? (m.actual / m.target) * 100 : (m.actual > 0 ? 100 : 0);
    const remaining = Math.max(0, m.target - m.actual);
    
    let barColor = 'bg-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.4)]';
    let percentColor = 'text-brand-cyan';

    if (percent < 50) {
      barColor = 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]';
      percentColor = 'text-rose-400';
    } else if (percent < 80) {
      barColor = 'bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]';
      percentColor = 'text-amber-400';
    }

    return { ...m, percent, remaining, barColor, percentColor };
  });
});

const overallPercent = computed(() => {
  if (displayMetrics.value.length === 0) return 0;
  const total = displayMetrics.value.reduce((acc, m) => acc + Math.min(m.percent, 100), 0);
  return total / displayMetrics.value.length;
});

const totalActual = computed(() => displayMetrics.value.reduce((acc, m) => acc + m.actual, 0));
const totalTarget = computed(() => displayMetrics.value.reduce((acc, m) => acc + m.target, 0));

// Chart Options
const radialOptions = {
  chart: {
    sparkline: { enabled: true },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: { enabled: true, delay: 150 },
      dynamicAnimation: { enabled: true, speed: 350 }
    }
  },
  colors: ['#00d4ff'],
  plotOptions: {
    radialBar: {
      hollow: { size: '75%', background: 'transparent' },
      track: { background: 'rgba(255,255,255,0.05)', strokeWidth: '100%' },
      dataLabels: { show: false }
    }
  },
  stroke: { lineCap: 'round' as const }
};

const formatCompactCurrency = (val: number) => {
  if (Math.abs(val) >= 1000000) return `R$ ${(val / 1000000).toFixed(1).replace('.0', '').replace('.', ',')}M`;
  if (Math.abs(val) >= 1000) return `R$ ${(val / 1000).toFixed(1).replace('.0', '').replace('.', ',')}k`;
  return `R$ ${Math.round(val)}`;
};

const barOptions = {
  chart: {
    toolbar: { show: false },
    fontFamily: 'Outfit, sans-serif',
    background: 'transparent',
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  theme: { mode: 'dark' as const },
  grid: {
    borderColor: 'rgba(255,255,255,0.05)',
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } }
  },
  colors: ['#00d4ff', 'rgba(255,255,255,0.1)'],
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
      dataLabels: { position: 'top' }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => formatCompactCurrency(val),
    offsetY: -20,
    style: { fontSize: '9px', fontWeight: 900, colors: ['rgba(255,255,255,0.4)'] }
  },
  xaxis: {
    categories: ['P1', 'TCV', 'NMRR', 'IMPL', 'REC'],
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { style: { colors: 'rgba(255,255,255,0.3)', fontSize: '10px', fontWeight: 900 } }
  },
  yaxis: {
    labels: { 
      show: true,
      style: { colors: 'rgba(255,255,255,0.2)', fontSize: '9px' },
      formatter: (val: number) => formatCompactCurrency(val)
    }
  },
  tooltip: {
    theme: 'dark',
    y: { formatter: (val: number) => formatCurrency(val) }
  },
  legend: { show: false }
};

const barSeries = computed(() => [
  {
    name: 'Realizado',
    data: displayMetrics.value.map(m => m.actual)
  },
  {
    name: 'Meta',
    data: displayMetrics.value.map(m => m.target)
  }
]);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0
  }).format(val);
};
</script>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%) }
  100% { transform: translateX(200%) }
}

.animate-[shimmer_2s_infinite] {
  animation: shimmer 2s infinite;
}
</style>
