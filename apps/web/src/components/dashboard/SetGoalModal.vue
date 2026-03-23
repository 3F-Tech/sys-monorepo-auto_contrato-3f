<template>
  <div v-if="isOpen" class="fixed inset-0 z-[101] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-brand-deep/80 backdrop-blur-md transition-all duration-500" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-6xl bg-brand-offset/90 border border-brand-glass-border rounded-[2.5rem] p-6 md:p-10 shadow-3xl overflow-hidden group h-[85vh] flex flex-col backdrop-blur-xl">
      <!-- Decoration -->
      <div class="absolute -top-24 -right-24 h-48 w-48 bg-brand-cyan/5 rounded-full blur-3xl group-hover:bg-brand-cyan/10 transition-all"></div>
      
      <div class="relative z-10 flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <Target class="h-5 w-5 text-brand-cyan" />
          {{ view === 'list' ? 'Gerenciar Metas' : (editingGoal ? 'Editar Meta' : 'Adicionar Nova Meta') }}

        </h3>
        <div class="flex items-center gap-2">
          <button v-if="view === 'form'" @click="view = 'list'" 
            class="px-3 py-1.5 rounded-lg bg-white/5 text-white/40 hover:text-white/80 text-[10px] font-bold uppercase transition-all">
            Voltar para Lista
          </button>
          <button @click="close" class="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X class="h-5 w-5 text-white/40" />
          </button>
        </div>
      </div>

      <!-- Content Switcher -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar relative z-10">
        <!-- List View -->
        <GoalList 
          v-if="view === 'list'" 
          :goals="goalStore.goals" 
          :business="allBusiness"
          @add="addNew"
          @edit="editGoal"
        />

        <!-- Form View -->
        <form v-else @submit.prevent="handleSubmit" class="space-y-6">

          <!-- Segmented Type Selector -->
          <div v-if="!showPeriodsOnly" class="space-y-2">
            <label class="text-[10px] font-black text-brand-cyan uppercase tracking-widest ml-1">Tipo de Alvo</label>
            <div class="relative flex rounded-2xl bg-brand-surface border border-brand-glass-border p-1 gap-0.5">
              <!-- Glider animado -->
              <div 
                class="absolute top-1 bottom-1 rounded-xl bg-brand-cyan/20 border border-brand-cyan/30 transition-all duration-300 ease-out pointer-events-none"
                :style="gliderStyle"
              ></div>
              <button
                v-for="opt in targetTypeOptions"
                :key="opt.value"
                type="button"
                :ref="el => setTabRef(el, opt.value)"
                @click="selectType(opt.value)"
                :class="[
                  'relative z-10 flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300',
                  form.target_type === opt.value
                    ? 'text-brand-cyan'
                    : 'text-white/30 hover:text-white/60'
                ]"
              >
                <component :is="opt.icon" class="h-3.5 w-3.5 flex-shrink-0" />
                {{ opt.label }}
              </button>
            </div>
          </div>


          <!-- Período -->
          <div v-if="!showPeriodsOnly" class="grid grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Mês</label>
              <CustomSelect 
                v-model="form.month" 
                :options="monthOptions"
                placeholder="Mês"
              />
            </div>
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Ano</label>
              <CustomSelect 
                v-model="form.year" 
                :options="yearOptions"
                placeholder="Ano"
              />
            </div>
          </div>


          <!-- Seleção do Alvo -->
          <div v-if="!showPeriodsOnly" class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Selecionar {{ targetLabel }}</label>
            <CustomSelect 
              v-model="form.target_id" 
              :options="targetIdOptions"
              :placeholder="'Selecione ' + targetLabel"
              searchable
            />
          </div>


          <!-- Métricas da Meta -->
          <div class="pt-4 border-t border-white/5">
            <div class="flex items-center gap-2 mb-4">
              <TrendingUp class="h-4 w-4 text-brand-cyan" />
              <span class="text-xs font-bold text-white/70 uppercase tracking-wider">Métricas da Meta (R$)</span>
            </div>
                  <Transition name="metrics-fade" mode="out-in">
              <div :key="form.target_type" class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-if="!showPeriodsOnly" class="space-y-1.5">
                  <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta P1</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                    <input v-model="form.p1" type="number" step="0.01"
                      class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                      placeholder="0,00">
                  </div>
                </div>


                <template v-if="showPeriodsOnly">
                  <div class="space-y-1.5">
                    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta Acumulada até D7</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                      <input v-model="form.p1_period_1" type="number" step="0.01"
                        class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                        placeholder="Automático">
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta Acumulada até D13</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                      <input v-model="form.p1_period_2" type="number" step="0.01"
                        class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                        placeholder="Automático">
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta Acumulada até D21</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                      <input v-model="form.p1_period_3" type="number" step="0.01"
                        class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                        placeholder="Automático">
                    </div>
                  </div>

                  <div class="space-y-1.5">
                    <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta Final P1 (Mês)</label>
                    <div class="relative">
                      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                      <input v-model="form.p1_period_4" type="number" step="0.01"
                        class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                        placeholder="Automático">
                    </div>
                  </div>

                  <!-- Info Box -->
                  <div class="md:col-span-2 lg:col-span-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <p class="text-[10px] text-white/30 uppercase tracking-wider leading-relaxed">
                      💡 <strong>Dica:</strong> Os campos acima definem os "marcos" na linha do gráfico. 
                      Se deixá-los vazios, o sistema calculará uma distribuição linear baseada na **Meta P1 Total** ({{ formatFullCurrency(form.p1 || 0) }}).
                    </p>
                  </div>

                </template>


                <div v-if="!showPeriodsOnly" class="space-y-1.5">
                  <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta TCV</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                    <input v-model="form.tcv" type="number" step="0.01"
                      class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                      placeholder="0,00">
                  </div>
                </div>
                <div v-if="!showPeriodsOnly" class="space-y-1.5">
                  <label class="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Meta NMRR</label>
                  <div class="relative">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20">R$</span>
                    <input v-model="form.nmrr" type="number" step="0.01"
                      class="w-full bg-brand-surface border border-brand-glass-border rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
                      placeholder="0,00">
                  </div>
                </div>

              </div>
            </Transition>
          </div>

          <div class="pt-6 flex gap-3 sticky bottom-0 bg-brand-offset py-2">
            <button type="button" @click="close"
              class="flex-1 px-4 py-4 rounded-xl bg-brand-surface border border-brand-glass-border text-xs font-bold hover:bg-white/5 transition-all">
              Cancelar
            </button>
            <button type="submit" :disabled="loading || !form.target_id"
              class="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/20">
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              <Save v-else class="h-4 w-4" />
              {{ loading ? 'Salvando...' : 'Salvar Meta' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Target, X, Loader2, Save, Building2, Users, User, TrendingUp } from 'lucide-vue-next';
import CustomSelect from '../ui/CustomSelect.vue';
import GoalList from './GoalList.vue';
import { useAuthStore } from '../../store/auth';
import { useSellerStore } from '../../store/seller';
import { useGoalStore } from '../../store/goals';
import { useTeamStore } from '../../store/team';
import { getBusiness } from '../../gen/hooks/getBusiness';
import client from '../../api/client';
import type { Business } from '../../gen/types/Business';
import type { Goal } from '../../api/goalService';

const props = defineProps<{
  isOpen: boolean;
  showPeriodsOnly?: boolean;
  initialView?: 'list' | 'form';
  initialTarget?: { type: string; id: string } | null;
}>();



const emit = defineEmits(['close', 'saved']);

const authStore = useAuthStore();
const sellerStore = useSellerStore();
const goalStore = useGoalStore();
const teamStore = useTeamStore();

const view = ref<'list' | 'form'>('list');
const editingGoal = ref<Goal | null>(null);
const loading = ref(false);
const allBusiness = ref<Business[]>([]);

const form = ref({
  target_type: 'seller' as 'seller' | 'head' | 'team' | 'bu',
  target_id: '' as string | number,
  p1: null as number | null,
  p1_period_1: null as number | null,
  p1_period_2: null as number | null,
  p1_period_3: null as number | null,
  p1_period_4: null as number | null,
  tcv: null as number | null,
  nmrr: null as number | null,
  implementation: null as number | null,
  monthly: null as number | null,

  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
});

const monthOptions = [
  { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
];

const yearOptions = [
  { value: 2024, label: '2024' },
  { value: 2025, label: '2025' },
  { value: 2026, label: '2026' },
  { value: 2027, label: '2027' },
  { value: 2028, label: '2028' }
];




const targetTypeOptions = computed(() => {
  const types: { value: string; label: string; icon: any }[] = [];
  const utype = authStore.user?.type;
  if (utype === 'admin') {
    types.push({ value: 'bu', label: 'BU', icon: Building2 });
    types.push({ value: 'seller', label: 'Vendedor', icon: User });
  } else if (utype === 'coord') {
    types.push({ value: 'bu', label: 'BU', icon: Building2 });
  } else if (utype === 'head') {
    types.push({ value: 'seller', label: 'Vendedor', icon: User });
  }
  return types;
});
// Glider: referências dos botões de tab para calcular posição/largura
const tabRefs = ref<Record<string, HTMLElement | null>>({});
const setTabRef = (el: any, value: string) => {
  tabRefs.value[value] = el as HTMLElement | null;
};

const gliderStyle = computed(() => {
  const el = tabRefs.value[form.value.target_type];
  if (!el) return { left: '4px', width: '0px' };
  const parent = el.parentElement;
  if (!parent) return { left: '4px', width: '0px' };
  return {
    left: `${el.offsetLeft}px`,
    width: `${el.offsetWidth}px`,
  };
});

const periodsSum = computed(() => {
  return (Number(form.value.p1_period_1 || 0) + 
          Number(form.value.p1_period_2 || 0) + 
          Number(form.value.p1_period_3 || 0) + 
          Number(form.value.p1_period_4 || 0));
});

const formatFullCurrency = (val: number | string | null | undefined) => {
  if (val === null || val === undefined) return 'R$ 0,00';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
};


const selectType = (value: string) => {
  form.value.target_type = value as 'seller' | 'head' | 'team' | 'bu';
  form.value.target_id = '';
  form.value.p1 = null;
  form.value.p1_period_1 = null;
  form.value.p1_period_2 = null;
  form.value.p1_period_3 = null;
  form.value.p1_period_4 = null;
  form.value.tcv = null;
  form.value.nmrr = null;
  form.value.implementation = null;
  form.value.monthly = null;

};

const targetLabel = computed(() => {
  if (form.value.target_type === 'bu') return 'BU';
  if (form.value.target_type === 'head') return 'Head';
  if (form.value.target_type === 'team') return 'Equipe';
  return 'Vendedor';
});

const targetIdOptions = computed(() => {
  if (form.value.target_type === 'bu') {
    let options = allBusiness.value.map(b => ({ value: b.id?.toString() || '', label: b.name || '' }));
    if (authStore.user?.type === 'admin') {
      options = options.filter(o => {
        const name = o.label.toLowerCase();
        return !(name.includes('3f') || name.includes('group') || name.includes('venture'));
      });
      options.unshift({ value: '99', label: '3F Venture' });
    }
    return options;
  } else if (form.value.target_type === 'team') {
    return teamStore.teams.map(t => ({ value: t.id.toString(), label: t.name }));
  } else if (form.value.target_type === 'head') {
    return sellerStore.allSellers.filter(s => s.type === 'head').map(s => ({ value: s.id?.toString() || '', label: s.name || '' }));
  } else {
    // Para tipo Seller
    const sellers = authStore.user?.type === 'head' ? sellerStore.teamSellers : sellerStore.allSellers;
    return sellers.filter(s => s.type === 'seller').map(s => ({ value: s.id?.toString() || '', label: s.name || '' }));
  }
});

const loadData = async () => {
    try {
        const utype = authStore.user?.type;
        if (utype === 'admin' || utype === 'coord' || utype === 'head') {
            const bus = await getBusiness({ client });
            allBusiness.value = bus as Business[];
            await teamStore.fetchTeams();
        }
        
        if (utype === 'admin' || utype === 'coord') {
            await sellerStore.fetchAllSellers();
        } else if (utype === 'head' && authStore.user?.id) {
            await sellerStore.fetchTeamSellers(authStore.user.id.toString());
            await sellerStore.fetchAllSellers(); // Também busca todos para nomes no histórico
        }
    } catch (err) {
        console.error('Erro ao carregar dados do modal de metas:', err);
    }
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    view.value = props.initialView || 'list';
    editingGoal.value = null;
    loadData();
    // Pre-carrega todas as metas para o dashboard
    goalStore.fetchGoals();

    // Se tiver um target inicial e estivermos em modo form, tenta carregar a meta existente
    if (props.initialView === 'form' && props.initialTarget) {
      const cleanId = props.initialTarget.id.toString().replace('team_', '').replace('head_own_', '');
      const existing = goalStore.getGoalByTarget(props.initialTarget.type, cleanId);
      if (existing) {
        editGoal(existing);
      } else {
        // Se não existir, inicia um novo form focado no target
        addNew();
        form.value.target_type = props.initialTarget.type as any;
        form.value.target_id = cleanId;
      }
    }
  }
});


