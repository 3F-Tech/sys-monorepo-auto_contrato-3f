<template>
  <div class="min-h-screen bg-brand-deep text-white font-sans selection:bg-brand-cyan/30">

    <!-- Header -->
    <header class="border-b border-brand-glass-border bg-brand-offset/50 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-brand-deep font-bold text-lg shadow-lg shadow-brand-cyan/20">
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white/90 leading-tight">{{ user?.name }}</h2>
            <p class="text-[11px] text-brand-cyan uppercase tracking-wider font-medium">{{ userRoleLabel }}</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="sellerStore.loading" class="flex items-center gap-2 mr-2">
            <div class="h-2 w-2 rounded-full bg-brand-cyan animate-ping"></div>
            <span class="text-[10px] text-brand-cyan/70 font-bold uppercase tracking-widest">Sincronizando...</span>
          </div>
          <button @click="profileModalOpen = true"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-glass-border hover:bg-white/10 transition-all text-xs font-semibold text-brand-cyan hover:text-brand-cyan/80">
            <UserIcon class="h-4 w-4" />
            Configurar Perfil
          </button>
          <button @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-glass-border hover:bg-white/10 transition-all text-xs font-semibold text-white/70 hover:text-white">
            <LogOut class="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Modals -->
    <ProfileModal :is-open="profileModalOpen" @close="profileModalOpen = false" @updated="handleProfileUpdated" />
    <SetGoalModal :is-open="goalModalOpen" :show-periods-only="goalModalMode === 'periods'"
      :initial-view="goalModalMode === 'periods' ? 'form' : 'list'" :initial-target="activeTarget"
      @saved="handleGoalSaved" @close="goalModalOpen = false" />
    <SetCostsModal :is-open="costsModalOpen" :month="selectedMonthNum" :year="selectedYearNum"
      @close="costsModalOpen = false" @saved="handleCostsSaved" />



    <ConfirmModal :is-open="dissociateConfirmOpen" title="Remover da Equipe"
      :message="`Tem certeza que deseja remover este vendedor da sua equipe? Ele continuará no sistema, mas deixará de estar sob sua gestão.`"
      confirm-text="Remover" cancel-text="Manter" type="warning" icon="circle" @confirm="confirmDissociate"
      @cancel="dissociateConfirmOpen = false" />


    <main class="max-w-7xl mx-auto px-6 py-8 space-y-4">
      <!-- Welcome Section -->
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pb-6 border-b border-white/5">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Olá, <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">{{ firstName
            }}</span>.
          </h1>
          <p class="text-white/40 text-sm md:text-base max-w-xl font-medium leading-relaxed">
            Sua central de inteligência para gestão e automação de contratos da <span class="text-white/70">3F
              Venture</span>.
          </p>
        </div>

        <div class="flex flex-row justify-center items-center gap-2">
          <Calendar class="h-3 w-3 text-brand-cyan" />
          <span class="text-white/30 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">{{ new
            Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}</span>
        </div>
      </section>

      <!-- Dynamic Filter Bar (Now Sticky for the whole dashboard) -->
      <div
        class="sticky top-20 z-40 pb-4 -mx-2 px-4 bg-brand-deep/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-brand-deep/50 flex flex-wrap items-center gap-4">

        <!-- Mode Toggle (Only for Admin/Coord) -->
        <div v-if="['admin', 'coord'].includes(user?.type || '')"
          class="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button @click="dashboardFilterType = 'bu'"
            :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Por BU
          </button>
          <button @click="dashboardFilterType = 'team'"
            :class="dashboardFilterType === 'team' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Por Equipe
          </button>
        </div>

        <!-- Head (Coordenador) Switcher -->
        <div v-if="user?.type === 'head'" class="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button
            @click="dashboardFilterType = 'team'"
            :class="(dashboardFilterType === 'team' && selectedTeamId && !selectedTeamId?.startsWith('head_own_')) ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Minhas Equipes
          </button>
          <button @click="dashboardFilterType = 'bu'"
            :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Minhas BUs
          </button>
        </div>

        <!-- Seller/SDR Mode Toggle -->
        <div v-if="['seller', 'sdr'].includes(user?.type || '') && user?.team_id"
          class="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button @click="selectedSellerId = user?.id?.toString() || ''; selectedTeamId = ''"
            :class="selectedSellerId ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Minha Meta
          </button>
          <button @click="selectedSellerId = ''; selectedTeamId = 'team_' + user?.team_id"
            :class="selectedTeamId ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">
            Meta Equipe
          </button>
        </div>

        <!-- BU Filter (In Mode BU or Coord) -->
        <div v-if="dashboardFilterType === 'bu' && ['admin', 'coord', 'head'].includes(user?.type || '')"
          class="min-w-[200px] flex-1 md:flex-none">
          <CustomSelect v-model="selectedBUId" :options="buOptionsFormatted" placeholder="Selecionar BU"
            :icon="Building2" />
        </div>

        <!-- Coordinator Filter (Admin only) -->
        <div v-if="dashboardFilterType === 'coord' && user?.type === 'admin'" class="min-w-[260px] flex-1 md:flex-none">
          <CustomSelect v-model="selectedCoordId" :options="coordOptionsFormatted" placeholder="Selecionar Coordenador"
            :icon="Users" searchable />
        </div>

        <!-- Team/Seller Filters (In Mode Team or for Seller) -->
        <template v-if="dashboardFilterType === 'team' || (user?.type === 'seller')">
          <!-- Team Filter -->
          <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" class="min-w-[260px] flex-1 md:flex-none">
            <CustomSelect v-model="selectedTeamId" :options="teamOptionsFormatted"
              :placeholder="['seller', 'sdr'].includes(user?.type || '') ? 'Minha Meta vs Equipe' : 'Selecionar Equipe'"
              :icon="Users" searchable :allow-clear="true" />

          </div>

          <!-- Hidden filter when in Minha Meta to ensure logic clarity -->
          <div v-if="user?.type === 'head' && selectedTeamId?.startsWith('head_own_')" class="hidden"></div>


          <!-- Seller Filter (For Admin, Coord, Head, etc) -->
          <div
            v-if="['admin', 'coord', 'head'].includes(user?.type || '') && !(user?.type === 'head' && selectedTeamId?.startsWith('head_own_'))"
            class="min-w-[260px] flex-1 md:flex-none">
            <CustomSelect v-model="selectedSellerId" :options="sellerOptionsFormatted" placeholder="Selecionar Vendedor"
              :icon="Users2" searchable allow-clear />
          </div>
        </template>

        <!-- Month Filter (Common) -->
        <div class="min-w-[200px] flex-1 md:flex-none">
          <CustomSelect v-model="selectedMonth" :options="extendedMonthOptionsFormatted" placeholder="Selecione o Mês"
            :icon="Calendar" :allow-clear="false" />
        </div>
      </div>

      <!-- Goals Dashboard Area -->
      <GoalsDashboard :goal="activeGoal || null" :actuals="currentPerformance" :contracts="filteredP1Contracts"
        @open-settings="handleOpenGoalSettings('goals')" @open-periods="handleOpenGoalSettings('periods')"
        @open-costs="costsModalOpen = true" />



      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div class="space-y-1">
          <h2 class="text-lg font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
            <TrendingUp class="h-4 w-4 text-brand-cyan" />
            Performance
          </h2>
          <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Indicadores sincronizados em tempo
            real</p>
        </div>
      </div>
      <!-- Stats Grid (Grouped by Category) -->
      <div class="space-y-8">
        <!-- Indicadores Financeiros -->
        <section>
          <div class="flex items-center gap-3 mb-4 ml-2">
            <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Indicadores Financeiros</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            <div v-for="(stat, index) in stats.filter(s => s.type === 'finance')" :key="stat.label"
              class="p-6 rounded-[1.5rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.05] transition-all duration-500 group relative overflow-hidden"
              :style="{ animationDelay: (index * 100) + 'ms' }">


              <div
                class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:text-brand-cyan transition-all duration-700 pointer-events-none">
                <component :is="stat.icon" class="h-32 w-32 rotate-[-15deg]" />
              </div>

              <div class="flex items-center justify-between mb-4 relative z-10">
                <div
                  class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                  <component :is="stat.icon" class="h-5 w-5" />
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Status</span>
                  <span class="text-[9px] font-bold text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              <div class="space-y-1 relative z-10">
                <div class="flex items-center gap-1.5">
                  <p class="text-white/50 text-[10px] font-bold uppercase tracking-[0.1em] leading-tight">{{ stat.label
                  }}</p>
                  <Info v-if="stat.tooltip" :title="stat.tooltip"
                    class="h-3 w-3 text-white/20 cursor-help hover:text-brand-cyan transition-colors" />
                </div>
                <div class="flex items-baseline gap-1">
                  <div v-if="isLoading" class="space-y-2 mb-1">
                    <div class="h-8 w-32 bg-white/10 rounded-xl animate-pulse relative overflow-hidden">
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer">
                      </div>
                    </div>
                  </div>
                  <h3 v-else
                    class="text-[26px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300">
                    {{ stat.value }}
                  </h3>
                </div>
              </div>
              <div
                class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </div>
          </div>
        </section>

        <!-- Indicadores Operacionais & Equipe -->
        <section>
          <div class="flex items-center gap-3 mb-4 ml-2">
            <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(45,212,191,0.5)]"></div>
            <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Operação e Estrutura</h3>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-5">
            <div v-for="(stat, index) in stats.filter(s => s.type !== 'finance')" :key="stat.label"
              class="p-6 rounded-[1.5rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/50 hover:bg-brand-cyan/[0.05] transition-all duration-500 group relative overflow-hidden"
              :style="{ animationDelay: (index * 100) + 'ms' }">

              <div
                class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:text-brand-cyan transition-all duration-700 pointer-events-none">
                <component :is="stat.icon" class="h-32 w-32 rotate-[-15deg]" />
              </div>

              <div class="flex items-center justify-between mb-4 relative z-10">
                <div
                  class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                  <component :is="stat.icon" class="h-5 w-5" />
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Status</span>
                  <span class="text-[9px] font-bold text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              <div class="space-y-1 relative z-10">
                <p class="text-white/50 text-[10px] font-bold uppercase tracking-[0.1em] leading-tight">{{ stat.label }}
                </p>
                <div class="flex items-baseline gap-1">
                  <div v-if="isLoading" class="space-y-2 mb-1">
                    <div class="h-8 w-24 bg-white/10 rounded-xl animate-pulse relative overflow-hidden">
                      <div
                        class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer">
                      </div>
                    </div>
                  </div>
                  <h3 v-else
                    class="text-[26px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300">
                    {{ stat.value }}
                  </h3>
                </div>
              </div>
              <div
                class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity">
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- Contract Management List -->
      <section class="space-y-6">
        <ContractList :contracts="filteredGeneralContracts" :isHead="user?.type === 'head'"
          :isLeadership="['head', 'coord', 'admin'].includes(user?.type || '')" :filterMode="contractFilterMode"
          :businessUnits="businessList" :sellers="sellerStore.allSellers" :loading="isLoading"
          @update:filterMode="handleFilterModeChange" />
      </section>

      <!-- Team/BU Users Section (Legacy removed for all Leadership) -->
      <section v-if="false" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <Users2 class="h-5 w-5 text-brand-cyan" />
            Integrantes da BU
          </h3>
          <div class="flex items-center justify-between gap-4">
            <div class="relative group/search">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 group-focus-within/search:text-brand-cyan transition-colors" />
              <input v-model="searchQuery" type="text" placeholder="Buscar por nome..."
                class="pl-9 pr-4 py-1.5 rounded-lg bg-brand-surface border border-brand-glass-border text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 focus:bg-brand-cyan/5 transition-all w-48" />
            </div>
            <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">{{ visibleUsers.length }}
              Integrantes</span>
          </div>
        </div>

        <div v-if="sellerStore.loading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="i in 3" :key="i"
            class="h-32 rounded-2xl bg-brand-offset/50 animate-pulse border border-brand-glass-border"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div v-for="seller in visibleUsers" :key="seller.id"
            class="p-6 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all flex items-center justify-between group">
            <div class="flex items-center gap-4">
              <div
                class="h-12 w-12 rounded-full bg-brand-surface border border-brand-glass-border flex items-center justify-center text-brand-cyan font-bold group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all">
                {{ seller.name ? seller.name[0] : '?' }}
              </div>
              <div>
                <h4 class="font-bold text-sm">{{ seller.name }}</h4>
                <p class="text-[10px] text-white/40 uppercase tracking-wider font-medium">{{ getRoleLabel(seller.type)
                }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Action Grid -->
      <section class="space-y-6">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <LayoutGrid class="h-5 w-5 text-brand-cyan" />
          Geração de Contratos
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <button v-for="action in filteredActions" :key="action.title"
            @click="action.handler ? action.handler() : null"
            class="text-left p-10 rounded-[2.5rem] bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/50 hover:bg-white/[0.02] transition-all duration-500 group relative overflow-hidden flex flex-col items-start gap-8 shadow-2xl hover:shadow-brand-cyan/5">

            <!-- Graphic background detail -->
            <div
              class="absolute -right-10 -top-10 h-40 w-40 bg-brand-cyan/5 blur-3xl rounded-full group-hover:bg-brand-cyan/10 transition-colors">
            </div>

            <div
              class="p-5 rounded-2xl bg-brand-surface border border-brand-glass-border text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-500 shadow-xl">
              <component :is="action.icon" class="h-10 w-10" />
            </div>
            <div class="space-y-3">
              <h4 class="text-2xl font-black text-white group-hover:text-brand-cyan transition-colors">{{
                action.title }}</h4>
              <p class="text-white/40 text-sm leading-relaxed font-medium">{{ action.description }}</p>
            </div>

            <div
              class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-cyan opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
              Começar agora
              <ArrowRight class="h-3 w-3" />
            </div>
          </button>
        </div>
      </section>

      <!-- Team Manager (Dynamic placement) -->
      <section v-if="['admin', 'head', 'coord'].includes(user?.type || '')" class="pt-4">
        <TeamManager />
      </section>




      <!-- Management section for admin, head and coord -->
      <section v-if="['admin', 'head', 'coord'].some(r => r === user?.type)"
        class="p-10 rounded-3xl bg-gradient-to-br from-brand-offset to-brand-deep border border-brand-glass-border relative overflow-hidden text-center space-y-6">
        <div class="h-20 w-20 mx-auto rounded-3xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
          <Settings class="h-10 w-10 animate-spin-slow" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold">Gestão do Sistema</h2>
          <p class="text-white/40 text-sm max-w-md mx-auto">
            {{ user?.type === 'admin' ? 'Gerencie usuários, permissões e unidades de negócio de toda a plataforma.' :
              'Gerencie os usuários e permissões da sua equipe ou unidade.' }}
          </p>
        </div>
        <div class="flex flex-wrap justify-center gap-4">
          <button @click="router.push('/admin/users')"
            class="px-6 py-2.5 rounded-xl bg-brand-cyan font-bold text-brand-deep hover:brightness-110 active:scale-95 transition-all">
            Gerenciar Usuários
          </button>
          <button v-if="user?.type === 'admin'" @click="router.push('/admin/business')"
            class="px-6 py-2.5 rounded-xl bg-brand-surface border border-brand-glass-border font-bold hover:bg-white/10 transition-all">
            Configurar BUs
          </button>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { useSellerStore } from '../store/seller';
import { useContractStore } from '../store/contracts';
import { useGoalStore } from '../store/goals';
import { type Goal } from '../api/goalService';
import type { Sellers } from '../gen/types/Sellers';
import type { Business } from '../gen/types/Business';
import { getBusiness } from '../gen/hooks/getBusiness';
import client from '../api/client';
import {
  LogOut,
  FileText,
  Users,
  Building2,
  LayoutGrid,
  ArrowRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Settings,
  Users2,
  User as UserIcon,
  UserPlus,
  UserMinus,
  Check,
  Search,
  Calendar,
  X,
  ChevronDown as ChevronDownIcon,
  Clock,
  Activity,
  Construction,
  Briefcase,
  Target,
  Info
} from 'lucide-vue-next';
import ProfileModal from '../components/profile/ProfileModal.vue';
import GoalsDashboard from '../components/dashboard/GoalsDashboard.vue';
import SetGoalModal from '../components/dashboard/SetGoalModal.vue';
import ContractList from '../components/contracts/ContractList.vue';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import TeamManager from '../components/dashboard/TeamManager.vue';
import { useToast } from '../composables/useToast';
import CustomSelect from '../components/ui/CustomSelect.vue';
import { useTeamStore } from '../store/team';
import { useCacStore } from '../store/cac';
import { useCostsStore } from '../store/costs';
import SetCostsModal from '../components/dashboard/SetCostsModal.vue';


const authStore = useAuthStore();
const sellerStore = useSellerStore();
const contractStore = useContractStore();
const goalStore = useGoalStore();
const teamStore = useTeamStore();
const costsStore = useCostsStore();
const cacStore = useCacStore();
const router = useRouter();
const toast = useToast();

const profileModalOpen = ref(false);
const goalModalOpen = ref(false);
const costsModalOpen = ref(false);
const goalModalMode = ref<'goals' | 'periods'>('goals');
const activeTarget = ref<{ type: string; id: string } | null>(null);
const isEditingTeam = ref(false);


const searchQuery = ref('');
const contractFilterMode = ref<'own' | 'team'>('own');
const businessList = ref<Business[]>([]);

// Dashboard Filters State
const dashboardFilterType = ref<'bu' | 'team' | 'coord'>((authStore.user?.type === 'coord' || authStore.user?.type === 'admin') ? 'bu' : 'team');
const selectedBUId = ref<string | null>(authStore.user?.type === 'admin' ? '99' : null);
const selectedCoordId = ref<string | null>(null);
const selectedTeamId = ref<string | null>(null);
const selectedSellerId = ref<string | null>(null);

watch(() => authStore.user, (u) => {
  if (u?.type === 'head') {
    dashboardFilterType.value = 'bu';
    selectedBUId.value = '99'; // Default to "Todas" for Coordenador (Head)
  }
  if (u?.type === 'admin' && !selectedBUId.value) {
    selectedBUId.value = '99';
  }
}, { immediate: true });

const handleOpenGoalSettings = (mode: 'goals' | 'periods') => {
  if (mode === 'periods' && activeGoal.value) {
    activeTarget.value = {
      type: activeGoal.value.target_type,
      id: activeGoal.value.target_id.toString()
    };
  } else {
    activeTarget.value = null;
  }

  goalModalMode.value = mode;
  goalModalOpen.value = true;
};


const dissociateConfirmOpen = ref(false);

const sellerToDissociate = ref<string | null>(null);

// Performance & Optimization State
const isFiltering = ref(false);
const isLoading = computed(() => contractStore.loading || isFiltering.value);

const currentPerformance = computed(() => {
  const p1Contracts = signedP1Contracts.value;
  const genContracts = signedGeneralContracts.value;

  const p1 = p1Contracts.reduce((acc, curr) => {
    const fpa = parseFloat(curr.first_payment_amount as any) || 0;
    if (fpa > 0) return acc + fpa;
    const impl = parseFloat(curr.implementation_fee as any) || 0;
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    return acc + impl + monthly;
  }, 0);

  const tcv = genContracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (monthly * term) + implementation;
  }, 0);

  const nmrr = genContracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (implementation / term) + monthly;
  }, 0);

  const implementation = genContracts.reduce((acc, curr) => acc + (parseFloat(curr.implementation_fee as any) || 0), 0);
  const monthly = genContracts.reduce((acc, curr) => acc + (parseFloat(curr.monthly_fee as any) || 0), 0);

  return { p1, tcv, nmrr, implementation, monthly };
});

