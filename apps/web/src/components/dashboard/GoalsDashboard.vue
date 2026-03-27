<template>
  <div class="space-y-8 animate-in fade-in duration-700">
    <!-- Header with Action -->
    <div class="flex flex-col lg:flex-row justify-between gap-6 pt-4">
      <div class="flex items-start gap-3">
        <Target class="h-6 w-6 text-brand-cyan mt-1" />
        <div class="flex flex-col">
          <h3 class="text-xl font-bold text-white">Metas de Performance</h3>
          <span class="text-xs text-white/40"
            >Acompanhamento dinâmico • {{ currentPeriodLabel }}</span
          >
        </div>
      </div>

      <!-- Premium Countdown Timer -->
      <div
        v-if="hasGoal"
        class="flex items-center gap-6 sm:gap-8 px-6 sm:px-10 py-5 rounded-[2rem] bg-white/[0.03] border border-white/10 relative group/timer"
      >
        <div class="flex flex-col items-center relative z-10">
          <span
            class="text-[9px] font-black text-brand-cyan/50 uppercase tracking-[0.3em] mb-2"
            >Tempo Restante</span
          >
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="flex flex-col items-center min-w-[2.5rem]">
              <span
                class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter"
                >{{ countdown.days }}</span
              >
              <span
                class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1"
                >dias</span
              >
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center min-w-[2.5rem]">
              <span
                class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter"
                >{{ countdown.hours }}</span
              >
              <span
                class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1"
                >horas</span
              >
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center min-w-[2.5rem]">
              <span
                class="text-3xl font-black text-white tabular-nums leading-none tracking-tighter"
                >{{ countdown.minutes }}</span
              >
              <span
                class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1"
                >min</span
              >
            </div>
            <span class="text-brand-cyan/40 font-black text-xl mb-4">:</span>
            <div class="flex flex-col items-center min-w-[2.5rem]">
              <span
                class="text-3xl font-black text-brand-cyan animate-pulse tabular-nums leading-none tracking-tighter"
                >{{ countdown.seconds }}</span
              >
              <span
                class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-1"
                >seg</span
              >
            </div>
          </div>
        </div>

        <div
          class="hidden sm:block h-12 w-px bg-brand-cyan/10 relative z-10"
        ></div>

        <div class="hidden sm:flex flex-col items-start relative z-10">
          <span
            class="text-[12px] font-black text-white/70 uppercase tracking-[0.3em]"
            >Fechamento</span
          >
          <span
            class="text-[8px] font-bold text-brand-cyan uppercase tracking-widest leading-none mt-1"
            >Último dia do Mês</span
          >
        </div>
      </div>

      <div
        v-if="canSetGoals"
        class="flex flex-col sm:flex-row items-center gap-3"
      >
        <button
          @click="$emit('open-costs')"
          class="group flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/5 shadow-2xl shadow-black/20 hover:shadow-brand-cyan/10 active:scale-95 transition-all duration-500 transform"
        >
          <DollarSign
            class="h-4 w-4 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110"
          />
          <span class="text-[10px] font-black uppercase tracking-[0.2em]"
            >Configurar Custos</span
          >
        </button>

        <button
          @click="$emit('open-settings')"
          class="group flex items-center gap-3 px-6 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/5 shadow-2xl shadow-black/20 hover:shadow-brand-cyan/10 active:scale-95 transition-all duration-500 transform"
        >
          <Settings2
            class="h-4 w-4 transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110"
          />
          <span class="text-[10px] font-black uppercase tracking-[0.2em]"
            >Configurar Metas</span
          >
        </button>
      </div>
    </div>

    <div v-if="hasGoal" class="space-y-8">
      <!-- Top Overview Section -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <!-- Overall Progress Radial -->
        <div
          class="lg:col-span-4 p-8 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 hover:border-brand-cyan/30 transition-all duration-500 relative overflow-hidden group"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-brand-cyan/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          ></div>

          <div
            class="relative z-10 flex flex-col items-center justify-center h-full space-y-4"
          >
            <div class="flex flex-col items-center gap-4 w-full">
              <span
                class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]"
                >Progresso Geral</span
              >

              <!-- Tab Switcher -->
              <div
                class="flex p-1 bg-white/5 rounded-xl border border-white/5 w-fit"
              >
                <button
                  @click="radialTab = 'p1'"
                  :class="
                    radialTab === 'p1'
                      ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105'
                      : 'text-white/40 hover:text-white'
                  "
                  class="px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300"
                >
                  P1
                </button>
                <button
                  @click="radialTab = 'tcv'"
                  :class="
                    radialTab === 'tcv'
                      ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105'
                      : 'text-white/40 hover:text-white'
                  "
                  class="px-5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300"
                >
                  TCV
                </button>
              </div>
            </div>

            <div class="relative w-full aspect-square max-w-[240px]">
              <apexchart
                type="radialBar"
                height="100%"
                :options="radialOptions"
                :series="[radialMetric.percent]"
              />
              <div
                class="absolute inset-0 flex flex-col items-center justify-center -translate-y-2"
              >
                <span class="text-4xl font-black text-white tracking-tighter">
                  {{ radialMetric.percent.toFixed(0)
                  }}<span class="text-brand-cyan text-xl">%</span>
                </span>
                <span
                  class="text-[9px] font-bold text-white/20 uppercase tracking-widest mt-1"
                  >{{ radialMetric.key.toUpperCase() }} Atingido</span
                >
              </div>
            </div>

            <div
              class="grid grid-cols-2 gap-8 w-full pt-4 border-t border-brand-cyan/10"
            >
              <div class="text-center">
                <p
                  class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1"
                >
                  Realizado
                </p>
                <p class="text-sm font-bold text-brand-cyan">
                  {{ formatCurrency(radialMetric.actual) }}
                </p>
              </div>
              <div class="text-center border-l border-brand-cyan/10">
                <p
                  class="text-[9px] font-black text-white/20 uppercase tracking-tighter mb-1"
                >
                  Meta Total
                </p>
                <p class="text-sm font-bold text-white/60">
                  {{ formatCurrency(radialMetric.target) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Metrics Comparison Chart -->
        <div
          class="lg:col-span-8 p-8 rounded-[2.5rem] bg-brand-cyan/[0.03] border border-brand-cyan/10 relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-8">
            <span
              class="text-[10px] font-black text-brand-cyan/40 uppercase tracking-[0.2em]"
              >Evolução P1 (Meta vs Realizado)</span
            >
            <div class="flex items-center gap-6">
              <div class="flex gap-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-2 h-0.5 bg-brand-cyan shadow-[0_0_8px_rgba(45,212,191,0.5)]"
                  ></div>
                  <span
                    class="text-[9px] font-bold text-white/40 uppercase tracking-tighter"
                    >Realizado</span
                  >
                </div>
                <div class="flex items-center gap-2">
                  <div
                    class="w-2 h-0.5 bg-white/20 border-t border-dashed border-white/40"
                  ></div>
                  <span
                    class="text-[9px] font-bold text-white/40 uppercase tracking-tighter"
                    >Planejado</span
                  >
                </div>
              </div>
              <button
                v-if="canSetGoals"
                @click="$emit('open-periods')"
                class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-brand-cyan hover:border-brand-cyan/30 hover:bg-brand-cyan/5 text-[9px] font-black uppercase tracking-widest transition-all duration-300"
              >
                <Settings2
                  class="h-3 w-3 transition-transform duration-500 group-hover:rotate-90"
                />
                Configurar Períodos
              </button>
            </div>
          </div>

          <div class="h-[280px]">
            <apexchart
              :key="lineChartKey"
              type="line"
              height="100%"
              :options="lineOptions"
              :series="lineSeries"
            />
          </div>
        </div>
      </div>

      <!-- Metrics Grid Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          v-for="metric in displayMetrics"
          :key="metric.key"
          class="p-6 rounded-[2.2rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.05] transition-all duration-500 group relative overflow-hidden"
        >
          <div
            class="absolute -top-12 -right-12 w-24 h-24 bg-brand-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          ></div>

          <div class="flex items-start justify-between mb-6 relative z-10">
            <div
              class="p-2.5 rounded-2xl bg-white/5 border border-white/5 group-hover:border-brand-cyan/20 transition-colors duration-500"
            >
              <DollarSign
                class="h-3.5 w-3.5 text-white/40 group-hover:text-brand-cyan transition-colors"
              />
            </div>
            <div class="text-right">
              <p class="text-[10px] font-black" :class="metric.percentColor">
                {{ metric.percent.toFixed(0) }}%
              </p>
              <p
                class="text-[8px] font-bold text-white/20 uppercase tracking-widest mt-0.5"
              >
                atingido
              </p>
            </div>
          </div>

          <div class="space-y-4 relative z-10">
            <div>
              <p
                class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.1em] mb-1.5"
              >
                {{ metric.label }} (Meta)
              </p>
              <p
                class="text-xl font-black text-white tracking-tight group-hover:text-brand-cyan transition-colors duration-500"
              >
                {{ formatCurrency(metric.target) }}
              </p>
            </div>

            <div class="space-y-2">
              <div
                class="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[1px]"
              >
                <div
                  class="h-full transition-all duration-1000 ease-out rounded-full relative"
                  :class="metric.barColor"
                  :style="{ width: Math.min(metric.percent, 100) + '%' }"
                >
                  <div
                    class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-20 transform -translate-x-full group-hover:animate-[shimmer_2s_infinite]"
                  ></div>
                </div>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[9px] font-medium text-white/50 uppercase"
                  >Realizado: {{ formatCurrency(metric.actual) }}</span
                >
                <span
                  class="text-[9px] font-black text-white/40"
                  v-if="metric.remaining > 0"
                >
                  Falta {{ formatCurrency(metric.remaining) }}
                </span>
                <span
                  v-else
                  class="text-[9px] font-black text-brand-cyan uppercase tracking-tighter animate-pulse"
                  >Meta Batida!</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="py-24 px-6 rounded-[3rem] border border-dashed border-white/10 bg-brand-surface/20 flex flex-col items-center justify-center text-center space-y-6 animate-pulse"
    >
      <div
        class="p-6 rounded-3xl bg-white/5 border border-white/10 ring-8 ring-white/[0.02]"
      >
        <Target class="h-12 w-12 text-white/10" />
      </div>
      <div class="max-w-xs space-y-2">
        <h4 class="text-lg font-black text-white/60 tracking-tight uppercase">
          Dashboard Inativo
        </h4>
        <p
          class="text-xs font-medium text-white/20 leading-relaxed uppercase tracking-widest"
        >
          Nenhuma meta definida para {{ currentPeriodLabel }}.
          <span v-if="canSetGoals" class="text-brand-cyan/60 block mt-2"
            >Toque em \"Configurar\" para iniciar.</span
          >
          <span v-else class="block mt-2"
            >Aguarde a liberação do seu gestor.</span
          >
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { Target, Settings2, DollarSign } from "lucide-vue-next";
import VueApexCharts from "vue3-apexcharts";
import { useAuthStore } from "../../store/auth";
import type { Goal } from "../../api/goalService";

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
  contracts: any[];
}>();