const addNew = () => {
  editingGoal.value = null;
  form.value = {
    target_type: authStore.user?.type === 'coord' ? 'bu' : 'seller',
    target_id: '',
    p1: null,
    p1_period_1: null,
    p1_period_2: null,
    p1_period_3: null,
    p1_period_4: null,
    tcv: null,
    nmrr: null,
    implementation: null,
    monthly: null,

    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  };
  view.value = 'form';
};

const editGoal = (goal: Goal) => {
  editingGoal.value = goal;
  form.value = {
    target_type: goal.target_type as any,
    target_id: goal.target_id as any,
    p1: goal.p1 != null ? Number(goal.p1) : null,
    p1_period_1: goal.p1_period_1 != null ? Number(goal.p1_period_1) : null,
    p1_period_2: goal.p1_period_2 != null ? Number(goal.p1_period_2) : null,
    p1_period_3: goal.p1_period_3 != null ? Number(goal.p1_period_3) : null,
    p1_period_4: goal.p1_period_4 != null ? Number(goal.p1_period_4) : null,
    tcv: goal.tcv != null ? Number(goal.tcv) : null,
    nmrr: goal.nmrr != null ? Number(goal.nmrr) : null,
    implementation: goal.implementation != null ? Number(goal.implementation) : null,
    monthly: goal.monthly != null ? Number(goal.monthly) : null,

    month: goal.month || (new Date().getMonth() + 1),
    year: goal.year || new Date().getFullYear(),
  };
  view.value = 'form';
};

