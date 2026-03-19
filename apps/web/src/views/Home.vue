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
    <SetGoalModal :is-open="goalModalOpen" @close="goalModalOpen = false" />
    <ConfirmModal 
      :is-open="dissociateConfirmOpen" 
      title="Remover da Equipe"
      :message="`Tem certeza que deseja remover este vendedor da sua equipe? Ele continuará no sistema, mas deixará de estar sob sua gestão.`"
      confirm-text="Remover"
      cancel-text="Manter"
      type="warning"
      icon="circle"
      @confirm="confirmDissociate"
      @cancel="dissociateConfirmOpen = false"
    />


    <main class="max-w-7xl mx-auto px-6 py-10 space-y-12">
        <!-- Welcome Section -->
        <section class="relative py-12 px-10 rounded-[2.5rem] bg-gradient-to-br from-brand-offset to-brand-deep border border-brand-glass-border overflow-hidden">
          <!-- Abstract Background Orbs -->
          <div class="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-cyan/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div class="absolute bottom-0 left-0 w-[300px] h-[300px] bg-brand-blue/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div class="relative z-10 space-y-6">
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[10px] font-black uppercase tracking-[0.2em]">Painel de Controle</span>
              <div class="h-1 w-1 rounded-full bg-white/20"></div>
              <span class="text-white/30 text-[10px] font-bold uppercase tracking-widest">{{ new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}</span>
            </div>
            
            <div class="space-y-2">
              <h1 class="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                Olá, <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">{{ firstName }}</span>.
              </h1>
              <p class="text-white/40 text-lg max-w-xl font-medium leading-relaxed">
                Sua central de inteligência para gestão e automação de contratos da <span class="text-white/80">3F Venture</span>.
              </p>
            </div>
          </div>
        </section>

        <!-- Dynamic Filter Bar (Now Sticky for the whole dashboard) -->
        <div class="sticky top-20 z-40 py-4 -mx-2 px-4 bg-brand-deep/80 backdrop-blur-xl border-b border-white/5 shadow-2xl shadow-brand-deep/50 flex flex-wrap items-center gap-4">
          
          <!-- Mode Toggle (Only for Admin/Coord/Head) -->
          <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" class="flex p-1 bg-white/5 rounded-xl border border-white/5">
            <button 
              v-if="['admin', 'coord'].includes(user?.type || '')"
              @click="dashboardFilterType = 'bu'" 
              :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'" 
              class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300"
            >
              Por BU
            </button>
            <button 
              v-if="user?.type === 'admin'"
              @click="dashboardFilterType = 'coord'" 
              :class="dashboardFilterType === 'coord' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'" 
              class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300"
            >
              Por Coordenador
            </button>
            <button 
              @click="dashboardFilterType = 'team'" 
              :class="dashboardFilterType === 'team' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'" 
              class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300"
            >
              Por Equipe
            </button>
          </div>

          <!-- BU Filter (In Mode BU or Coord) -->
          <div v-if="dashboardFilterType === 'bu' && ['admin', 'coord'].includes(user?.type || '')" class="min-w-[200px] flex-1 md:flex-none">
            <CustomSelect 
              v-model="selectedBUId" 
              :options="buOptionsFormatted"
              placeholder="Selecionar BU"
              :icon="Building2"
            />
          </div>

          <!-- Coordinator Filter (Admin only) -->
          <div v-if="dashboardFilterType === 'coord' && user?.type === 'admin'" class="min-w-[260px] flex-1 md:flex-none">
            <CustomSelect 
              v-model="selectedCoordId" 
              :options="coordOptionsFormatted"
              placeholder="Selecionar Coordenador"
              :icon="Users"
              searchable
            />
          </div>

          <!-- Team/Seller Filters (In Mode Team or for Head) -->
          <template v-if="dashboardFilterType === 'team' || !['admin', 'coord'].includes(user?.type || '')">
            <!-- Team Filter -->
            <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" class="min-w-[260px] flex-1 md:flex-none">
               <CustomSelect 
                v-model="selectedTeamId" 
                :options="teamOptionsFormatted"
                placeholder="Selecionar Equipe"
                :icon="Users"
                searchable
                :allow-clear="user?.type !== 'head'"
                :disabled="user?.type === 'head'"
              />
            </div>

            <!-- Seller Filter -->
            <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" class="min-w-[260px] flex-1 md:flex-none">
               <CustomSelect 
                v-model="selectedSellerId" 
                :options="sellerOptionsFormatted"
                placeholder="Selecionar Vendedor"
                :icon="Users2"
                searchable
                allow-clear
              />
            </div>
          </template>

          <!-- Month Filter (Common) -->
          <div class="min-w-[200px] flex-1 md:flex-none">
            <CustomSelect 
              v-model="selectedMonth" 
              :options="extendedMonthOptionsFormatted"
              placeholder="Selecione o Mês"
              :icon="Calendar"
              :allow-clear="false"
            />
          </div>
        </div>

        <!-- Goals Dashboard Area -->
        <GoalsDashboard 
          :goal="activeGoal" 
          :actuals="currentPerformance"
          @open-settings="goalModalOpen = true"
        />

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div class="space-y-1">
          <h2 class="text-lg font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
            <TrendingUp class="h-4 w-4 text-brand-cyan" />
            Performance
          </h2>
          <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Indicadores sincronizados em tempo real</p>
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
              
              <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:text-brand-cyan transition-all duration-700 pointer-events-none">
                <component :is="stat.icon" class="h-32 w-32 rotate-[-15deg]" />
              </div>

              <div class="flex items-center justify-between mb-4 relative z-10">
                <div class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                  <component :is="stat.icon" class="h-5 w-5" />
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Status</span>
                  <span class="text-[9px] font-bold text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              <div class="space-y-1 relative z-10">
                <p class="text-white/50 text-[10px] font-bold uppercase tracking-[0.1em] leading-tight">{{ stat.label }}</p>
                <div class="flex items-baseline gap-1">
                  <div v-if="isLoading" class="space-y-2 mb-1">
                    <div class="h-8 w-32 bg-white/10 rounded-xl animate-pulse relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                  </div>
                  <h3 v-else class="text-[26px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300">
                    {{ stat.value }}
                  </h3>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
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
              
              <div class="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-10 group-hover:scale-110 group-hover:text-brand-cyan transition-all duration-700 pointer-events-none">
                <component :is="stat.icon" class="h-32 w-32 rotate-[-15deg]" />
              </div>

              <div class="flex items-center justify-between mb-4 relative z-10">
                <div class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                  <component :is="stat.icon" class="h-5 w-5" />
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Status</span>
                  <span class="text-[9px] font-bold text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
                </div>
              </div>

              <div class="space-y-1 relative z-10">
                <p class="text-white/50 text-[10px] font-bold uppercase tracking-[0.1em] leading-tight">{{ stat.label }}</p>
                <div class="flex items-baseline gap-1">
                  <div v-if="isLoading" class="space-y-2 mb-1">
                    <div class="h-8 w-24 bg-white/10 rounded-xl animate-pulse relative overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
                    </div>
                  </div>
                  <h3 v-else class="text-[26px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300">
                    {{ stat.value }}
                  </h3>
                </div>
              </div>
              <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </section>
      </div>

      <!-- Contract Management List -->
      <section class="space-y-6">
        <ContractList :contracts="filteredContractsForStats" :isHead="user?.type === 'head'"
          :isLeadership="['head', 'coord', 'admin'].includes(user?.type || '')" :filterMode="contractFilterMode"
          :businessUnits="businessList" :sellers="sellerStore.allSellers" :loading="isLoading" @update:filterMode="handleFilterModeChange" />
      </section>

      <!-- Team/BU Users Section (Admin, Head or Coord) -->
      <section v-if="['admin', 'head', 'coord'].includes(user?.type || '')" class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <Users2 class="h-5 w-5 text-brand-cyan" />
            {{ teamSectionTitle }}
          </h3>
          <div class="flex items-center gap-4">
            <div class="relative group/search">
              <Search
                class="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/20 group-focus-within/search:text-brand-cyan transition-colors" />
              <input v-model="searchQuery" type="text" placeholder="Buscar por nome..."
                class="pl-9 pr-4 py-1.5 rounded-lg bg-brand-surface border border-brand-glass-border text-[10px] text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 focus:bg-brand-cyan/5 transition-all w-48" />
            </div>
            <button v-if="user?.type === 'head'" @click="isEditingTeam = !isEditingTeam"
              :class="['flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold uppercase tracking-wider',
                isEditingTeam ? 'bg-brand-cyan text-brand-deep border-brand-cyan' : 'bg-brand-surface border-brand-glass-border text-brand-cyan hover:bg-white/5']">
              <Settings2 v-if="!isEditingTeam" class="h-3.5 w-3.5" />
              <Check v-else class="h-3.5 w-3.5" />
              {{ isEditingTeam ? 'Finalizar Edição' : 'Editar Equipe' }}
            </button>
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
                }}
                </p>
              </div>
            </div>
            <button v-if="isEditingTeam && user?.type === 'head'" @click="handleDissociateMember(seller.id!)"
              class="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
              title="Remover da Equipe">
              <UserMinus class="h-4 w-4" />
            </button>
          </div>
        </div>

        <!-- Available Sellers (Only in Edit Mode for Head) -->
        <div v-if="isEditingTeam && user?.type === 'head' && availableSellers.length > 0" class="pt-8 space-y-6">
          <div class="flex items-center gap-3">
            <div class="h-px flex-1 bg-brand-glass-border"></div>
            <h4 class="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Vendedores Disponíveis</h4>
            <div class="h-px flex-1 bg-brand-glass-border"></div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div v-for="seller in availableSellers" :key="seller.id"
              class="p-6 rounded-2xl bg-brand-surface/30 border border-brand-glass-border border-dashed hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all flex items-center justify-between group">
              <div class="flex items-center gap-4">
                <div
                  class="h-12 w-12 rounded-full bg-brand-offset border border-brand-glass-border flex items-center justify-center text-white/20 font-bold group-hover:text-brand-cyan transition-all">
                  {{ seller.name ? seller.name[0] : '?' }}
                </div>
                <div>
                  <h4 class="font-bold text-sm text-white/60 group-hover:text-white transition-colors">{{ seller.name }}
                  </h4>
                  <p class="text-[10px] text-white/20 uppercase tracking-wider font-medium">Sem Líder</p>
                </div>
              </div>
              <button @click="handleAssociateMember(seller.id!)"
                class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-deep transition-all shadow-lg hover:shadow-brand-cyan/20"
                title="Puxar para Equipe">
                <UserPlus class="h-4 w-4" />
              </button>
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
            <div class="absolute -right-10 -top-10 h-40 w-40 bg-brand-cyan/5 blur-3xl rounded-full group-hover:bg-brand-cyan/10 transition-colors"></div>

            <div
              class="p-5 rounded-2xl bg-brand-surface border border-brand-glass-border text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-500 shadow-xl">
              <component :is="action.icon" class="h-10 w-10" />
            </div>
            <div class="space-y-3">
              <h4 class="text-2xl font-black text-white group-hover:text-brand-cyan transition-colors">{{
                action.title }}</h4>
              <p class="text-white/40 text-sm leading-relaxed font-medium">{{ action.description }}</p>
            </div>
            
            <div class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-brand-cyan opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-500">
              Começar agora
              <ArrowRight class="h-3 w-3" />
            </div>
          </button>
        </div>
      </section>



      <!-- Management section for admin, head and coord -->
      <section v-if="['admin', 'head', 'coord']. some(r => r === user?.type)"
        class="p-10 rounded-3xl bg-gradient-to-br from-brand-offset to-brand-deep border border-brand-glass-border relative overflow-hidden text-center space-y-6">
        <div class="h-20 w-20 mx-auto rounded-3xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
          <Settings class="h-10 w-10 animate-spin-slow" />
        </div>
        <div class="space-y-2">
          <h2 class="text-2xl font-bold">Gestão do Sistema</h2>
          <p class="text-white/40 text-sm max-w-md mx-auto">
            {{ user?.type === 'admin' ? 'Gerencie usuários, permissões e unidades de negócio de toda a plataforma.' : 'Gerencie os usuários e permissões da sua equipe ou unidade.' }}
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
  Settings2,
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
  Target
} from 'lucide-vue-next';
import ProfileModal from '../components/profile/ProfileModal.vue';
import GoalsDashboard from '../components/dashboard/GoalsDashboard.vue';
import SetGoalModal from '../components/dashboard/SetGoalModal.vue';
import ContractList from '../components/contracts/ContractList.vue';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import { useToast } from '../composables/useToast';
import CustomSelect from '../components/ui/CustomSelect.vue';