defineEmits(["open-settings", "open-periods", "open-costs"]);

const authStore = useAuthStore();
const canSetGoals = computed(() => {
  const type = authStore.user?.type;
  return type === "admin" || type === "head" || type === "coord";
});

const hasGoal = computed(() => !!props.goal);
const currentPeriodLabel = computed(() => {
  const now = new Date();
  return now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
});

// Helper Functions
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatCompactCurrency = (val: number) => {
  if (Math.abs(val) >= 1000000)
    return `R$ ${(val / 1000000).toFixed(1).replace(".0", "").replace(".", ",")}M`;
  if (Math.abs(val) >= 1000)
    return `R$ ${(val / 1000).toFixed(1).replace(".0", "").replace(".", ",")}k`;
  return `R$ ${Math.round(val)}`;
};

// Countdown Logic
const countdown = ref({
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
});
let timerInterval: any = null;

const updateCountdown = () => {
  const now = new Date();
  const lastDay = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  const diff = lastDay.getTime() - now.getTime();

  if (diff <= 0) {
    countdown.value = { days: "00", hours: "00", minutes: "00", seconds: "00" };
    return;
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24))
      .toString()
      .padStart(2, "0"),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      .toString()
      .padStart(2, "0"),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      .toString()
      .padStart(2, "0"),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
      .toString()
      .padStart(2, "0"),
  };
};