watch([() => form.value.target_id, () => form.value.month, () => form.value.year, () => form.value.target_type], async () => {
    if (!form.value.target_id) return;
    
    const existing = goalStore.goals.find(g => 
        g.target_type === form.value.target_type && 
        g.target_id.toString() === form.value.target_id.toString() &&
        g.month === form.value.month &&
        g.year === form.value.year
    );

    if (existing) {
        form.value.p1 = existing.p1 != null ? Number(existing.p1) : null;
        form.value.p1_period_1 = existing.p1_period_1 != null ? Number(existing.p1_period_1) : null;
        form.value.p1_period_2 = existing.p1_period_2 != null ? Number(existing.p1_period_2) : null;
        form.value.p1_period_3 = existing.p1_period_3 != null ? Number(existing.p1_period_3) : null;
        form.value.p1_period_4 = existing.p1_period_4 != null ? Number(existing.p1_period_4) : null;
        form.value.tcv = existing.tcv != null ? Number(existing.tcv) : null;
        form.value.nmrr = existing.nmrr != null ? Number(existing.nmrr) : null;
        form.value.implementation = existing.implementation != null ? Number(existing.implementation) : null;
        form.value.monthly = existing.monthly != null ? Number(existing.monthly) : null;
    } else {
        form.value.p1 = null;
        form.value.p1_period_1 = null;
        form.value.p1_period_2 = null;
        form.value.p1_period_3 = null;
        form.value.p1_period_4 = null;
        form.value.tcv = null;
        form.value.nmrr = null;
        form.value.implementation = null;
        form.value.monthly = null;
    }

});

const close = () => emit('close');

const handleSubmit = async () => {
  loading.value = true;
  try {
  // No modo de períodos, não sobrescrevemos mais o P1 automaticamente.
  // O P1 é a meta mestre definida na aba principal.
  
  await goalStore.saveGoal({
    ...form.value,
    target_id: form.value.target_id.toString()
  });



    emit('saved');
    view.value = 'list'; // Volta para a lista após salvar
  } catch (err) {
    console.error('Erro ao salvar meta:', err);
  } finally {
    loading.value = false;
  }
};
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

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}
input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Transição das métricas ao trocar tipo */
.metrics-fade-enter-active,
.metrics-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.metrics-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.metrics-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