const authStore = useAuthStore();
const sellerStore = useSellerStore();
const contractStore = useContractStore();
const goalStore = useGoalStore();
const router = useRouter();
const toast = useToast();

const profileModalOpen = ref(false);
const goalModalOpen = ref(false);
const isEditingTeam = ref(false);
const searchQuery = ref('');
const contractFilterMode = ref<'own' | 'team'>('own');
const businessList = ref<Business[]>([]);

// Dashboard Filters State
const dashboardFilterType = ref<'bu' | 'team' | 'coord'>((authStore.user?.type === 'coord' || authStore.user?.type === 'admin') ? 'bu' : 'team');
const selectedBUId = ref<string | null>(authStore.user?.type === 'admin' ? '99' : null);
const selectedCoordId = ref<string | null>(null);
const selectedTeamId = ref<string | null>(authStore.user?.type === 'head' ? (authStore.user?.id?.toString() || null) : null);
const selectedSellerId = ref<string | null>(null);

watch(() => authStore.user, (u) => {
  if (u?.type === 'head' && !selectedTeamId.value) {
    selectedTeamId.value = u.id?.toString() || '';
  }
  if (u?.type === 'admin' && !selectedBUId.value) {
    selectedBUId.value = '99';
  }
}, { immediate: true });

const dissociateConfirmOpen = ref(false);
const sellerToDissociate = ref<string | null>(null);