onMounted(() => {
  updateCountdown();
  timerInterval = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// Component State
const lineChartKey = ref(0);
watch(
  () => props.goal,
  () => lineChartKey.value++,
  { deep: true },
);

const displayMetrics = computed(() => {
  if (!props.goal) return [];
  const metrics = [
    {
      key: "p1",
      label: "Meta P1",
      target: Number(props.goal.p1 || 0),
      actual: props.actuals.p1,
    },
    {
      key: "tcv",
      label: "Meta TCV",
      target: Number(props.goal.tcv || 0),
      actual: props.actuals.tcv,
    },
    {
      key: "nmrr",
      label: "Meta NMRR",
      target: Number(props.goal.nmrr || 0),
      actual: props.actuals.nmrr,
    },
  ];

  return metrics.map((m) => {
    const percent =
      m.target > 0 ? (m.actual / m.target) * 100 : m.actual > 0 ? 100 : 0;
    const remaining = Math.max(0, m.target - m.actual);
    let barColor = "bg-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.4)]";
    let percentColor = "text-brand-cyan";

    if (percent < 50) {
      barColor = "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]";
      percentColor = "text-rose-400";
    } else if (percent < 80) {
      barColor = "bg-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.4)]";
      percentColor = "text-amber-400";
    }
    return { ...m, percent, remaining, barColor, percentColor };
  });
});

const radialTab = ref<"p1" | "tcv">("p1");
const radialMetric = computed(() => {
  return (
    displayMetrics.value.find((m) => m.key === radialTab.value) || {
      key: radialTab.value,
      label: "",
      target: 0,
      actual: 0,
      percent: 0,
      remaining: 0,
      barColor: "",
      percentColor: "",
    }
  );
});

const radialOptions = {
  chart: { id: "goal-radial-bar", sparkline: { enabled: true } },
  colors: ["#00d4ff"],
  plotOptions: {
    radialBar: {
      hollow: { size: "75%" },
      track: { background: "rgba(255,255,255,0.05)" },
      dataLabels: { show: false },
    },
  },
  stroke: { lineCap: "round" as const },
};

// Data Logic
const p1ActualByPeriod = computed(() => {
  if (!props.contracts.length || !props.goal) return [0, 0, 0, 0];
  const startDate = new Date(props.goal.year, props.goal.month - 1, 6);
  const periods = [0, 0, 0, 0];

  props.contracts.forEach((c) => {
    if (!c.signed) return;
    const date = new Date(c.first_payment_date || c.created_at || "");
    const diffDays = Math.floor(
      (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) return;
    if (diffDays < 7) periods[0] += parseFloat(c.first_payment_amount) || 0;
    else if (diffDays < 13)
      periods[1] += parseFloat(c.first_payment_amount) || 0;
    else if (diffDays < 21)
      periods[2] += parseFloat(c.first_payment_amount) || 0;
    else periods[3] += parseFloat(c.first_payment_amount) || 0;
  });

  periods.reduce((acc, val, i, arr) => {
    arr[i] = acc + val;
    return arr[i];
  }, 0);
  return periods;
});

const p1TargetByPeriod = computed(() => {
  if (!props.goal) return [0, 0, 0, 0];
  const totalGoal = Number(props.goal.p1 || 0);
  const m = [
    props.goal.p1_period_1,
    props.goal.p1_period_2,
    props.goal.p1_period_3,
    props.goal.p1_period_4,
  ];

  if (m.every((v) => v === null)) {
    return [totalGoal / 4, (totalGoal / 4) * 2, (totalGoal / 4) * 3, totalGoal];
  }

  return m.map((val, i) =>
    val !== null ? Number(val) : (totalGoal / 4) * (i + 1),
  );
});

const lineOptions = computed(() => ({
  chart: {
    id: "p1-evolution-line",
    toolbar: { show: false },
    fontFamily: "Outfit, sans-serif",
    dropShadow: {
      enabled: true,
      top: 10,
      left: 0,
      blur: 15,
      opacity: 0.2,
      color: "#00d4ff",
    },
  },
  stroke: { curve: "smooth" as const, width: [4, 2], dashArray: [0, 5] },
  colors: ["#00d4ff", "rgba(255,255,255,0.2)"],
  grid: {
    borderColor: "rgba(255,255,255,0.05)",
    padding: { left: 10, right: 10 },
  },
  xaxis: {
    categories: ["D1-7", "D8-13", "D14-21", "D22-EOF"],
    labels: {
      style: {
        colors: "rgba(255,255,255,0.3)",
        fontSize: "10px",
        fontWeight: 900,
      },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: "rgba(255,255,255,0.2)", fontSize: "9px" },
      formatter: (val: number) => formatCompactCurrency(val),
    },
  },
  markers: {
    size: 4,
    strokeColors: "#00d4ff",
    strokeWidth: 2,
    colors: ["#0b0f1a"],
  },
  tooltip: {
    theme: "dark",
    shared: true,
    intersect: false,
    y: { formatter: (val: number) => formatCurrency(val) },
  },
  legend: { show: false },
}));

const lineSeries = computed(() => [
  { name: "Realizado", data: p1ActualByPeriod.value },
  { name: "Planejado", data: p1TargetByPeriod.value },
]);
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