const selectedMonthNum = computed(() => {
  const [_, month] = selectedMonth.value.split('-').map(Number);
  return month;
});

const selectedYearNum = computed(() => {
  const [year, _] = selectedMonth.value.split('-').map(Number);
  return year;
});

const currentCacValue = computed(() => {
  // Conforme solicitado, CAC = Valor Total P1 / Número de Contratos Assinados
  const p1Contracts = signedP1Contracts.value;
  const totalP1 = p1Contracts.reduce((acc, curr) => {
    const fpa = parseFloat(curr.first_payment_amount as any) || 0;
    if (fpa > 0) return acc + fpa;
    const impl = parseFloat(curr.implementation_fee as any) || 0;
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    return acc + impl + monthly;
  }, 0);

  const signedCount = signedGeneralContracts.value.length;

  if (signedCount === 0) return 0;
  return totalP1 / signedCount;
});

const activeGoal = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);

  if (dashboardFilterType.value === 'bu') {
    const buId = selectedBUId.value || (user.value?.type === 'coord' ? (user.value as any)?.seller_business?.[0]?.business_id?.toString() : null);
    if (!buId) return null;

    // Se for 'Todas' (99) e for Coordenador (Head/Coord), soma suas BUs
    if (buId === '99' && (user.value?.type === 'head' || user.value?.type === 'coord')) {
      const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id.toString()) || [];
      const buGoals = goalStore.goals.filter(g => g.target_type === 'bu' && myBUIds.includes(g.target_id.toString()) && g.month === month && g.year === year);
      return sumGoals(buGoals, user.value.type, user.value.id.toString(), month, year);
    }

    return goalStore.getGoalByTarget('bu', buId);
  }

  if (dashboardFilterType.value === 'coord') {
    if (!selectedCoordId.value) return null;
    const head = sellerStore.allSellers.find(s => s.id?.toString() === selectedCoordId.value);
    const buIds = (head as any)?.seller_business?.map((sb: any) => sb.business_id.toString()) || [];
    if (buIds.length === 0) return null;

    const buGoals = goalStore.goals.filter(g => g.target_type === 'bu' && buIds.includes(g.target_id.toString()) && g.month === month && g.year === year);
    return sumGoals(buGoals, 'head', selectedCoordId.value, month, year) || null;
  }

  // Lógica para Equipe ou Vendedor
  if (selectedSellerId.value) {
    return goalStore.getGoalByTarget('seller', selectedSellerId.value);
  }

  const teamIdStr = selectedTeamId.value;
  if (!teamIdStr) return null;

  // Caso 1: Minha Meta (Head) - Soma das BUs dele
  if (teamIdStr.startsWith('head_own_')) {
    const headId = teamIdStr.replace('head_own_', '');
    const head = sellerStore.allSellers.find(s => s.id?.toString() === headId);
    const buIds = (head as any)?.seller_business?.map((sb: any) => sb.business_id.toString()) || [];
    if (buIds.length === 0) return null;

    const buGoals = goalStore.goals.filter(g => g.target_type === 'bu' && buIds.includes(g.target_id.toString()) && g.month === month && g.year === year);
    return sumGoals(buGoals, 'head', headId, month, year);
  }

  // Caso 2: Meta de Equipe - Soma dos Vendedores
  if (teamIdStr.startsWith('team_')) {
    const teamId = parseInt(teamIdStr.replace('team_', ''));
    const team = teamStore.teams.find(t => t.id === teamId);
    if (!team) return null;

    // Tenta encontrar uma meta definida diretamente para a Equipe
    const directTeamGoal = goalStore.goals.find(g =>
      g.target_type === 'team' &&
      (g.target_id.toString() === teamIdStr || g.target_id.toString() === teamId.toString()) &&
      g.month === month &&
      g.year === year
    );
    if (directTeamGoal) return directTeamGoal;

    const memberIds = team.sellers_sellers_team_idToteams?.map((m: any) => m.id.toString()) || [];
    const memberGoals = goalStore.goals.filter(g =>
      g.target_type === 'seller' &&
      memberIds.includes(g.target_id.toString()) &&
      g.month === month &&
      g.year === year
    );

    return sumGoals(memberGoals, 'team', teamId.toString(), month, year);
  }

  const members = sellerStore.allSellers.filter(s => s.head_id?.toString() === teamIdStr || s.id?.toString() === teamIdStr);
  const memberIds = members.map(m => m.id?.toString() || '');

  // Tenta encontrar uma meta definida diretamente para o Head/Equipe
  const directGoal = goalStore.goals.find(g =>
    (g.target_type === 'head' || g.target_type === 'team') &&
    (g.target_id.toString() === teamIdStr ||
      g.target_id.toString() === teamIdStr.replace('team_', '').replace('head_own_', '')) &&
    g.month === month &&
    g.year === year
  );

  if (directGoal) return directGoal;

  // Se não houver meta direta, soma as metas individuais dos vendedores
  const memberGoals = goalStore.goals.filter(g =>
    g.target_type === 'seller' &&
    memberIds.includes(g.target_id.toString()) &&
    g.month === month &&
    g.year === year
  );

  return sumGoals(memberGoals, 'team', teamIdStr, month, year) || null;
});

