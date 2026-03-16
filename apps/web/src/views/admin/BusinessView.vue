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
            <Building2 class="h-6 w-6" />
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white/90 leading-tight">Gestão de Empresas</h2>
            <p class="text-[11px] text-brand-cyan uppercase tracking-wider font-medium">Painel Administrativo</p>
          </div>
        </div>

        <button @click="openCreateModal"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-cyan text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-brand-cyan/20">
          <PlusCircle class="h-4 w-4" />
          Nova Empresa
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 py-10 space-y-8">
      <!-- Search -->
      <div class="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div class="relative w-full md:w-96 group">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
          <input type="text" v-model="searchQuery"
            class="w-full bg-brand-offset border border-brand-glass-border rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
            placeholder="Buscar por nome ou CNPJ...">
        </div>
      </div>

      <!-- Business Grid -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="i in 6" :key="i" class="h-40 rounded-2xl bg-brand-offset/50 animate-pulse border border-brand-glass-border"></div>
      </div>

      <div v-else-if="filteredBusiness.length === 0" class="py-20 text-center space-y-4">
        <div class="h-16 w-16 mx-auto rounded-2xl bg-brand-offset flex items-center justify-center text-white/10">
          <Building2 class="h-8 w-8" />
        </div>
        <p class="text-white/40 text-sm">Nenhuma empresa encontrada.</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="item in filteredBusiness" :key="item.id"
          class="p-6 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all group relative overflow-hidden">
          
          <div :style="{ backgroundColor: item.color + '10' }" class="absolute inset-0 z-0"></div>

          <div class="relative z-10 space-y-4">
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div :style="{ borderColor: item.color }" class="h-12 w-12 rounded-xl bg-brand-surface border flex items-center justify-center overflow-hidden">
                  <img v-if="item.img_base64" :src="item.img_base64" class="h-full w-full object-cover" />
                  <Building2 v-else class="h-6 w-6" :style="{ color: item.color }" />
                </div>
                <div>
                  <h4 class="font-bold text-white group-hover:text-brand-cyan transition-colors">{{ item.name }}</h4>
                  <p class="text-[10px] text-white/40 uppercase tracking-widest font-bold">{{ item.cnpj }}</p>
                </div>
              </div>
              
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="openEditModal(item)" class="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-brand-cyan transition-colors">
                  <Edit3 class="h-4 w-4" />
                </button>
                <button @click="handleDelete(item.id)" class="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors">
                  <Trash2 class="h-4 w-4" />
                </button>
              </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-white/5">
              <span class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Identidade Visual</span>
              <div :style="{ backgroundColor: item.color }" class="h-4 w-12 rounded-full shadow-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <BusinessModal 
      :is-open="modalOpen" 
      :business="selectedBusiness" 
      @close="closeModal" 
      @saved="loadBusiness" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Building2, 
  PlusCircle, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowLeft
} from 'lucide-vue-next';
import BusinessModal from '../../components/admin/BusinessModal.vue';
import { getBusiness } from '../../gen/hooks/getBusiness';
import { deleteBusinessId } from '../../gen/hooks/deleteBusinessId';
import client from '../../api/client';
import type { Business } from '../../gen/types/Business';

const router = useRouter();
const businessList = ref<Business[]>([]);
const loading = ref(true);
const searchQuery = ref('');

// Modal state
const modalOpen = ref(false);
const selectedBusiness = ref<Business | null>(null);

const loadBusiness = async () => {
  loading.value = true;
  try {
    const data = await getBusiness({ client });
    businessList.value = data as Business[];
  } catch (error) {
    console.error('Falha ao buscar empresas:', error);
  } finally {
    loading.value = false;
  }
};

const filteredBusiness = computed(() => {
  if (!searchQuery.value) return businessList.value;
  const query = searchQuery.value.toLowerCase();
  return businessList.value.filter(b => 
    b.name?.toLowerCase().includes(query) || 
    b.cnpj?.toLowerCase().includes(query)
  );
});

const openCreateModal = () => {
  selectedBusiness.value = null;
  modalOpen.value = true;
};

const openEditModal = (item: Business) => {
  selectedBusiness.value = item;
  modalOpen.value = true;
};

const closeModal = () => {
  modalOpen.value = false;
  selectedBusiness.value = null;
};

const handleDelete = async (id: any) => {
  if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;
  
  try {
    await deleteBusinessId(id, { client });
    await loadBusiness();
  } catch (error) {
    console.error('Falha ao excluir empresa:', error);
    alert('Erro ao excluir empresa.');
  }
};

onMounted(loadBusiness);
</script>