// Performance & Optimization State
const isFiltering = ref(false);
const isLoading = computed(() => contractStore.loading || isFiltering.value);

const currentPerformance = computed(() => {
  const contracts = onlySignedContractsForStats.value;
  
  const p1 = contracts.reduce((acc, curr) => acc + (parseFloat(curr.first_payment_amount as any) || 0), 0);
  const tcv = contracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (monthly * term) + implementation;
  }, 0);
  const nmrr = contracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    return acc + (implementation / term) + monthly;
  }, 0);
  const implementation = contracts.reduce((acc, curr) => acc + (parseFloat(curr.implementation_fee as any) || 0), 0);
  const monthly = contracts.reduce((acc, curr) => acc + (parseFloat(curr.monthly_fee as any) || 0), 0);

  return { p1, tcv, nmrr, implementation, monthly };
});

const activeGoal = computed(() => {
  const [year, month] = selectedMonth.value.split('-').map(Number);
  
  if (dashboardFilterType.value === 'bu') {
    const buId = selectedBUId.value || (user.value?.type === 'coord' ? (user.value as any)?.seller_business?.[0]?.business_id?.toString() : null);
    if (!buId) return null;
    return goalStore.getGoalByTarget('bu', buId);
  }

  if (dashboardFilterType.value === 'coord') {
    if (!selectedCoordId.value) return null;
    const head = sellerStore.allSellers.find(s => s.id?.toString() === selectedCoordId.value);
    const buIds = (head as any)?.seller_business?.map((sb: any) => sb.business_id.toString()) || [];
    if (buIds.length === 0) return null;
    
    const buGoals = goalStore.goals.filter(g => g.target_type === 'bu' && buIds.includes(g.target_id.toString()) && g.month === month && g.year === year);
    return sumGoals(buGoals, 'head', selectedCoordId.value);
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
    return sumGoals(buGoals, 'head', headId);
  }

  // Caso 2: Meta de Equipe - Soma dos Vendedores
  const members = sellerStore.allSellers.filter(s => s.head_id?.toString() === teamIdStr || s.id?.toString() === teamIdStr);
  const memberIds = members.map(m => m.id?.toString() || '');
  const memberGoals = goalStore.goals.filter(g => g.target_type === 'seller' && memberIds.includes(g.target_id.toString()) && g.month === month && g.year === year);
  
  return sumGoals(memberGoals, 'team', teamIdStr);
});