const sumGoals = (goals: Goal[], type: string, id: string, month: number, year: number): Goal | null => {
  if (!goals.length) return null;
  // Limpa o ID de qualquer prefixo (ex: team_123 -> 123)
  const cleanId = id.replace('team_', '').replace('head_own_', '');

  const init = { p1: 0, tcv: 0, nmrr: 0, implementation: 0, monthly: 0 };

  const result = goals.reduce((acc, g) => {
    acc.p1 += Number(g.p1 || 0);
    acc.tcv += Number(g.tcv || 0);
    acc.nmrr += Number(g.nmrr || 0);
    acc.implementation += Number(g.implementation || 0);
    acc.monthly += Number(g.monthly || 0);
    return acc;
  }, { ...init });

  // Retornamos os períodos como null para que o gráfico da equipe/BU
  // siga uma linha linear baseada no total somado, sem "herdar" conflitos
  // de curvas individuais dos vendedores, a menos que uma meta específica
  // seja criada para o grupo.
  return {
    ...result,
    id: 0,
    target_type: type,
    target_id: cleanId,
    month,
    year,
    p1_period_1: null,
    p1_period_2: null,
    p1_period_3: null,
    p1_period_4: null
  } as any;
};


const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Usuário');
const userInitials = computed(() => user.value?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '??');

