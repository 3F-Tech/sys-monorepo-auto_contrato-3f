<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-[100] flex items-center justify-center p-4"
  >
    <div
      class="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl"
      @click="close"
    ></div>

    <div
      class="relative w-full max-w-4xl bg-brand-offset/90 border border-brand-glass-border rounded-[2.5rem] shadow-3xl overflow-hidden p-10 flex flex-col h-[85vh] animate-in zoom-in-95 duration-300 backdrop-blur-xl"
    >
      <!-- Header -->
      <div class="relative z-10 flex items-center justify-between mb-8">
        <div class="space-y-1">
          <div class="flex items-center gap-3">
            <div
              class="p-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20"
            >
              <DollarSign class="h-5 w-5 text-brand-cyan" />
            </div>
            <h3
              class="text-2xl font-black text-white tracking-tighter uppercase"
            >
              Configurar Custos
            </h3>
          </div>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold">
            Gestão financeira comercial • {{ monthName }} / {{ year }}
          </p>
        </div>
        <button
          @click="close"
          class="p-2 text-white/20 hover:text-white transition-colors"
        >
          <X class="h-6 w-6" />
        </button>
      </div>

      <!-- Content Area -->
      <div class="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <!-- Commercial Costs Form -->
        <div class="space-y-8 pb-4">
          <div
            class="p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/10 flex items-start gap-4"
          >
            <div class="p-2 rounded-xl bg-brand-cyan/10 mt-0.5">
              <Calculator class="h-4 w-4 text-brand-cyan" />
            </div>
            <div class="space-y-1">
              <p
                class="text-[10px] text-brand-cyan/80 uppercase font-black tracking-widest"
              >
                Custo Total de Recebimento Comercial
              </p>
              <p
                class="text-[9px] text-brand-cyan/40 uppercase font-bold tracking-widest"
              >
                Preencha os custos operacionais totais do departamento comercial
                para este mês.
              </p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <!-- Variáveis & Estrutura -->
            <div class="space-y-6">
              <h4
                class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1"
              >
                Variáveis & Estrutura
              </h4>

              <div class="space-y-4">
                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                    >Investimento em Mídia</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                      >R$</span
                    >
                    <input
                      v-model="commForm.media_investment"
                      type="text"
                      v-maska="maskOptions"
                      @keypress="onlyNumbers"
                      inputmode="numeric"
                      class="cost-input-pro"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                    >Ferramentas Comerciais</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                      >R$</span
                    >
                    <input
                      v-model="commForm.commercial_tools"
                      type="text"
                      v-maska="maskOptions"
                      @keypress="onlyNumbers"
                      inputmode="numeric"
                      class="cost-input-pro"
                      placeholder="0,00"
                    />
                  </div>
                </div>

                <div class="space-y-1.5 group/field">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                    >Comissão Indicação</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                      >R$</span
                    >
                    <input
                      v-model="commForm.referral_commission"
                      type="text"
                      v-maska="maskOptions"
                      @keypress="onlyNumbers"
                      inputmode="numeric"
                      class="cost-input-pro"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Time & Remuneração -->
            <div class="space-y-6">
              <h4
                class="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] ml-1"
              >
                Time & Remuneração
              </h4>

              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5 group/field">
                    <label
                      class="text-[9px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                      >Pré Vendas 1</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                        >R$</span
                      >
                      <input
                        v-model="commForm.remuneration_pre_sales_1"
                        type="text"
                        v-maska="maskOptions"
                        @keypress="onlyNumbers"
                        inputmode="numeric"
                        class="cost-input-pro pl-8"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div class="space-y-1.5 group/field">
                    <label
                      class="text-[9px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                      >Pré Vendas 2</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                        >R$</span
                      >
                      <input
                        v-model="commForm.remuneration_pre_sales_2"
                        type="text"
                        v-maska="maskOptions"
                        @keypress="onlyNumbers"
                        inputmode="numeric"
                        class="cost-input-pro pl-8"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-1.5 group/field">
                    <label
                      class="text-[9px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                      >Closer 1</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                        >R$</span
                      >
                      <input
                        v-model="commForm.remuneration_closer_1"
                        type="text"
                        v-maska="maskOptions"
                        @keypress="onlyNumbers"
                        inputmode="numeric"
                        class="cost-input-pro pl-8"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  <div class="space-y-1.5 group/field">
                    <label
                      class="text-[9px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                      >Closer 2</label
                    >
                    <div class="relative">
                      <span
                        class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                        >R$</span
                      >
                      <input
                        v-model="commForm.remuneration_closer_2"
                        type="text"
                        v-maska="maskOptions"
                        @keypress="onlyNumbers"
                        inputmode="numeric"
                        class="cost-input-pro pl-8"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div class="space-y-1.5 group/field pt-2">
                  <label
                    class="text-[10px] font-black text-brand-cyan/60 group-focus-within/field:text-brand-cyan uppercase tracking-widest ml-1 transition-colors"
                    >Remuneração Coordenadora</label
                  >
                  <div class="relative">
                    <span
                      class="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-white/20 group-focus-within/field:text-brand-cyan/40 transition-colors"
                      >R$</span
                    >
                    <input
                      v-model="commForm.remuneration_coord"
                      type="text"
                      v-maska="maskOptions"
                      @keypress="onlyNumbers"
                      inputmode="numeric"
                      class="cost-input-pro"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Summary Display -->
          <div
            class="mt-8 p-6 rounded-3xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-between"
          >
            <div class="space-y-1">
              <p
                class="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em]"
              >
                Custo Total Acumulado
              </p>
              <p class="text-[9px] text-white/40 uppercase font-medium">
                Soma de todos os campos operacionais acima
              </p>
            </div>
            <p class="text-3xl font-black text-brand-cyan tracking-tighter">
              {{ formatFullCurrency(totalCommercialCosts) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4 pt-8 mt-4 border-t border-white/5 relative z-10">
        <button
          @click="close"
          class="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase text-white/40 hover:bg-white/10 hover:text-white transition-all"
        >
          Cancelar
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="flex-[3] py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep shadow-xl shadow-brand-cyan/20 text-xs font-black uppercase hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
        >
          <span v-if="saving" class="flex items-center justify-center gap-2">
            <Loader2 class="h-4 w-4 animate-spin" /> Salvando Indicadores...
          </span>
          <span v-else class="flex items-center justify-center gap-2">
            <Save class="h-4 w-4" /> Salvar Custos Comerciais
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, computed } from "vue";
import { DollarSign, X, Loader2, Calculator, Save } from "lucide-vue-next";
import { useToast } from "../../composables/useToast";
import { useCostsStore } from "../../store/costs";

const props = defineProps<{
  isOpen: boolean;
  month: number;
  year: number;
}>();

const emit = defineEmits(["close", "saved"]);

const costsStore = useCostsStore();
const toast = useToast();

const onlyNumbers = (e: KeyboardEvent) => {
  if (
    e.ctrlKey ||
    e.metaKey ||
    ["Backspace", "Tab", "Enter", "ArrowLeft", "ArrowRight", "Delete"].includes(
      e.key,
    )
  ) {
    return;
  }
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

const maskOptions = {
  preProcess: (val: string) => val.replace(/[^\d]/g, ""),
  postProcess: (val: string) => {
    if (!val) return "";
    const num = parseInt(val, 10) / 100;
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  },
};

const parseBRL = (val: string | number) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  return parseFloat(val.replace(/\./g, "").replace(",", ".")) || 0;
};

const formatBRLInput = (val: number) => {
  if (val === 0) return "";
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
};

const commForm = ref({
  media_investment: "",
  commercial_tools: "",
  remuneration_pre_sales_1: "",
  remuneration_pre_sales_2: "",
  remuneration_closer_1: "",
  remuneration_closer_2: "",
  remuneration_coord: "",
  referral_commission: "",
});

const saving = ref(false);

const monthName = computed(() => {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return months[props.month - 1];
});

const totalCommercialCosts = computed(() => {
  return Object.values(commForm.value).reduce(
    (acc, val) => acc + parseBRL(val),
    0,
  );
});

const formatFullCurrency = (val: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(val);
};

watch(
  () => props.isOpen,
  async (val) => {
    if (val) {
      document.body.style.overflow = "hidden";
      await costsStore.fetchCosts(props.month, props.year);

      // Load Commercial Costs data
      if (costsStore.currentCosts) {
        commForm.value = {
          media_investment: formatBRLInput(
            Number(costsStore.currentCosts.media_investment || 0),
          ),
          commercial_tools: formatBRLInput(
            Number(costsStore.currentCosts.commercial_tools || 0),
          ),
          remuneration_pre_sales_1: formatBRLInput(
            Number(costsStore.currentCosts.remuneration_pre_sales_1 || 0),
          ),
          remuneration_pre_sales_2: formatBRLInput(
            Number(costsStore.currentCosts.remuneration_pre_sales_2 || 0),
          ),
          remuneration_closer_1: formatBRLInput(
            Number(costsStore.currentCosts.remuneration_closer_1 || 0),
          ),
          remuneration_closer_2: formatBRLInput(
            Number(costsStore.currentCosts.remuneration_closer_2 || 0),
          ),
          remuneration_coord: formatBRLInput(
            Number(costsStore.currentCosts.remuneration_coord || 0),
          ),
          referral_commission: formatBRLInput(
            Number(costsStore.currentCosts.referral_commission || 0),
          ),
        };
      }
    } else {
      document.body.style.overflow = "";
    }
  },
);

onBeforeUnmount(() => {
  document.body.style.overflow = "";
});

const close = () => emit("close");

const handleSave = async () => {
  saving.value = true;
  try {
    const dataToSave = {
      media_investment: parseBRL(commForm.value.media_investment),
      commercial_tools: parseBRL(commForm.value.commercial_tools),
      remuneration_pre_sales_1: parseBRL(
        commForm.value.remuneration_pre_sales_1,
      ),
      remuneration_pre_sales_2: parseBRL(
        commForm.value.remuneration_pre_sales_2,
      ),
      remuneration_closer_1: parseBRL(commForm.value.remuneration_closer_1),
      remuneration_closer_2: parseBRL(commForm.value.remuneration_closer_2),
      remuneration_coord: parseBRL(commForm.value.remuneration_coord),
      referral_commission: parseBRL(commForm.value.referral_commission),
      month: props.month,
      year: props.year,
    };

    await costsStore.saveCosts(dataToSave);
    toast.success("Custos comerciais salvos com sucesso!");
    emit("saved");
    close();
  } catch (err) {
    toast.error("Erro ao salvar os indicadores de custos.");
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.cost-input-pro {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  padding: 0.875rem 1rem 0.875rem 2.5rem;
  font-size: 0.875rem;
  color: white;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cost-input-pro:focus {
  outline: none;
  background: rgba(0, 212, 255, 0.02);
  border-color: rgba(0, 212, 255, 0.5);
  box-shadow:
    inset 0 2px 4px rgba(0, 0, 0, 0.1),
    0 0 20px rgba(0, 212, 255, 0.15);
  transform: translateY(-1px);
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
</style>