const sumGoals = (goals: Goal[], type: string, id: string): Goal => {
  const result = {
    id: 0,
    target_type: type,
    target_id: id,
    p1: 0,
    tcv: 0,
    nmrr: 0,
    implementation: 0,
    monthly: 0,
    month: 0,
    year: 0
  };
  
  goals.forEach(g => {
    result.p1 += Number(g.p1 || 0);
    result.tcv += Number(g.tcv || 0);
    result.nmrr += Number(g.nmrr || 0);
    result.implementation += Number(g.implementation || 0);
    result.monthly += Number(g.monthly || 0);
  });
  
  return result as any;
};

const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Usuário');
const userInitials = computed(() => user.value?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '??');

const buOptionsFormatted = computed(() => {
  const options = [{ value: '', label: '-' }];
  
  // Opção consolidada para Administradores
  if (user.value?.type === 'admin') {
    options.push({ value: '99', label: '3F Venture' });
  }

  businessList.value.forEach(bu => {
    // Evita duplicar "3F" se já adicionamos a opção manual de grupo para admin
    if (user.value?.type === 'admin' && bu.name?.toLowerCase().trim() === '3f') return;
    options.push({ value: bu.id?.toString() || '', label: bu.name || '' });
  });

  return options;
});

const coordOptionsFormatted = computed(() => {
  const options = [{ value: '', label: '-' }];
  sellerStore.allSellers
    .filter(s => s.type === 'head')
    .forEach(h => {
      options.push({ value: h.id?.toString() || '', label: h.name || '' });
    });
  return options;
});