const buOptionsFormatted = computed(() => {
  const options: { value: string; label: string }[] = [];


  // Opção consolidada para Administradores e Coordenadores
  if (user.value?.type === 'admin') {
    options.push({ value: '99', label: '3F Venture' });
  } else if (user.value?.type === 'head' || user.value?.type === 'coord') {
    options.push({ value: '99', label: 'Todas' });
  }

  businessList.value.forEach(bu => {
    // Para Admin, evita duplicatas de nomenclaturas de grupo
    if (user.value?.type === 'admin') {
      const name = bu.name?.toLowerCase() || '';
      if (name.includes('3f') || name.includes('group') || name.includes('venture')) return;
    }

    // Para Head e Coord, mostra apenas as BUs às quais ele está vinculado
    if (user.value?.type === 'head' || user.value?.type === 'coord') {
      const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
      if (!myBUIds.includes(bu.id)) return;
    }

    options.push({ value: bu.id?.toString() || '', label: bu.name || '' });
  });

  return options;
});

const coordOptionsFormatted = computed(() => {
  const options: { value: string; label: string }[] = [];

  sellerStore.allSellers
    .filter(s => s.type === 'head')
    .forEach(h => {
      options.push({ value: h.id?.toString() || '', label: h.name || '' });
    });
  return options;
});

