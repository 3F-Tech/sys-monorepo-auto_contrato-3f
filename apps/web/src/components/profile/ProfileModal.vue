<template>
  <div v-if="isOpen" class="fixed inset-0 z-[101] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm" @click="close"></div>
    
    <!-- Modal Content -->
    <div class="relative w-full max-w-2xl bg-brand-offset border border-brand-glass-border rounded-3xl p-8 shadow-2xl overflow-hidden group max-h-[90vh] flex flex-col">
      <!-- Decoration -->
      <div class="absolute -top-24 -right-24 h-48 w-48 bg-brand-cyan/5 rounded-full blur-3xl group-hover:bg-brand-cyan/10 transition-all"></div>
      
      <div class="relative z-10 flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold flex items-center gap-2">
          <User class="h-5 w-5 text-brand-cyan" />
          Meu Perfil
        </h3>
        <button @click="close" class="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <X class="h-5 w-5 text-white/40" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="relative z-10 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Seção: Informações Básicas -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Meu Nome</label>
            <input v-model="form.name" type="text" required
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="Ex: João da Silva">
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">E-mail</label>
            <input v-model="form.email" type="email" required
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="email@exemplo.com">
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">CPF</label>
            <input v-model="form.cpf" type="text" v-maska="'###.###.###-##'"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="000.000.000-00">
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Telefone / WhatsApp</label>
            <input v-model="form.phone" type="text" v-maska="'(##) #####-####'"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="(00) 00000-0000">
          </div>
        </div>

        <!-- Seção: Senha -->
        <div class="space-y-1.5">
          <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Alterar Senha (Opcional)</label>
          <input v-model="form.password" type="password"
            class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
            placeholder="Deixe em branco para manter a atual">
        </div>

        <div v-if="canEditHierarchy" class="space-y-6 pt-4 border-t border-white/5">
            <div class="space-y-1.5">
                <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Head Responsável</label>
                <div class="relative">
                    <select v-model="form.head_id"
                    class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all appearance-none cursor-pointer">
                    <option :value="null" class="bg-brand-offset italic">Nenhum (Vendedor Independente)</option>
                    <option v-for="h in heads" :key="h.id" :value="h.id" class="bg-brand-offset">
                        {{ h.name }}
                    </option>
                    </select>
                    <ChevronDown class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 pointer-events-none" />
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest flex items-center gap-2">
                    <Building2 class="h-3 w-3" />
                    Unidades de Negócio (BUs) Vinculadas
                </label>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <label v-for="bu in allBusiness" :key="bu.id"
                    class="flex items-center gap-3 p-2.5 rounded-xl bg-brand-surface border border-brand-glass-border hover:border-brand-cyan/30 cursor-pointer transition-all group/item select-none"
                    :class="{ 'border-brand-cyan/50 bg-brand-cyan/5': selectedBUs.includes(bu.id!) }">
                    <div class="relative flex items-center justify-center shrink-0">
                        <input type="checkbox" :value="bu.id" v-model="selectedBUs" class="peer appearance-none h-5 w-5 rounded-lg border border-brand-glass-border checked:bg-brand-cyan checked:border-brand-cyan transition-all">
                        <Check class="absolute h-3.5 w-3.5 text-brand-deep opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    
                    <!-- Logo Discreta -->
                    <div v-if="bu.img_base64" class="h-6 w-6 rounded-lg overflow-hidden border border-white/10 shrink-0 bg-brand-offset">
                        <img :src="bu.img_base64" class="h-full w-full object-cover" />
                    </div>
                    <div v-else class="h-6 w-6 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                        <Building2 class="h-3 w-3 text-white/20" :style="{ color: bu.color as string || undefined }" />
                    </div>

                    <span class="text-[11px] font-bold text-white/70 group-hover/item:text-brand-cyan transition-colors truncate">{{ bu.name }}</span>
                    </label>
                </div>
            </div>
        </div>

        <!-- Mensagem Informativa para Sellers -->
        <div v-else class="p-4 rounded-xl bg-brand-cyan/5 border border-brand-cyan/10">
            <p class="text-[11px] text-white/40 leading-relaxed italic">
                Sua vinculação com Unidades de Negócio e Gestores é configurada pela administração.
            </p>
        </div>

        <div class="pt-6 flex gap-3 sticky bottom-0 bg-brand-offset py-2">
          <button type="button" @click="close"
            class="flex-1 px-4 py-4 rounded-xl bg-brand-surface border border-brand-glass-border text-xs font-bold hover:bg-white/5 transition-all">
            Cancelar
          </button>
          <button type="submit" :disabled="loading"
            class="flex-[2] px-4 py-4 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/20">
            <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
            <Save v-else class="h-4 w-4" />
            {{ loading ? 'Salvando...' : 'Salvar Alterações' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { User, X, Loader2, ChevronDown, Check, Building2, Save } from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';
import type { Sellers } from '../../gen/types/Sellers';
import type { Business } from '../../gen/types/Business';
import { putSellersId } from '../../gen/hooks/putSellersId';
import { getSellers } from '../../gen/hooks/getSellers';
import { getBusiness } from '../../gen/hooks/getBusiness';
import { putSellerBusiness } from '../../gen/hooks/putSellerBusiness';
import client from '../../api/client';
import crypto from 'crypto-js';

type SellerWithRelations = Sellers & {
  seller_business?: {
    business_id: number;
    business?: Business;
  }[];
};

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits(['close', 'updated']);

const authStore = useAuthStore();
const loading = ref(false);
const allBusiness = ref<Business[]>([]);
const heads = ref<Sellers[]>([]);
const selectedBUs = ref<number[]>([]);

const form = ref({
  name: '',
  email: '',
  password: '',
  cpf: '',
  phone: '',
  head_id: null as any
});

const user = computed(() => authStore.user as SellerWithRelations | null);
const canEditHierarchy = computed(() => user.value?.type === 'head' || user.value?.type === 'admin');

const loadInitialData = async () => {
    if (!canEditHierarchy.value) return;
    try {
        const [busData, sellersData] = await Promise.all([
            getBusiness({ client }),
            getSellers({}, { client })
        ]);
        allBusiness.value = busData as Business[];
        heads.value = (sellersData as Sellers[]).filter(s => s.type === 'head' && s.id !== user.value?.id);
    } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
    }
};

watch(() => props.isOpen, async (newVal) => {
  if (newVal && user.value) {
    await loadInitialData();
    form.value = {
      name: user.value.name || '',
      email: user.value.email || '',
      password: '',
      cpf: user.value.cpf || '',
      phone: user.value.phone || '',
      head_id: user.value.head_id ? user.value.head_id : null
    };
    selectedBUs.value = user.value.seller_business?.map((sb: any) => sb.business_id) || [];
  }
});

const close = () => emit('close');

const handleSubmit = async () => {
  if (!user.value?.id) return;
  loading.value = true;
  try {
    const sellerPayload: any = {
      name: form.value.name,
      email: form.value.email,
      cpf: form.value.cpf,
      phone: form.value.phone
    };

    if (canEditHierarchy.value) {
        sellerPayload.head_id = form.value.head_id ? form.value.head_id.toString() : null;
    }

    if (form.value.password) {
      sellerPayload.password = crypto.MD5(form.value.password).toString();
    }

    // Update Seller
    await putSellersId(user.value.id as any, { data: sellerPayload }, { client });

    // Update Business Associations if permitted
    if (canEditHierarchy.value) {
      await putSellerBusiness({
        data: {
          seller_id: user.value.id as any,
          business_ids: selectedBUs.value
        }
      }, { client });
    }

    // Update user in store to reflect changes immediately
    const updatedSellerBusiness = selectedBUs.value.map(id => ({ business_id: id }));
    authStore.updateUser({ 
        ...sellerPayload, 
        seller_business: updatedSellerBusiness as any 
    });
    
    emit('updated');
    close();
  } catch (error: any) {
    console.error('Falha ao atualizar perfil:', error);
    const msg = error.response?.data?.error || 'Erro ao atualizar perfil. Verifique seus dados.';
    alert(msg);
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
</style>
