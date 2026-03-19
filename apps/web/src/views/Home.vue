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

      <!-- Stats Filter & Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div class="space-y-1">
          <h2 class="text-lg font-black uppercase tracking-[0.2em] text-white/30 flex items-center gap-2">
            <TrendingUp class="h-4 w-4 text-brand-cyan" />
            Performance
          </h2>
          <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Indicadores sincronizados em tempo real</p>
        </div>

        <div class="flex flex-wrap items-center gap-4">
          <!-- BU Filter (Admin/Coord/Head) -->
          <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" class="relative group/select">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-hover/select:text-brand-cyan transition-colors">
              <Building2 class="h-3.5 w-3.5" />
            </div>
            <select 
              v-model="selectedBUId"
              class="appearance-none bg-brand-offset/40 backdrop-blur-xl border border-brand-glass-border pl-10 pr-10 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/60 focus:text-brand-cyan focus:border-brand-cyan/50 focus:outline-none cursor-pointer transition-all shadow-xl min-w-[160px]"
            >
              <option value="">Todas as Unidades</option>
              <option v-for="bu in filterBUOptions" :key="bu.id" :value="bu.id" class="bg-brand-deep text-white">
                {{ bu.name }}
              </option>
            </select>
            <ChevronDownIcon class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-hover/select:text-brand-cyan transition-colors pointer-events-none" />
          </div>

          <!-- Searchable Seller Filter (Admin/Coord/Head) -->
          <div v-if="['admin', 'coord', 'head'].includes(user?.type || '')" ref="sellerFilterContainer" class="relative group/seller-select min-w-[220px]">
            <div class="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within/seller-select:text-brand-cyan transition-colors z-20">
              <Users2 class="h-3.5 w-3.5" />
            </div>
            
            <!-- Input Field -->
            <input 
              type="text"
              v-model="sellerDropdownSearch"
              @focus="isSellerDropdownOpen = true"
              :placeholder="selectedSellerName"
              class="w-full bg-brand-offset/40 backdrop-blur-xl border border-brand-glass-border pl-10 pr-10 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/60 focus:text-brand-cyan focus:border-brand-cyan/50 focus:outline-none transition-all shadow-xl"
            />
            
            <div 
              class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20"
              @click="isSellerDropdownOpen = !isSellerDropdownOpen"
            >
              <button v-if="selectedSellerId" @click.stop="selectedSellerId = ''" class="hover:text-red-400 transition-colors">
                <X class="h-3 w-3 text-white/20" />
              </button>
              <ChevronDownIcon :class="['h-4 w-4 text-white/20 group-hover/seller-select:text-brand-cyan transition-transform duration-300 pointer-events-none', isSellerDropdownOpen ? 'rotate-180' : '']" />
            </div>

            <!-- Dropdown List -->
            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0 -translate-y-2"
              enter-to-class="transform scale-100 opacity-100 translate-y-0"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="transform scale-100 opacity-100 translate-y-0"
              leave-to-class="transform scale-95 opacity-0 -translate-y-2"
            >
              <div 
                v-if="isSellerDropdownOpen" 
                class="absolute top-full left-0 right-0 mt-2 py-2 bg-brand-offset/95 backdrop-blur-2xl border border-brand-glass-border rounded-2xl shadow-2xl z-[60] max-h-64 overflow-y-auto custom-scrollbar"
              >
                <!-- Option: All -->
                <div 
                  @click="selectSeller('', 'Todos os Vendedores')"
                  :class="['px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-between', !selectedSellerId ? 'text-brand-cyan bg-brand-cyan/5' : 'text-white/60 hover:text-white hover:bg-white/5']"
                >
                  Todos os Vendedores
                  <Check v-if="!selectedSellerId" class="h-3 w-3" />
                </div>

                <!-- Dyn Options -->
                <div 
                  v-for="seller in filteredSellerDropdownOptions" 
                  :key="seller.id"
                  @click="selectSeller(seller.id!.toString(), seller.name || '')"
                  :class="['px-4 py-2 text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-between', selectedSellerId === seller.id?.toString() ? 'text-brand-cyan bg-brand-cyan/5' : 'text-white/60 hover:text-white hover:bg-white/5']"
                >
                  <span class="flex items-center gap-2">
                    {{ seller.name }}
                    <span v-if="seller.id === user?.id" class="text-[8px] opacity-40">(Eu)</span>
                  </span>
                  <Check v-if="selectedSellerId === seller.id?.toString()" class="h-3 w-3" />
                </div>

                <!-- Empty State -->
                <div v-if="filteredSellerDropdownOptions.length === 0" class="px-4 py-8 text-center">
                  <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Nenhum vendedor encontrado</p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Month Filter -->
          <div class="flex items-center bg-brand-offset/40 backdrop-blur-xl border border-brand-glass-border p-1.5 rounded-2xl shadow-xl">
          <button 
            v-for="month in monthOptions" 
            :key="month.value"
            @click="selectedMonth = month.value"
            :class="[
              'px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300',
              selectedMonth === month.value 
                ? 'bg-brand-cyan text-brand-deep shadow-[0_0_20px_rgba(0,212,255,0.3)]' 
                : 'text-white/40 hover:text-white/70 hover:bg-white/5'
            ]"
          >
            {{ month.label }}
          </button>
          
          <div class="w-px h-4 bg-white/10 mx-2"></div>

          <div class="relative group/select">
            <select 
              v-model="selectedMonth"
              class="appearance-none bg-transparent pl-3 pr-8 py-2 text-[10px] font-black uppercase tracking-widest text-white/60 focus:text-brand-cyan focus:outline-none cursor-pointer transition-colors"
            >
              <option v-for="opt in extendedMonthOptions" :key="opt.value" :value="opt.value" class="bg-brand-deep text-white text-xs">
                {{ opt.labelFull }}
              </option>
            </select>
            <ChevronDownIcon class="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20 group-hover/select:text-brand-cyan transition-colors pointer-events-none" />
          </div>
        </div>
      </div>
    </div>

      <!-- Stats Grid (Visible for everyone) -->
      <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <div v-for="(stat, index) in stats" :key="stat.label"
          class="p-8 rounded-[2rem] bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all duration-500 group relative overflow-hidden"
          :style="{ animationDelay: (index * 100) + 'ms' }">
          
          <!-- Background Accent Effect -->
          <div class="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:opacity-10 group-hover:scale-110 group-hover:text-brand-cyan transition-all duration-700 pointer-events-none">
            <component :is="stat.icon" class="h-32 w-32 rotate-[-15deg]" />
          </div>

          <div class="flex items-center justify-between mb-6 relative z-10">
            <div class="p-3 rounded-2xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
              <component :is="stat.icon" class="h-5 w-5" />
            </div>
            <div class="flex flex-col items-end">
              <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Status</span>
              <span class="text-[9px] font-bold text-brand-cyan/60 uppercase tracking-widest">Ativo</span>
            </div>
          </div>

          <div class="space-y-2 relative z-10">
            <p class="text-white/40 text-[10px] font-bold uppercase tracking-[0.15em] leading-tight">{{ stat.label }}</p>
            <div class="flex items-baseline gap-1">
              <div v-if="contractStore.loading" class="h-9 w-32 bg-white/10 rounded-lg animate-pulse mb-1 relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
              </div>
              <h3 v-else class="text-3xl font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300">
                {{ stat.value }}
              </h3>
            </div>
          </div>
          
          <!-- Progress bar decoration -->
          <div class="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent w-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
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

      <!-- Contract Management List -->
      <section class="space-y-6">
        <ContractList :contracts="filteredContractsForStats" :isHead="user?.type === 'head'"
          :isLeadership="['head', 'coord', 'admin'].includes(user?.type || '')" :filterMode="contractFilterMode"
          :businessUnits="businessList" :sellers="sellerStore.allSellers" :loading="contractStore.loading" @update:filterMode="handleFilterModeChange" />
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
  ChevronDown as ChevronDownIcon
} from 'lucide-vue-next';
import ProfileModal from '../components/profile/ProfileModal.vue';
import ContractList from '../components/contracts/ContractList.vue';
import ConfirmModal from '../components/ui/ConfirmModal.vue';
import { useToast } from '../composables/useToast';