const teamOptionsFormatted = computed(() => {
  const options: { value: string; label: string }[] = [];
  
  if (user.value?.type === 'head') {
    if (user.value.id) {
      options.push({ value: `head_own_${user.value.id}`, label: 'Minha Meta (Pessoal)' });
      options.push({ value: user.value.id.toString(), label: `Minha Equipe` });
    }
    return options;
  }

  options.push({ value: '', label: '-' });
  let heads = sellerStore.allSellers.filter(s => s.type === 'head');
  heads.forEach(h => {
    const idStr = h.id?.toString() || '';
    if (idStr && !options.some(opt => opt.value === idStr)) {
      options.push({ value: idStr, label: `Equipe de ${h.name}` });
    }
  });
  return options;
});

const sellerOptionsFormatted = computed(() => {
  let sellers = sellerStore.allSellers;
  
  if (selectedTeamId.value) {
    sellers = sellers.filter(s => s.id?.toString() === selectedTeamId.value || s.head_id?.toString() === selectedTeamId.value);
  }

  return [
    { value: '', label: '-' },
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

const filteredContractsForStats = computed(() => {
  let allContracts = processedContracts.value;

  // 1. Filtragem por Mês (Regra de Competência: 06 a 05)
  if (selectedMonth.value) {
    const [year, month] = selectedMonth.value.split('-').map(Number);
    const startDate = new Date(year, month - 1, 6, 0, 0, 0);
    const endDate = new Date(year, month, 5, 23, 59, 59);

    allContracts = allContracts.filter(c => {
      // Prioriza Data P1, fallback para Criação se P1 não existir (para retrocompatibilidade)
      const targetDateStr = c.first_payment_date || c.created_at;
      if (!targetDateStr) return false;
      
      const targetDate = new Date(targetDateStr);
      return targetDate >= startDate && targetDate <= endDate;
    });
  }

  // 2. Filtragem por BU
  if (selectedBUId.value) {
    const buIdNum = Number(selectedBUId.value);
    // Se ID for 99 (3F Group), mostra TODOS os contratos (Geral)
    if (buIdNum !== 99) {
      allContracts = allContracts.filter(c => c.bu_id === buIdNum);
    }
  }

  // 3. Filtragem por Equipe
  if (selectedTeamId.value) {
    const teamMembersSet = new Set<string>();
    teamMembersSet.add(selectedTeamId.value);
    
    sellerStore.allSellers.forEach(s => {
      if (s.head_id?.toString() === selectedTeamId.value) {
        teamMembersSet.add(s.id?.toString() || '');
      }
    });

    allContracts = allContracts.filter(c => c.seller_id && teamMembersSet.has(c.seller_id.toString()));
  }

  // 4. Filtragem por Vendedor
  if (selectedSellerId.value) {
    allContracts = allContracts.filter(c => c.seller_id === selectedSellerId.value);
  }

  // Se for seller (sem ser leader), garante que só vê os próprios
  if (user.value?.type === 'seller') {
     allContracts = allContracts.filter(c => c.seller_id === user.value?.id);
  }

  return allContracts;
});

// Contratos apenas assinados para os indicadores (Stats Cards)
const onlySignedContractsForStats = computed(() => {
  return filteredContractsForStats.value.filter(c => c.signed);
});

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
    'head': 'Coordenador de BU',
    'coord': 'Head de BU',
    'admin': 'Administrador do Sistema'
  };
  return roles[user.value?.type as keyof typeof roles] || 'Colaborador';
});

