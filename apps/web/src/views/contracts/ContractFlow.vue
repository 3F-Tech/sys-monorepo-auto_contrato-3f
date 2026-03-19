<template>
  <div class="min-h-screen bg-brand-deep text-white font-sans selection:bg-brand-cyan/30">
    <!-- Header Simples para o Fluxo -->
    <header class="border-b border-brand-glass-border bg-brand-offset/50 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="handleBack"
            class="p-2 rounded-lg hover:bg-white/5 transition-colors text-white/40 hover:text-brand-cyan">
            <ChevronLeft class="h-6 w-6" />
          </button>
          <div>
            <h2 class="text-sm font-semibold text-white/90 leading-tight">Novo Contrato</h2>
            <p class="text-[11px] text-brand-cyan uppercase tracking-wider font-medium">
              Etapa {{ currentStep }}: {{ currentStep === 1 ? 'Seleção de Unidade' : 'Escolha o Modelo' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div
            class="h-8 w-8 rounded-full bg-brand-surface border border-brand-glass-border flex items-center justify-center text-[10px] font-bold text-brand-cyan">
            {{ currentStep }}/3
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-5xl mx-auto px-6 py-16 space-y-12">

      <!-- STEP 1: BU SELECTION -->
      <template v-if="currentStep === 1">
        <section class="text-center space-y-4">
          <div
            class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/5 border border-brand-cyan/10 mb-2">
            <Building2 class="h-4 w-4 text-brand-cyan" />
            <span class="text-brand-cyan text-[10px] font-bold uppercase tracking-widest">Onde este contrato será
              gerado?</span>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight">Escolha a <span class="text-brand-cyan">Unidade de
              Negócio</span></h1>
          <p class="text-white/40 text-sm max-w-xl mx-auto italic">Selecione a BU responsável pelo contrato para
            visualizar os modelos disponíveis.</p>
        </section>

        <section>
          <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div v-for="i in 3" :key="i"
              class="h-64 rounded-[2.5rem] bg-brand-offset/50 border border-brand-glass-border animate-pulse"></div>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <button v-for="bu in filteredBusiness" :key="bu.id" @click="handleBUSelect(bu)"
              class="group relative p-10 rounded-[2.5rem] bg-brand-offset border border-brand-glass-border hover:border-brand-glass-border transition-all duration-500 flex flex-col items-center text-center gap-6 overflow-hidden"
              :style="{ '--bu-color': bu.color || '#00d4ff' }">

              <div :style="{ backgroundColor: (bu.color || '#00d4ff') + '10' }" class="absolute inset-0 z-0"></div>

              <div
                class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0"
                :style="{ background: `radial-gradient(circle at center, ${bu.color}15 0%, transparent 70%)` }"></div>

              <div
                class="relative z-10 h-32 w-32 rounded-3xl bg-black/20 border border-white/5 p-0 overflow-hidden flex items-center justify-center group-hover:scale-105 group-hover:border-[var(--bu-color)]/30 transition-all duration-500 shadow-2xl">
                <img v-if="bu.img_base64" :src="bu.img_base64"
                  class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div v-else class="h-full w-full flex items-center justify-center"
                  :style="{ backgroundColor: (bu.color || '#00d4ff') + '20' }">
                  <Building2 class="h-12 w-12" :style="{ color: bu.color || '#00d4ff' }" />
                </div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-40"></div>
              </div>

              <div class="relative z-10 space-y-2">
                <h3 class="text-2xl font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors">
                  {{ bu.name }}</h3>
                <p class="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">Unidade de Negócio</p>
              </div>

              <div
                class="relative z-10 mt-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-cyan opacity-0 group-hover:opacity-100 group-hover:translate-y-0 translate-y-4 transition-all duration-500">
                Explorar Modelos
                <ArrowRight class="h-3 w-3" />
              </div>

              <div
                class="absolute inset-0 border-2 border-[var(--bu-color)] opacity-0 group-hover:opacity-20 rounded-[2.5rem] transition-all duration-500 pointer-events-none z-0">
              </div>
            </button>
          </div>

          <div v-if="!loading && filteredBusiness.length === 0" class="text-center py-20 space-y-6">
            <div class="h-20 w-20 mx-auto rounded-3xl bg-brand-cyan/5 flex items-center justify-center text-white/10">
              <ShieldAlert class="h-10 w-10" />
            </div>
            <div class="space-y-2">
              <h3 class="text-xl font-bold">Nenhuma Unidade Vinculada</h3>
              <p class="text-white/40 text-sm max-w-xs mx-auto">Você não possui permissão para gerar contratos em
                nenhuma unidade. Contate o administrador.</p>
            </div>
            <button @click="router.push('/')" class="btn-primary px-8 py-3 rounded-xl mx-auto">Voltar ao Início</button>
          </div>
        </section>
      </template>

      <!-- STEP 2: TEMPLATE SELECTION -->
      <template v-if="currentStep === 2">
        <section class="text-center space-y-4">
          <div
            class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/5 border border-brand-cyan/10 mb-2">
            <div class="h-6 w-6 rounded-lg overflow-hidden border border-white/10">
              <img v-if="selectedBU?.img_base64" :src="selectedBU.img_base64" class="h-full w-full object-cover" />
            </div>
            <span class="text-brand-cyan text-[10px] font-bold uppercase tracking-widest">{{ selectedBU?.name }}</span>
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight">Qual <span class="text-brand-cyan">Modelo de
              Contrato</span>?</h1>
          <p class="text-white/40 text-sm max-w-xl mx-auto italic">Cada modelo possui campos específicos para o
            preenchimento automático.</p>
        </section>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto pb-20">
          <button v-for="template in availableTemplates" :key="template" @click="handleTemplateSelect(template)"
            class="group p-6 rounded-2xl bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/40 transition-all flex items-center justify-between text-left">
            <div class="flex items-center gap-4">
              <div
                class="h-12 w-12 rounded-xl bg-brand-surface border border-brand-glass-border flex items-center justify-center text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all">
                <FileText class="h-6 w-6" />
              </div>
              <div>
                <h4 class="font-bold text-white group-hover:text-brand-cyan transition-colors">{{ template }}</h4>
                <p class="text-[10px] text-white/40 uppercase tracking-widest leading-none mt-1">Template de Contrato
                </p>
              </div>
            </div>
            <ChevronRight
              class="h-5 w-5 text-white/10 group-hover:text-brand-cyan transition-all translate-x-0 group-hover:translate-x-1" />
          </button>
        </section>
      </template>

      <!-- STEP 3: SMART FORM -->
      <template v-if="currentStep === 3">
        <div class="max-w-4xl mx-auto space-y-12">
          <section class="text-center space-y-6 mb-16">
            <!-- BU Logo Premium Container -->
            <div v-if="selectedBU?.img_base64"
              class="mx-auto w-20 h-20 rounded-2xl bg-brand-surface border border-brand-glass-border shadow-2xl mb-2 hover:scale-105 transition-all duration-500 flex items-center justify-center overflow-hidden">
              <img :src="selectedBU.img_base64" class="h-full w-full object-cover" />
            </div>

            <div
              class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-cyan/5 border border-brand-cyan/10">
              <FileText class="h-4 w-4 text-brand-cyan" />
              <span class="text-brand-cyan text-[10px] font-bold uppercase tracking-widest">{{ selectedTemplate
                }}</span>
            </div>
            <h1 class="text-4xl font-extrabold tracking-tight">Preencha os <span class="text-brand-cyan">Dados</span>
            </h1>
            <p class="text-white/40 text-sm max-w-xl mx-auto italic">Insira as informações do contratante para gerar o
              documento final.</p>
          </section>

          <!-- Render Condicional do Form (por enquanto apenas Impulse Plano 1) -->
          <component v-if="activeFormComponent" :is="activeFormComponent" :form="contractData" :errors="formErrors" />

          <div v-else class="text-center py-20 bg-brand-surface/20 rounded-3xl border border-brand-glass-border">
            <Construction class="h-12 w-12 mx-auto text-brand-cyan opacity-20 mb-4" />
            <h3 class="text-xl font-bold">Formulário em Desenvolvimento</h3>
            <p class="text-white/40 text-sm mt-2">O formulário para este modelo específico está sendo configurado.</p>
            <button @click="currentStep = 2"
              class="mt-6 text-brand-cyan text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-lg bg-brand-cyan/5 border border-brand-cyan/10 hover:bg-brand-cyan hover:text-brand-deep transition-all">Trocar
              Modelo</button>
          </div>

          <!-- Global Action Bar -->
          <div v-if="activeFormComponent"
            class="sticky bottom-8 z-40 p-4 rounded-3xl bg-brand-offset/80 backdrop-blur-xl border border-brand-glass-border shadow-2xl flex items-center justify-between gap-4">
            <div class="flex items-center gap-4 px-4">
              <div class="h-10 w-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                <ShieldCheck class="h-6 w-6" />
              </div>
              <div>
                <p class="text-[10px] text-white/40 font-bold uppercase tracking-widest">Status dos Dados</p>
                <p class="text-[12px] font-bold text-brand-cyan">Pronto para Gerar</p>
              </div>
            </div>

            <div class="flex gap-3">
              <button @click="currentStep = 2"
                class="px-8 py-3 rounded-2xl bg-brand-surface border border-brand-glass-border font-bold text-xs hover:bg-white/5 transition-all">Voltar</button>
              <button @click="handleContractGenerate" :disabled="isGenerating"
                class="btn-primary px-10 py-3 rounded-2xl shadow-lg shadow-brand-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <Loader2 v-if="isGenerating" class="h-4 w-4 animate-spin" />
                {{ isGenerating ? 'Gerando...' : 'Finalizar Contrato' }}
              </button>
            </div>
          </div>
        </div>
      </template>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../store/auth';
import { getBusiness } from '../../gen/hooks/getBusiness';
import { getSellers } from '../../gen/hooks/getSellers';
import client from '../../api/client';
import type { Business } from '../../gen/types/Business';
import type { Sellers } from '../../gen/types/Sellers';
import {
  ChevronLeft,
  Building2,
  ArrowRight,
  ShieldAlert,
  FileText,
  ChevronRight,
  ShieldCheck,
  Construction,
  Loader2
} from 'lucide-vue-next';
import ImpulsePlano1 from './steps/ImpulsePlano1.vue';
import ImpulsePlano2 from './steps/ImpulsePlano2.vue';
import SeedPlano1 from './steps/SeedPlano1.vue';
import SeedPlano2 from './steps/SeedPlano2.vue';
import SeedPlanoGrowth from './steps/SeedPlanoGrowth.vue';
import BommaTemplate from './steps/BommaTemplate.vue';

import { useToast } from '../../composables/useToast';

import { getValidationRules } from '../../utils/contractValidations';

const router = useRouter();
const authStore = useAuthStore();
const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

const loading = ref(true);
const currentStep = ref(1);
const allBusiness = ref<Business[]>([]);
const allSellers = ref<Sellers[]>([]);
const selectedBU = ref<Business | null>(null);
const selectedTemplate = ref('');
const isGenerating = ref(false);

// Objeto centralizado para todos os dados dos contratos
const contractData = ref<Record<string, any>>({});
// Mapeamento de erros: 'NOME DO CAMPO': 'Mensagem de erro'
const formErrors = ref<Record<string, string>>({});

// Mapeamento de Modelos por BU (Atualizado conforme imagem)
const templatesByBU: Record<string, string[]> = {
  'Bomma': [
    'Assessoria',
    'Consultoria',
    'Assessoria + Social Media (Qtd Min Artes)',
    'Assessoria + Social Media (Qtd Min Determinada)',
    'Assessoria + Social Media (Qtd Min Vídeos)',
    'Assessoria + Social Media (Ilimitado)',
    'Social Media (Ilimitado)',
    'Social Media (Qtd Min Determinada)'
  ],
  'Impulse': [
    'Plano 1 - Geração de Oportunidade',
    'Plano 2 - + Social Media',
    'Plano 3 - Time completo de Marketing'
  ],
  'Seed': [
    'Plano 1 - Geração de Oportunidade',
    'Plano 2 - + Social Media',
    'Plano 3 - Time completo de Marketing',
    'Plano Growth'
  ]
};

onMounted(async () => {
  try {
    const [resBus, resSellers] = await Promise.all([
      getBusiness({ client }),
      getSellers({}, { client })
    ]);
    allBusiness.value = resBus as Business[];
    allSellers.value = resSellers as Sellers[];
  } catch (error) {
    console.error('Falha ao carregar dados auxiliares:', error);
  } finally {
    loading.value = false;
  }
});

const filteredBusiness = computed(() => {
  const user = authStore.user;
  if (!user) return [];

  // Se for Admin, mostra tudo
  if (user.type === 'admin') return allBusiness.value;

  // Se for Seller/Head, filtra pelas vinculadas
  const linkedIds = (user as any).seller_business?.map((sb: any) => sb.business_id) || [];
  return allBusiness.value.filter(bu => linkedIds.includes(bu.id));
});

const availableTemplates = computed(() => {
  if (!selectedBU.value?.name) return [];
  // Tenta encontrar por nome exato ou contenção (para flexibilidade)
  const buName = selectedBU.value.name;
  const key = Object.keys(templatesByBU).find(k => buName.toLowerCase().includes(k.toLowerCase()));
  return key ? templatesByBU[key] : [];
});

// Define qual componente de form renderizar baseado na BU e Template
const activeFormComponent = computed(() => {
  if (!selectedBU.value || !selectedTemplate.value) return null;

  const buName = selectedBU.value.name?.toLowerCase() || '';
  const templateName = selectedTemplate.value?.toLowerCase() || '';
  // Mapeamento dinâmico
  if (buName.includes('impulse')) {
    if (templateName.includes('plano 1')) return ImpulsePlano1;
    if (templateName.includes('plano 2')) return ImpulsePlano2;
  }

  if (buName.includes('seed')) {
    if (templateName.includes('plano 1')) return SeedPlano1;
    if (templateName.includes('plano 2')) return SeedPlano2;
    if (templateName.includes('growth')) return SeedPlanoGrowth;
  }

  if (buName.includes('bomma')) {
    // Todos os modelos Bomma usam o mesmo componente base
    return BommaTemplate;
  }

  return null;
});

// Define qual endpoint da API chamar baseado na BU e Template
const activeEndpoint = computed(() => {
  if (!selectedBU.value || !selectedTemplate.value) return null;

  const buName = selectedBU.value.name?.toLowerCase() || '';
  const templateName = selectedTemplate.value?.toLowerCase() || '';

  if (buName.includes('impulse')) {
    if (templateName.includes('plano 1')) return '/contracts-sheets/impulse-plano-1';
    if (templateName.includes('plano 2')) return '/contracts-sheets/impulse-plano-2';
  }

  if (buName.includes('seed')) {
    if (templateName.includes('plano 1')) return '/contracts-sheets/seed-plano-1';
    if (templateName.includes('plano 2')) return '/contracts-sheets/seed-plano-2';
    if (templateName.includes('growth')) return '/contracts-sheets/seed-plano-growth';
  }

  if (buName.includes('bomma')) {
    // Mapeamento dinâmico para endpoints da Bomma
    if (templateName.includes('assessoria') && !templateName.includes('social media')) return '/contracts-sheets/bomma-assessoria';
    if (templateName.includes('consultoria')) return '/contracts-sheets/bomma-consultoria';
    if (templateName.includes('assessoria') && templateName.includes('social media')) {
      if (templateName.includes('artes')) return '/contracts-sheets/bomma-assessoria-social-artes';
      if (templateName.includes('determinada')) return '/contracts-sheets/bomma-assessoria-social-determinada';
      if (templateName.includes('vídeos')) return '/contracts-sheets/bomma-assessoria-social-videos';
      if (templateName.includes('ilimitado')) return '/contracts-sheets/bomma-assessoria-social-ilimitado';
    }
    if (templateName.includes('social media') && !templateName.includes('assessoria')) {
      if (templateName.includes('ilimitado')) return '/contracts-sheets/bomma-social-ilimitado';
      if (templateName.includes('determinada')) return '/contracts-sheets/bomma-social-determinada';
    }
  }

  return null;
});

const handleBUSelect = (bu: Business) => {
  selectedBU.value = bu;
  currentStep.value = 2;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleTemplateSelect = (template: string) => {
  selectedTemplate.value = template;

  // Auto-preenchimento Inteligente - Mapeia todas as chaves esperadas para o form de Contrato.
  const initialData: Record<string, any> = {
    'RAZAO SOCIAL DO CONTRATANTE': '',
    'CNPJ DO CONTRATANTE': '',
    'CEP DO CONTRATANTE': '',
    'LOGRADOURO DO CONTRATANTE': '',
    'NUMERO DO CONTRATANTE': '',
    'BAIRRO DO CONTRATANTE': '',
    'CIDADE DO CONTRATANTE': '',
    'UF DO CONTRATANTE': '',
    'NOME DO REPRESENTANTE': '',
    'CARGO DO REPRESENTANTE': '',
    'CPF DO REPRESENTANTE': '',
    'VALOR TAXA IMPLEMENTACAO': '',
    'VALOR MENSALIDADE': '',
    'DATA PRIMEIRO PAGAMENTO': '',
    'DIA VENCIMENTO MENSAL': '',
    'DATA ASSINATURA CONTRATO': '',
    'NOME TESTEMUNHA 1': '',
    'CPF TESTEMUNHA 1': '',
    'NOME VENDEDOR': '',
    'CPF VENDEDOR': '',
    'NOME COORD BU': '',
    'CPF COORD BU': ''
  };

  // Se não for Growth, adiciona o prazo
  if (!template.toLowerCase().includes('growth')) {
    initialData['PRAZO CONTRATUAL MESES'] = '';
  }

  const user = authStore.user;

  if (user) {
    initialData['NOME VENDEDOR'] = user.name || '';
    initialData['CPF VENDEDOR'] = user.cpf || '';
  }

  if (selectedBU.value?.id) {
    const buId = selectedBU.value.id;
    const coordinator = allSellers.value.find(s =>
      s.type === 'coord' &&
      (s as any).seller_business?.some((sb: any) => sb.business_id === buId)
    );

    if (coordinator) {
      initialData['NOME COORD BU'] = coordinator.name || '';
      initialData['CPF COORD BU'] = coordinator.cpf || '';
    }
  }

  formErrors.value = {}; // reset erros
  contractData.value = initialData;
  currentStep.value = 3;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Validar formulário antes de enviar
const validateForm = () => {
  const errors = getValidationRules(contractData.value);
  formErrors.value = errors;

  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    // Focus e scroll
    setTimeout(() => {
      const firstErrorEl = document.getElementById(errorKeys[0]);
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorEl.focus({ preventScroll: true });
      }
    }, 100);
    return false;
  }

  return true;
};

// Remove os erros em tempo real conforme os campos são preenchidos (com debounce)
let validationTimeout: any = null;
watch(
  contractData,
  () => {
    if (Object.keys(formErrors.value).length === 0) return;
    
    if (validationTimeout) clearTimeout(validationTimeout);
    validationTimeout = setTimeout(() => {
      const currentValidation = getValidationRules(contractData.value);
      const newErrors: Record<string, string> = {};
      for (const key in formErrors.value) {
        if (currentValidation[key]) {
          newErrors[key] = currentValidation[key];
        }
      }
      formErrors.value = newErrors;
    }, 300);
  },
  { deep: true }
);

const handleContractGenerate = async () => {
  if (!activeEndpoint.value) {
    toastError('Endpoint não configurado para este modelo de contrato.');
    return;
  }

  if (!validateForm()) {
    toastWarning('Preencha os campos destacados antes de prosseguir.');
    return;
  }

  isGenerating.value = true;
  try {
    const response = await client.post(activeEndpoint.value, {
      data: contractData.value,
      bu_id: selectedBU.value?.id,
      bu_name: selectedBU.value?.name
    });

    if (response.data.success) {
      toastSuccess('Contrato gerado com sucesso!');
      router.push('/');
    }
  } catch (error: any) {
    console.error('Erro ao gerar contrato:', error);
    const backendErrors = error.response?.data?.details;
    if (Array.isArray(backendErrors)) {
      const newErrors: Record<string, string> = { ...formErrors.value };
      backendErrors.forEach((err: any) => {
        // Mapeia o campo do backend para o campo do form (data.FIELD -> FIELD)
        const field = err.field?.replace('data.', '');
        if (field) newErrors[field] = err.message;
      });
      formErrors.value = newErrors;
      toastWarning('Alguns campos possuem erros de validação.');
    } else {
      toastError('Erro ao gerar contrato: ' + (error.response?.data?.error || error.message));
    }
  } finally {
    isGenerating.value = false;
  }
};

const handleBack = () => {
  if (currentStep.value === 1) {
    router.push('/');
  } else {
    currentStep.value--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* .btn-primary {
  @apply bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep font-bold transition-all active:scale-95 flex items-center gap-2 justify-center;
} */
</style>