const authStore = useAuthStore();
const sellerStore = useSellerStore();
const contractStore = useContractStore();
const router = useRouter();
const toast = useToast();

const profileModalOpen = ref(false);
const isEditingTeam = ref(false);
const searchQuery = ref('');
const contractFilterMode = ref<'own' | 'team'>('own');
const businessList = ref<Business[]>([]);

// Dashboard Filters State
const selectedBUId = ref<string>('');
const selectedSellerId = ref<string>('');

const dissociateConfirmOpen = ref(false);
const sellerToDissociate = ref<string | null>(null);

// Searchable Seller Dropdown State
const sellerDropdownSearch = ref('');
const isSellerDropdownOpen = ref(false);
const sellerFilterContainer = ref<HTMLElement | null>(null);

const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Usuário');
const userInitials = computed(() => user.value?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '??');

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

const filteredContractsForStats = computed(() => {
  let contracts = contractStore.myContracts;

  // 1. Filtragem por Mês
  if (selectedMonth.value) {
    contracts = contracts.filter(c => {
      const createdDate = new Date(c.created_at as any);
      const dueDate = c.due_date ? new Date(c.due_date as any) : null;
      const createdMonth = createdDate.toISOString().substring(0, 7);
      const dueMonth = dueDate ? dueDate.toISOString().substring(0, 7) : null;
      return createdMonth === selectedMonth.value || dueMonth === selectedMonth.value;
    });
  }

  // 2. Filtragem por BU
  if (selectedBUId.value) {
    contracts = contracts.filter(c => c.bu_id === Number(selectedBUId.value));
  }

  // 3. Filtragem por Vendedor
  if (selectedSellerId.value) {
    contracts = contracts.filter(c => c.seller_id === selectedSellerId.value);
  }

  // Se for seller (sem ser leader), garante que só vê os próprios
  if (user.value?.type === 'seller') {
     contracts = contracts.filter(c => c.seller_id === user.value?.id);
  }

  return contracts;
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

  if (user.value.type === 'admin') {
    if (selectedBUId.value) {
      return all.filter(s => (s as any).seller_business?.some((sb: any) => sb.business_id === Number(selectedBUId.value)) || s.id === user.value?.id);
    }
    return all;
  }

  if (user.value.type === 'head') {
    // Seus próprios contratos + equipe
    return all.filter(s => s.head_id === user.value?.id || s.id === user.value?.id);
  }

  if (user.value.type === 'coord') {
    const myBUIds = (user.value as any).seller_business?.map((sb: any) => sb.business_id) || [];
    const buId = selectedBUId.value ? Number(selectedBUId.value) : null;
    
    return all.filter(s => {
      if (s.id === user.value?.id) return true;
      const sBUs = (s as any).seller_business?.map((sb: any) => sb.business_id) || [];
      return buId ? sBUs.includes(buId) : sBUs.some((id: any) => myBUIds.includes(id));
    });
  }

  return [];
});