// Stats Reais vindos da Store de Contratos
const stats = computed(() => {
  const contracts = onlySignedContractsForStats.value;

  // Cálculo de valores específicos
  const totalImplementation = contracts.reduce((acc, curr) => {
    return acc + (parseFloat(curr.implementation_fee as any) || 0);
  }, 0);

  const totalMonthly = contracts.reduce((acc, curr) => {
    return acc + (parseFloat(curr.monthly_fee as any) || 0);
  }, 0);

  const signedContracts = contracts.filter(c => c.signed && c.signed_date);
  let averageSignatureTime = 'N/A';
  if (signedContracts.length > 0) {
    const totalDays = signedContracts.reduce((acc, curr) => {
      // Usar asserção de tipo para evitar erro de 'undefined' já que filtramos acima
      const start = new Date(curr.created_at as string);
      const end = new Date(curr.signed_date as string);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return acc + diffDays;
    }, 0);
    averageSignatureTime = Number((totalDays / signedContracts.length).toFixed(1)) + ' dias';
  }

  // Cálculo de Valor P1 (Simplificado pois o array já está filtrado pela competência)
  const totalP1 = contracts.reduce((acc, curr) => {
    return acc + (parseFloat(curr.first_payment_amount as any) || 0);
  }, 0);

  // Cálculo de TCV (Total Contract Value) e NMRR (Normalized Monthly Recurring Revenue)
  const totalTCV = contracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12; // Default 12 meses para Growth/Indeterminado
    return acc + (monthly * term) + implementation;
  }, 0);

  const totalNMRR = contracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as any) || 0;
    const implementation = parseFloat(curr.implementation_fee as any) || 0;
    const term = curr.contractual_term || 12;
    // NMRR = (Implementation / Term) + Monthly
    return acc + (implementation / term) + monthly;
  }, 0);

  const baseStats = [
    {
      label: 'Contratos Gerados',
      value: contracts.length.toString(),
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
      value: filteredContractsForStats.value.length > 0
        ? Number(((filteredContractsForStats.value.filter(c => c.signed).length / filteredContractsForStats.value.length) * 100).toFixed(1)) + '%'
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
      type: 'finance'
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
    }
  ];

  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    baseStats.push({
      label: user.value?.type === 'admin' ? 'Total de Colaboradores' : (user.value?.type === 'head' ? 'Vendedores na Equipe' : 'Integrantes da BU'),
      value: visibleUsers.value.length.toString(),
      icon: Users2,
      type: 'team'
    });
  }

  return baseStats;
});

