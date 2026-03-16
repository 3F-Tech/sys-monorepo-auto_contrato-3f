<template>
  <div class="min-h-screen bg-brand-deep text-white font-sans selection:bg-brand-cyan/30">
    <!-- Header -->
    <header class="border-b border-brand-glass-border bg-brand-offset/50 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.push('/')" class="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <ArrowLeft class="h-5 w-5 text-white/40" />
          </button>
          <div class="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
            <Users class="h-6 w-6" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white/90 leading-tight">Gestão de Usuários</h2>
            <p class="text-[11px] text-brand-cyan uppercase tracking-wider font-medium">Painel Administrativo</p>
          </div>
        </div>

        <button @click="openCreateModal"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-cyan text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20">
          <UserPlus class="h-4 w-4" />
          Novo Usuário
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <!-- Search and Filters (Simplified) -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96 group">
          <Search
            class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
          <input type="text" v-model="searchQuery"
            class="w-full bg-brand-offset border border-brand-glass-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
            placeholder="Buscar por nome ou e-mail...">
        </div>

        <div class="flex gap-2">
          <span
            class="px-3 py-1.5 rounded-lg bg-brand-offset border border-brand-glass-border text-[10px] font-bold text-white/40 uppercase tracking-widest">
            {{ filteredSellers.length }} Usuários
          </span>
        </div>
      </div>

      <!-- Users Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i"
          class="h-48 rounded-2xl bg-brand-offset/50 animate-pulse border border-brand-glass-border"></div>
      </div>

      <div v-else-if="filteredSellers.length === 0" class="py-20 text-center space-y-4">
        <div class="h-16 w-16 mx-auto rounded-2xl bg-brand-offset flex items-center justify-center text-white/10">
          <Users class="h-8 w-8" />
        </div>
        <p class="text-white/40 text-sm">Nenhum usuário encontrado.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="seller in filteredSellers" :key="seller.id"
          class="p-6 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all group relative overflow-hidden">

          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-4">
              <div
                class="h-12 w-12 rounded-xl bg-brand-surface border border-brand-glass-border flex items-center justify-center text-brand-cyan font-bold text-lg group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all">
                {{ seller.name ? seller.name[0] : '?' }}
              </div>
              <div>
                <h4 class="font-bold text-white group-hover:text-brand-cyan transition-colors">{{ seller.name }}</h4>
                <p class="text-[10px] text-white/40 uppercase tracking-wider font-medium">{{ getRoleLabel(seller.type)
                }}</p>
              </div>
            </div>

            <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button @click="openEditModal(seller)"
                class="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-brand-cyan transition-colors">
                <Edit3 class="h-4 w-4" />
              </button>
              <button @click="handleDelete(seller.id)"
                class="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors">
                <Trash2 class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- BUs Vinculadas (Minimalista e Elegante) -->
          <div v-if="seller.seller_business?.length" class="flex flex-wrap gap-2 mb-6">
            <div v-for="sb in seller.seller_business" :key="sb.business_id"
              class="h-9 w-9 rounded-xl border border-white/5 bg-brand-surface/30 overflow-hidden flex items-center justify-center transition-transform hover:scale-110"
              :title="getBusinessName(sb.business_id)">
              <img v-if="getBusinessLogo(sb.business_id)" :src="getBusinessLogo(sb.business_id)" 
                class="h-full w-full object-cover" />
              <div v-else class="h-full w-full flex items-center justify-center" 
                :style="{ backgroundColor: (getBusinessColor(sb.business_id) || '#00d4ff') + '20' }">
                <Building2 class="h-4 w-4" :style="{ color: getBusinessColor(sb.business_id) || '#00d4ff' }" />
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2 text-xs text-white/60">
              <Mail class="h-3.5 w-3.5 text-brand-cyan/50" />
              {{ seller.email }}
            </div>
            <div
              class="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-[0.1em] font-bold pt-2 border-t border-white/5">
              <Calendar class="h-3 w-3" />
              Criado em: {{ formatDate(seller.created_at) }}
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <UserModal :is-open="modalOpen" :user="selectedUser" @close="closeModal" @saved="loadSellers" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import {
  Users,
  UserPlus,
  Search,
  Edit3,
  Trash2,
  ArrowLeft,
  Mail,
  Calendar,
  Loader2,
  Building2
} from 'lucide-vue-next';
import UserModal from '../../components/admin/UserModal.vue';
import { getSellers } from '../../gen/hooks/getSellers';
import { getBusiness } from '../../gen/hooks/getBusiness';
import { deleteSellersId } from '../../gen/hooks/deleteSellersId';
import client from '../../api/client';
import type { Sellers } from '../../gen/types/Sellers';
import type { Business } from '../../gen/types/Business';

const router = useRouter();
const sellers = ref<Sellers[]>([]);
const allBusiness = ref<Business[]>([]);
const loading = ref(true);
const searchQuery = ref('');

// Modal state
const modalOpen = ref(false);
const selectedUser = ref<Sellers | null>(null);

const loadSellers = async () => {
  loading.value = true;
  try {
    const [sellersData, busData] = await Promise.all([
      getSellers({}, { client }),
      getBusiness({ client })
    ]);
    sellers.value = sellersData as Sellers[];
    allBusiness.value = busData as Business[];
  } catch (error) {
    console.error('Falha ao buscar dados:', error);
  } finally {
    loading.value = false;
  }
};

const getBusinessLogo = (id: number) => {
  return allBusiness.value.find(b => Number(b.id) === id)?.img_base64;
};

const getBusinessName = (id: number) => {
  return allBusiness.value.find(b => Number(b.id) === id)?.name;
};

const getBusinessColor = (id: number) => {
  return allBusiness.value.find(b => Number(b.id) === id)?.color;
};

const filteredSellers = computed(() => {
  if (!searchQuery.value) return sellers.value;
  const query = searchQuery.value.toLowerCase();
  return sellers.value.filter(s =>
    s.name?.toLowerCase().includes(query) ||
    s.email?.toLowerCase().includes(query)
  );
});

const getRoleLabel = (role?: string) => {
  const roles = {
    'seller': 'Vendedor',
    'head': 'Head de Equipe',
    'admin': 'Administrador',
    'coord': 'Coordenador de BU'
  };
  return roles[role as keyof typeof roles] || 'Colaborador';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return 'Data desconhecida';
  return new Date(dateString).toLocaleDateString('pt-BR');
};

const openCreateModal = () => {
  selectedUser.value = null;
  modalOpen.value = true;
};

const openEditModal = (user: Sellers) => {
  selectedUser.value = user;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  selectedUser.value = null;
};

const handleDelete = async (id: any) => {
  if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

  try {
    await deleteSellersId(id, { client });
    await loadSellers();
  } catch (error) {
    console.error('Falha ao excluir usuário:', error);
    alert('Erro ao excluir usuário.');
  }
};

onMounted(loadSellers);
</script>