const teamOptionsFormatted = computed(() => {
  const options: { value: string; label: string }[] = [];

  // Para ADMIN, HEAD e COORD, mostramos as equipes REAIS cadastradas
  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    teamStore.teams.forEach(t => {
      options.push({ value: `team_${t.id}`, label: t.name });
    });
    return options;
  }

  // Para Vendedor, permite alternar entre sua meta individual e a da sua equipe
  if (user.value?.type === 'seller' && user.value.team_id) {
    const myTeam = teamStore.teams.find(t => t.id === user.value?.team_id);
    options.push({ value: `team_${user.value.team_id}`, label: myTeam?.name || 'Minha Equipe' });
  }

  return options;
});

const sellerOptionsFormatted = computed(() => {
  let sellers = sellerStore.allSellers;

  if (selectedTeamId.value) {
    if (selectedTeamId.value.startsWith('head_own_')) {
      const headId = selectedTeamId.value.replace('head_own_', '');
      sellers = sellers.filter(s => s.id?.toString() === headId);
    } else if (selectedTeamId.value.startsWith('team_')) {
      const teamId = parseInt(selectedTeamId.value.replace('team_', ''));
      sellers = sellers.filter(s => s.team_id === teamId);
    } else {
      sellers = sellers.filter(s => s.id?.toString() === selectedTeamId.value || s.head_id?.toString() === selectedTeamId.value);
    }
  }

  return [
    ...sellers.map(s => ({
      value: s.id?.toString() || '',
      label: s.id?.toString() === user.value?.id?.toString() ? `${s.name} (Eu)` : (s.name || '')
    }))
  ];
});

const extendedMonthOptionsFormatted = computed(() => [
  ...extendedMonthOptions.value.map(m => ({ value: m.value, label: m.labelFull }))
]);

// Month Filter Logic (Native JS)
const selectedMonth = ref(new Date().toISOString().substring(0, 7));

const monthOptions = computed(() => {
  const current = new Date();

  const getLabel = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  const getValue = (d: Date) => d.toISOString().substring(0, 7);

  const prev = new Date(current); prev.setMonth(current.getMonth() - 1);
  const next = new Date(current); next.setMonth(current.getMonth() + 1);

  return [
    { label: getLabel(prev), value: getValue(prev) },
    { label: 'Atual', value: getValue(current) },
    { label: getLabel(next), value: getValue(next) },
  ];
});

const extendedMonthOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(currentYear, i, 1);
    return {
      labelFull: d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      value: d.toISOString().substring(0, 7)
    };
  });
});