const getRoleLabel = (type?: string) => {
  const roles = {
    'seller': 'Vendedor',
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
    users = all.filter(s => s.type === 'seller' && s.head_id === user.value?.id);
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
  let available = sellerStore.allSellers.filter((s: Sellers) => s.type === 'seller' && !s.head_id);

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    return available.filter((u: Sellers) => u.name?.toLowerCase().includes(query));
  }

  return available;
});

const handleAssociateMember = async (sellerId: string) => {
  if (!user.value?.id) return;
  const res = await sellerStore.updateSeller(sellerId, { head_id: user.value.id });
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
    roles: ['seller', 'head', 'coord', 'admin'],
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

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};

// Resetar vendedor ao trocar de BU
watch(selectedBUId, () => {
  selectedSellerId.value = '';
});

// Resetar filtros ao trocar o modo (BU vs Coordenador vs Equipe)
watch(dashboardFilterType, (newMode) => {
  selectedBUId.value = '';
  selectedCoordId.value = '';
  selectedSellerId.value = '';
  // Se for head, mantém sua equipe, senão reseta.
  if (authStore.user?.type !== 'head') {
    selectedTeamId.value = '';
  }
});

onMounted(async () => {
  const promises: Promise<any>[] = [];

  if (user.value) {
    if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
      promises.push(sellerStore.fetchAllSellers());
    }

    // Busca as BUs para exibir imagens nos contratos
    promises.push(getBusiness({ client }).then(data => {
      businessList.value = data as Business[];
    }).catch(e => console.error('Erro ao buscar BUs:', e)));

    // Metas do mês atual (extraindo do formato YYYY-MM)
    const [year, month] = Math.max(0, selectedMonth.value.indexOf('-')) > 0 
      ? selectedMonth.value.split('-').map(Number)
      : [new Date().getFullYear(), new Date().getMonth() + 1];

    promises.push(goalStore.fetchGoals(month, year));

    // Carrega contratos baseados no perfil
    const sellerId = user.value.id?.toString();
    if (sellerId) {
      if (user.value.type === 'admin') {
        promises.push(contractStore.fetchAllContracts());
      } else if (user.value.type === 'head') {
        contractFilterMode.value = 'team';
        promises.push(contractStore.fetchTeamContracts(sellerId));
      } else if (user.value.type === 'coord') {
        const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
        if (myBUIds.length > 0) {
          promises.push(contractStore.fetchMultipleBUContracts(myBUIds));
        } else {
          promises.push(contractStore.fetchMyContracts(sellerId));
        }
      } else {
        promises.push(contractStore.fetchMyContracts(sellerId));
      }
    }
  }

  await Promise.all(promises);
});

watch(selectedMonth, async (newVal) => {
  if (!newVal) return;
  const [year, month] = newVal.split('-').map(Number);
  await goalStore.fetchGoals(month, year);
});
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
