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


    <main class="max-w-7xl mx-auto px-6 py-10 space-y-12">

      <!-- Welcome Section -->
      <section class="space-y-2">
        <div class="flex items-center gap-2.5 mb-1">
          <span class="block w-6 h-px bg-brand-cyan"></span>
          <span class="text-brand-cyan text-[10px] font-semibold uppercase tracking-[0.18em]">Dashboard
            Individual</span>
        </div>
        <h1 class="text-3xl font-extrabold tracking-tight">Bem-vindo, <span class="text-brand-cyan">{{ firstName
            }}</span></h1>
        <p class="text-white/40 text-sm max-w-2xl">Acompanhe seus indicadores e gerencie seus contratos de forma
          inteligente.</p>
      </section>

      <!-- Stats Grid (Contextual for Seller/Head) -->
      <section v-if="user?.type !== 'admin'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div v-for="stat in stats" :key="stat.label"
          class="p-6 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all group relative overflow-hidden">
          <div
            :class="['absolute right-0 -bottom-0 opacity-[0.03] group-hover:opacity-20 group-hover:text-brand-cyan transition-all duration-500', stat.bgClass]">
            <component :is="stat.icon" class="h-24 w-24" />
          </div>
          <div class="flex items-center justify-between mb-4 relative z-10">
            <div class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan">
              <component :is="stat.icon" class="h-5 w-5" />
            </div>
            <span class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Tempo Real</span>
          </div>
          <div class="space-y-1">
            <p class="text-white/40 text-xs font-medium uppercase tracking-wider">{{ stat.label }}</p>
            <h3 class="text-2xl font-bold tracking-tight">{{ stat.value }}</h3>
          </div>
        </div>
      </section>

      <!-- Team/BU Users Section (Head or Coord) -->
      <section v-if="user?.type === 'head' || user?.type === 'coord'" class="space-y-6">
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

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button v-for="action in filteredActions" :key="action.title"
            @click="action.handler ? action.handler() : null"
            class="text-left p-8 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/50 hover:bg-brand-cyan/5 transition-all group relative overflow-hidden flex flex-col items-start gap-6">
            <div
              class="p-4 rounded-2xl bg-brand-surface border border-brand-glass-border text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
              <component :is="action.icon" class="h-8 w-8" />
            </div>
            <div>
              <h4 class="text-xl font-bold text-white mb-2 group-hover:text-brand-cyan transition-colors">{{
                action.title }}</h4>
              <p class="text-white/40 text-sm leading-relaxed">{{ action.description }}</p>
            </div>
            <ArrowRight
              class="absolute top-8 right-8 h-6 w-6 text-white/10 group-hover:text-brand-cyan group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </section>

      <!-- Contract Management List -->
      <section class="space-y-6">
        <ContractList :contracts="contractStore.myContracts" :isHead="user?.type === 'head'"
          :isLeadership="['head', 'coord', 'admin'].includes(user?.type || '')" :filterMode="contractFilterMode"
          :businessUnits="businessList" :sellers="sellerStore.allSellers" @update:filterMode="handleFilterModeChange" />
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
import { ref, computed, onMounted } from 'vue';
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
  Search
} from 'lucide-vue-next';
import ProfileModal from '../components/profile/ProfileModal.vue';
import ContractList from '../components/contracts/ContractList.vue';

const authStore = useAuthStore();
const sellerStore = useSellerStore();
const contractStore = useContractStore();
const router = useRouter();

const profileModalOpen = ref(false);
const isEditingTeam = ref(false);
const searchQuery = ref('');
const contractFilterMode = ref<'own' | 'team'>('own');
const businessList = ref<Business[]>([]);

const user = computed(() => authStore.user);
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Usuário');
const userInitials = computed(() => user.value?.name?.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase() || '??');

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
  const contracts = contractStore.myContracts;

  // Cálculo de valor total (monthly_fee + implementation_fee)
  const totalValue = contracts.reduce((acc, curr) => {
    const monthly = parseFloat(curr.monthly_fee as string) || 0;
    const implementation = parseFloat(curr.implementation_fee as string) || 0;
    return acc + monthly + implementation;
  }, 0);

  const baseStats = [
    {
      label: 'Contratos Gerados',
      value: contracts.length.toString(),
      icon: FileText
    },
    {
      label: 'Valor Total (Previsão)',
      value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue),
      icon: DollarSign
    },
    {
      label: 'Taxa de Assinatura',
      value: contracts.length > 0
        ? ((contracts.filter(c => c.signed).length / contracts.length) * 100).toFixed(1) + '%'
        : '0.0%',
      icon: TrendingUp,
      bgClass: 'translate-y-2 -translate-x-2 -rotate-[15deg]'
    },
  ];

  if (user.value?.type === 'head' || user.value?.type === 'coord') {
    baseStats.push({
      label: user.value?.type === 'head' ? 'Vendedores na Equipe' : 'Integrantes da BU',
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

const handleDissociateMember = async (sellerId: string) => {
  const res = await sellerStore.updateSeller(sellerId, { head_id: null });
  if (res.success) {
    await sellerStore.fetchAllSellers();
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
  if (user.value?.type === 'head' || user.value?.type === 'coord') {
    sellerStore.fetchAllSellers();
  }

  // Busca as BUs para exibir imagens nos contratos
  try {
    const data = await getBusiness({ client });
    businessList.value = data as Business[];
  } catch (e) {
    console.error('Erro ao buscar BUs:', e);
  }

  // Carrega contratos baseados no perfil
  if (user.value?.id) {
    const sellerId = user.value.id.toString();
    if (user.value.type === 'admin') {
      await contractStore.fetchAllContracts();
    } else if (user.value.type === 'head') {
      contractFilterMode.value = 'team';
      await contractStore.fetchTeamContracts(sellerId);
    } else {
      await contractStore.fetchMyContracts(sellerId);
    }
  }
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
</style>