const filteredSellerDropdownOptions = computed(() => {
  const options = filterSellerOptions.value;
  if (!sellerDropdownSearch.value) return options;
  const query = sellerDropdownSearch.value.toLowerCase();
  return options.filter(s => s.name?.toLowerCase().includes(query));
});

const selectedSellerName = computed(() => {
  if (!selectedSellerId.value) return 'Todos os Vendedores';
  const found = filterSellerOptions.value.find(s => s.id === selectedSellerId.value);
  return (found ? found.name : 'Todos os Vendedores') || 'Todos os Vendedores';
});

const selectSeller = (id: string, name: string | null) => {
  selectedSellerId.value = id;
  sellerDropdownSearch.value = '';
  isSellerDropdownOpen.value = false;
};

const userRoleLabel = computed(() => {
  const roles = {
    'seller': 'Vendedor',
    'head': 'Head de Equipe',
    'coord': 'Coordenador de BU',
    'admin': 'Administrador do Sistema'
  };
  return roles[user.value?.type as keyof typeof roles] || 'Colaborador';
});

// Stats Reais vindos da Store de Contratos
const stats = computed(() => {
  const contracts = filteredContractsForStats.value;

  // Cálculo de valores específicos
  const totalImplementation = contracts.reduce((acc, curr) => {
    return acc + (parseFloat(curr.implementation_fee as any) || 0);
  }, 0);

  const totalMonthly = contracts.reduce((acc, curr) => {
    return acc + (parseFloat(curr.monthly_fee as any) || 0);
  }, 0);

  const baseStats = [
    {
      label: 'Contratos Gerados',
      value: contracts.length.toString(),
      icon: FileText
    },
    {
      label: 'Total Implementação',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalImplementation),
      icon: DollarSign
    },
    {
      label: 'Recorrência Mensal',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalMonthly),
      icon: TrendingUp
    },
    {
      label: 'Taxa de Assinatura',
      value: contracts.length > 0
        ? ((contracts.filter(c => c.signed).length / contracts.length) * 100).toFixed(1) + '%'
        : '0.0%',
      icon: ShieldCheck
    },
  ];

  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    baseStats.push({
      label: user.value?.type === 'admin' ? 'Total de Colaboradores' : (user.value?.type === 'head' ? 'Vendedores na Equipe' : 'Integrantes da BU'),
      value: visibleUsers.value.length.toString(),
      icon: Users2
    });
  }

  return baseStats;
});

const getRoleLabel = (type?: string) => {
  const roles = {
    'seller': 'Vendedor',
    'head': 'Head de Equipe',
    'coord': 'Coordenador de BU',
    'admin': 'Administrador'
  };
  return roles[type as keyof typeof roles] || 'Colaborador';
};

const teamSectionTitle = computed(() => {
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
      const myBUId = (user.value as any).seller_business?.[0]?.business_id;
      if (myBUId) {
        promises.push(contractStore.fetchBUContracts(myBUId));
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

const handleClickOutside = (event: MouseEvent) => {
  if (sellerFilterContainer.value && !sellerFilterContainer.value.contains(event.target as Node)) {
    isSellerDropdownOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
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