// Pre-processamento para evitar conversões de data repetitivas e fuso horário errado (ISO UTC)
const getMonthISO = (dateStr: string | null | undefined) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}`;
};

const processedContracts = computed(() => {
  return contractStore.myContracts.map(c => ({
    ...c,
    _monthCreated: getMonthISO(c.created_at),
    _monthDue: getMonthISO(c.due_date)
  }));
});

const contractsForP1 = computed(() => {
  let allContracts = processedContracts.value;
  if (!selectedMonth.value) return allContracts;

  const [year, month] = selectedMonth.value.split('-').map(Number);
  // O Mês de Competência P1 segundo a Regra do Dashboard:
  // 06 do Mês Selecionado até 05 do Mês Seguinte.
  // Em JS Date (0-indexed), o Mês Selecionado é (month - 1). O mês seguinte é (month).
  const startDate = new Date(year, month - 1, 6, 0, 0, 0);
  const endDate = new Date(year, month, 5, 23, 59, 59);

  return allContracts.filter(c => {
    // Prioridade: first_payment_date > signed_date > created_at
    // signed_date: contratos assinados dentro da janela P1 sem first_payment_date preenchido
    const targetDateStr = c.first_payment_date || c.signed_date || c.created_at;
    if (!targetDateStr) return false;
    const targetDate = new Date(targetDateStr);
    return targetDate >= startDate && targetDate <= endDate;
  });
});

const contractsForGeneralPerformance = computed(() => {
  let allContracts = processedContracts.value;
  if (!selectedMonth.value) return allContracts;

  const [year, month] = selectedMonth.value.split('-').map(Number);
  const startDate = new Date(year, month - 1, 1, 0, 0, 0); // Dia 01 do mês selecionado
  const endDate = new Date(year, month, 0, 23, 59, 59);    // Último dia do mês

  return allContracts.filter(c => {
    // Para indicadores gerais (TCV, NMRR), aceitamos qualquer contrato ASSINADO no mês
    // ou gerado no mês. Prioridade para signed_date.
    const targetDateStr = c.signed_date || c.created_at;
    if (!targetDateStr) return false;
    const targetDate = new Date(targetDateStr);
    return targetDate >= startDate && targetDate <= endDate;
  });
});

const applyFilters = (contracts: any[]) => {
  let filtered = contracts;

  // 1. Filtragem por BU
  if (dashboardFilterType.value === 'bu' && selectedBUId.value) {
    const buIdNum = Number(selectedBUId.value);
    if (buIdNum === 99) {
      // Se for Coordenador (Head ou Coord), filtra apenas pelas BUs dele
      if (user.value?.type === 'head' || user.value?.type === 'coord') {
        const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
        filtered = filtered.filter(c => myBUIds.includes(c.bu_id));
      }
      // Se for Admin, 99 (Venture) vê tudo, então não filtra.
    } else {
      filtered = filtered.filter(c => c.bu_id === buIdNum);
    }
  }

  // 2. Filtragem por Equipe
  if (dashboardFilterType.value === 'team' && selectedTeamId.value) {
    const teamIdStr = selectedTeamId.value;
    const teamMembersSet = new Set<string>();

    if (teamIdStr.startsWith('team_')) {
      const teamId = parseInt(teamIdStr.replace('team_', ''));
      const team = teamStore.teams.find(t => t.id === teamId);
      team?.sellers_sellers_team_idToteams?.forEach((m: any) => teamMembersSet.add(m.id.toString()));
    } else {
      // Caso clássico: Head ID ou "Minha Meta" (head_own_X)
      const cleanId = teamIdStr.replace('head_own_', '');
      teamMembersSet.add(cleanId);
      sellerStore.allSellers.forEach(s => {
        if (s.head_id?.toString() === cleanId) {
          teamMembersSet.add(s.id?.toString() || '');
        }
      });
    }
    filtered = filtered.filter(c => c.seller_id && teamMembersSet.has(c.seller_id.toString()));
  }

  // 3. Filtragem por Vendedor Individual
  if (selectedSellerId.value) {
    filtered = filtered.filter(c => c.seller_id.toString() === selectedSellerId.value.toString());
  }

  // 4. Segurança de Papel: Se for vendedor comum ou sdr, vê só os próprios
  if (user.value?.type === 'seller' || user.value?.type === 'sdr') {
    filtered = filtered.filter(c => c.seller_id === user.value?.id);
  }

  return filtered;
};

const filteredP1Contracts = computed(() => {
  const result = applyFilters(contractsForP1.value);
  console.log('[DEBUG] filteredP1Contracts count:', result.length, 'Window:', selectedMonth.value);
  return result;
});
const filteredGeneralContracts = computed(() => {
  const result = applyFilters(contractsForGeneralPerformance.value);
  console.log('[DEBUG] filteredGeneralContracts count:', result.length);
  return result;
});

// Contratos assinados apenas para os cálculos de valores
const signedP1Contracts = computed(() => filteredP1Contracts.value.filter(c => c.signed));
const signedGeneralContracts = computed(() => filteredGeneralContracts.value.filter(c => c.signed));

// Opções Dinâmicas para os Filtros
const filterBUOptions = computed(() => {
  if (user.value?.type === 'admin') return businessList.value;
  if (user.value?.type === 'coord' || user.value?.type === 'head') {
    const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
    return businessList.value.filter(b => myBUIds.includes(b.id));
  }
  return [];
});

const filterSellerOptions = computed(() => {
  if (!user.value) return [];
  const all = [...sellerStore.allSellers];

  // Garante que o usuário atual esteja na lista se ele for um líder
  // (caso ele não seja puramente type: 'seller')
  if (['admin', 'head', 'coord'].includes(user.value.type || '') && !all.find(s => s.id === user.value?.id)) {
    all.unshift({
      id: user.value.id,
      name: user.value.name,
      type: user.value.type as any
    } as Sellers);
  }

  let filtered = all;

  if (user.value.type === 'admin') {
    if (selectedBUId.value) {
      filtered = filtered.filter(s => (s as any).seller_business?.some((sb: any) => sb.business_id === Number(selectedBUId.value)) || s.id === user.value?.id);
    }
  } else if (user.value.type === 'head') {
    // Seus próprios contratos + equipe
    filtered = filtered.filter(s => s.head_id === user.value?.id || s.id === user.value?.id);
  } else if (user.value.type === 'coord') {
    const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
    const buId = selectedBUId.value ? Number(selectedBUId.value) : null;

    filtered = filtered.filter(s => {
      if (s.id === user.value?.id) return true;
      const sBUs = (s as any).seller_business?.map((sb: any) => sb.business_id) || [];
      return buId ? sBUs.includes(buId) : sBUs.some((id: any) => myBUIds.includes(id));
    });
  } else {
    filtered = [];
  }

  if (selectedTeamId.value) {
    filtered = filtered.filter(s => s.id?.toString() === selectedTeamId.value || s.head_id?.toString() === selectedTeamId.value);
  }

  return filtered;
});

// Gestão do Sistema e Equipe Logic follows...

const userRoleLabel = computed(() => {
  const roles = {
    'seller': 'Vendedor',
    'sdr': 'SDR',
    'head': 'Coordenador de BU',
    'coord': 'Head de BU',
    'admin': 'Administrador do Sistema'
  };
  return roles[user.value?.type as keyof typeof roles] || 'Colaborador';
});

// Stats Reais vindos da Store de Contratos
const stats = computed(() => {
  const p1Contracts = filteredP1Contracts.value;
  const genContracts = filteredGeneralContracts.value;
  const signedGenContracts = signedGeneralContracts.value;

  // Cálculo de valores específicos (General Month)
  const totalImplementation = genContracts.filter(c => c.signed).reduce((acc, curr) => {
    return acc + (parseFloat(curr.implementation_fee as any) || 0);
  }, 0);

  const totalMonthly = genContracts.filter(c => c.signed).reduce((acc, curr) => {
    return acc + (parseFloat(curr.monthly_fee as any) || 0);
  }, 0);

  const signedContractsForTime = genContracts.filter(c => c.signed && c.signed_date);
  let averageSignatureTime = 'N/A';
  if (signedContractsForTime.length > 0) {
    const totalDays = signedContractsForTime.reduce((acc, curr) => {
      const start = new Date(curr.created_at as string);
      const end = new Date(curr.signed_date as string);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    averageSignatureTime = Number((totalDays / signedContractsForTime.length).toFixed(1)) + ' dias';
  }

  // Cálculo de Valor P1 (Window 06 to 05)
  // first_payment_amount é o valor ideal; fallback: implementation_fee + monthly_fee
  const totalP1 = p1Contracts.filter(c => c.signed).reduce((acc, curr) => {
    const fpa = parseFloat(curr.first_payment_amount as any) || 0;
    if (fpa > 0) return acc + fpa;
    // Fallback: soma implantação + primeira mensalidade
    const impl = parseFloat(curr.implementation_fee as any) || 0;
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    return acc + impl + monthly;
  }, 0);

  // Cálculo de TCV e NMRR (General Month)
  const totalTCV = genContracts.filter(c => c.signed).reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (monthly * term) + implementation;
  }, 0);

  const totalNMRR = genContracts.filter(c => c.signed).reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (implementation / term) + monthly;
  }, 0);

  const baseStats = [
    {
      label: 'Contratos Gerados',
      value: genContracts.length.toString(),
      icon: FileText,
      type: 'operation'
    },
    {
      label: 'Média de Assinatura',
      value: averageSignatureTime,
      icon: Clock,
      type: 'operation'
    },
    {
      label: 'Taxa de Assinatura',
      value: genContracts.length > 0
        ? Number(((genContracts.filter(c => c.signed).length / genContracts.length) * 100).toFixed(1)) + '%'
        : '0%',
      icon: ShieldCheck,
      type: 'operation'
    },
    {
      label: 'Total Implementação',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalImplementation),
      icon: DollarSign,
      type: 'finance'
    },
    {
      label: 'Recorrência Mensal',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthly),
      icon: TrendingUp,
      type: 'finance'
    },
    {
      label: 'Valor P1',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalP1),
      icon: Activity,
      type: 'finance',
      tooltip: 'Reflete comissões do ciclo (Dia 06 do mês anterior ao Dia 05 do mês atual)'
    },
    {
      label: 'Valor Total (TCV)',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalTCV),
      icon: Briefcase,
      type: 'finance'
    },
    {
      label: 'NMRR',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalNMRR),
      icon: Target,
      type: 'finance'
    },
    {
      label: 'Custo por Aquisição (CAC)',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(currentCacValue.value),
      icon: DollarSign,
      type: 'finance',
      isCac: true
    },
    {
      label: 'ROI P1',
      value: costsStore.totalCommercialCosts > 0
        ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(totalP1 / costsStore.totalCommercialCosts) + 'x'
        : '0x',
      icon: TrendingUp,
      type: 'finance'
    }
  ];

  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    const userCount = visibleUsers.value.length;
    baseStats.push({
      label: user.value?.type === 'admin' ? 'Total de Colaboradores' : (user.value?.type === 'head' ? 'Vendedores na Equipe' : 'Integrantes da BU'),
      value: userCount > 0 ? userCount.toString() : '0',
      icon: Users2,
      type: 'team'
    });
  }

  return baseStats;
});

const getRoleLabel = (type?: string) => {
  const roles = {
    'seller': 'Vendedor',
    'sdr': 'SDR',
    'head': 'Coordenador de BU',
    'coord': 'Head de BU',
    'admin': 'Administrador'
  };
  return roles[type as keyof typeof roles] || 'Colaborador';
};

const teamSectionTitle = computed(() => {
  if (selectedTeamId.value && user.value?.type !== 'head') {
    const head = sellerStore.allSellers.find(s => s.id?.toString() === selectedTeamId.value);
    return head ? `Equipe de ${head.name}` : 'Gestão de Equipe';
  }
  if (user.value?.type === 'admin') return 'Gestão de Colaboradores';
  if (user.value?.type === 'coord') return 'Usuários da Unidade';
  return 'Minha Equipe';
});

const visibleUsers = computed(() => {
  if (!user.value) return [];
  let users: Sellers[] = [];
  const all = sellerStore.allSellers;

  if (user.value.type === 'head') {
    users = all.filter(s => (s.type === 'seller' || s.type === 'sdr') && s.head_id === user.value?.id);
  } else if (user.value.type === 'coord') {
    const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
    users = all.filter(s => {
      const sBUIds = (s as any).seller_business?.map((sb: any) => sb.business_id) || [];
      return sBUIds.some((id: any) => myBUIds.includes(id));
    });
  } else if (user.value.type === 'admin') {
    users = all;
  }

  // Filtrar usuários exibidos com base na Equipe selecionada lá em cima
  if (selectedTeamId.value) {
    users = users.filter(u => u.id?.toString() === selectedTeamId.value || u.head_id?.toString() === selectedTeamId.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return users.filter(u => u.name?.toLowerCase().includes(query));
  }

  return users;
});

const availableSellers = computed(() => {
  if (user.value?.type !== 'head') return [];
  let available = sellerStore.allSellers.filter((s: Sellers) => (s.type === 'seller' || s.type === 'sdr') && !s.head_id);

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return available.filter((u: Sellers) => u.name?.toLowerCase().includes(query));
  }

  return available;
});

const handleAssociateMember = async (sellerId: string) => {
  if (!user.value?.id) return;
  const res = await sellerStore.updateSeller(sellerId, { head_id: user.value.id.toString() });
  if (res.success) {
    await sellerStore.fetchAllSellers();
  }
};

const handleDissociateMember = (sellerId: string) => {
  sellerToDissociate.value = sellerId;
  dissociateConfirmOpen.value = true;
};

const confirmDissociate = async () => {
  if (!sellerToDissociate.value) return;

  const res = await sellerStore.updateSeller(sellerToDissociate.value, { head_id: null });
  if (res.success) {
    await sellerStore.fetchAllSellers();
    dissociateConfirmOpen.value = false;
    sellerToDissociate.value = null;
    toast.success('Vendedor removido da equipe com sucesso.');
  } else {
    toast.error('Não foi possível remover o vendedor da equipe. Tente novamente.');
  }
};

const handleFilterModeChange = async (mode: 'own' | 'team') => {
  contractFilterMode.value = mode;
  if (!user.value?.id) return;
  const sellerId = user.value.id.toString();

  if (mode === 'team') {
    await contractStore.fetchTeamContracts(sellerId);
  } else {
    await contractStore.fetchMyContracts(sellerId);
  }
};

onMounted(async () => {
  const promises: Promise<any>[] = [];

  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    promises.push(sellerStore.fetchAllSellers());
  }

  // Busca as BUs para exibir imagens nos contratos
  promises.push(getBusiness({ client }).then(data => {
    businessList.value = data as Business[];
  }).catch(e => console.error('Erro ao buscar BUs:', e)));

  // Carrega contratos baseados no perfil
  if (user.value?.id) {
    const sellerId = user.value.id.toString();
    if (user.value.type === 'admin') {
      promises.push(contractStore.fetchAllContracts());
    } else if (user.value.type === 'head') {
      contractFilterMode.value = 'team';
      promises.push(contractStore.fetchTeamContracts(sellerId));
      promises.push(teamStore.fetchTeams());
    } else if (user.value.type === 'coord') {
      const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
      if (myBUIds.length > 0) {
        // Busca todos os contratos de todas as BUs vinculadas para o coordenador
        promises.push(contractStore.fetchMultipleBUContracts(myBUIds));
      } else {
        promises.push(contractStore.fetchMyContracts(sellerId));
      }
    } else {
      promises.push(contractStore.fetchMyContracts(sellerId));
    }
  }

  await Promise.all(promises);
});

// Action Cards Data
const actions = [
  {
    title: 'Novo Contrato',
    description: 'Acesse o formulário inteligente para preenchimento de novos contratos.',
    icon: FileText,
    roles: ['seller', 'sdr', 'head', 'coord', 'admin'],
    handler: () => router.push('/contratos/novo')
  }
];

const filteredActions = computed(() => {
  return actions.filter(a => a.roles.includes(user.value?.type ?? ""));
});

const handleProfileUpdated = () => {
  // A store já foi atualizada pelo modal, mas podemos forçar um reload se houver dados dependentes
  if (user.value?.type === 'head' && user.value.id) {
    sellerStore.fetchTeamSellers(user.value.id.toString());
  }
};

const handleGoalSaved = async () => {
  goalModalOpen.value = false;
  const [year, month] = selectedMonth.value.split('-').map(Number);
  await goalStore.fetchGoals(month, year);
};

const handleCostsSaved = async () => {
  await costsStore.fetchCosts(selectedMonthNum.value, selectedYearNum.value);
};

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};


// Resetar vendedor ao trocar de BU
watch(selectedBUId, () => {
  selectedSellerId.value = '';
});

// Resetar e selecionar automaticamente o primeiro item ao trocar o modo (BU vs Coordenador vs Equipe)
watch(dashboardFilterType, (newMode) => {
  // Resetamos as seleções transversais
  selectedBUId.value = '';
  selectedCoordId.value = '';
  selectedSellerId.value = '';
  
  if (authStore.user?.type !== 'head') {
    selectedTeamId.value = '';
  }

  // Seleção automática por modo
  if (newMode === 'bu' && buOptionsFormatted.value.length > 0) {
    selectedBUId.value = buOptionsFormatted.value[0].value;
  } else if (newMode === 'team' && teamOptionsFormatted.value.length > 0) {
    // Se for head, tenta manter ou pegar a primeira equipe real
    if (authStore.user?.type === 'head') {
      const firstTeam = teamOptionsFormatted.value.find(t => t.value.startsWith('team_'));
      if (firstTeam) selectedTeamId.value = firstTeam.value;
    } else {
      selectedTeamId.value = teamOptionsFormatted.value[0].value;
    }
  } else if (newMode === 'coord' && coordOptionsFormatted.value.length > 0) {
    selectedCoordId.value = coordOptionsFormatted.value[0].value;
  }
});

// Resetar vendedor ao selecionar uma equipe ou "Minha Meta" (Coordenador/Vendedor)
watch(selectedTeamId, (newVal) => {
  if (newVal?.startsWith('head_own_') || newVal?.startsWith('team_')) {
  }
});

watch(selectedMonth, async (newVal) => {
  if (!newVal) return;
  const [year, month] = newVal.split('-').map(Number);
  await goalStore.fetchGoals(month, year);
  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    await cacStore.fetchCac(month, year);
    await costsStore.fetchCosts(month, year);
  }
}, { immediate: true });
</script>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
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

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.3);
}
</style>
