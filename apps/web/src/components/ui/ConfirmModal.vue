<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm transition-opacity"
        @click="cancel"
      ></div>

      <!-- Modal Panel -->
      <div 
        class="relative bg-brand-offset border border-brand-glass-border rounded-3xl p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,0,0,0.5)] transform transition-all flex flex-col items-center text-center space-y-6"
      >
        <!-- Icon Banner -->
        <div 
          class="h-16 w-16 rounded-2xl border-2 flex items-center justify-center mb-2 transition-all duration-500"
          :class="[
            isLoading ? 'animate-pulse scale-90 opacity-40 border-white/5' : 
            type === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 
            type === 'orange' ? 'bg-[#FF4B12]/10 border-[#FF4B12]/20 text-[#FF4B12]' :
            'bg-brand-cyan/10 border-brand-cyan/20 text-brand-cyan'
          ]"
        >
          <slot name="icon">
            <component :is="iconComponent" class="h-8 w-8" />
          </slot>
        </div>

        <!-- The Text -->
        <div class="space-y-3">
          <h3 class="text-2xl font-extrabold tracking-tight text-white">{{ title }}</h3>
          <p class="text-sm font-medium leading-relaxed transition-all duration-300"
            :class="isLoading ? 'text-brand-cyan animate-pulse' : 'text-white/50'">
            {{ isLoading ? (loadingMessage || 'Processando...') : message }}
          </p>
        </div>

        <!-- The Actions -->
        <div class="grid grid-cols-2 gap-4 w-full pt-4 relative">
          <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center pt-4">
            <div class="flex items-center gap-3 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
               <div class="h-4 w-4 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin"></div>
               <span class="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan">Aguarde...</span>
            </div>
          </div>

          <button 
            @click="cancel"
            :disabled="isLoading"
            class="px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest bg-brand-surface/40 border border-brand-glass-border text-white/60 hover:text-white hover:bg-brand-surface transition-all active:scale-95 disabled:opacity-0"
          >
            {{ cancelText }}
          </button>
          
          <button 
            @click="confirm"
            :disabled="isLoading"
            class="px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest text-[#0a0f1c] shadow-lg transition-all active:scale-95 disabled:opacity-0"
            :class="[
              type === 'danger' 
                ? 'bg-red-500 hover:bg-red-400 hover:shadow-red-500/20' 
                : type === 'orange'
                ? 'bg-[#FF4B12] hover:bg-[#FF4B12]/90 hover:shadow-[#FF4B12]/20'
                : 'bg-gradient-to-r from-brand-cyan to-brand-blue hover:brightness-110 hover:shadow-brand-cyan/20'
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onUnmounted } from 'vue';
import { AlertTriangle, AlertCircle, Info, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  title: { type: String, default: 'Confirmar Ação' },
  message: { type: String, required: true },
  confirmText: { type: String, default: 'Confirmar' },
  cancelText: { type: String, default: 'Cancelar' },
  type: { type: String, default: 'danger', validator: (v: string) => ['danger', 'warning', 'info', 'orange'].includes(v) },
  icon: { type: String, default: 'trash' },
  isLoading: { type: Boolean, default: false },
  loadingMessage: { type: String, default: '' }
});

const emit = defineEmits(['confirm', 'cancel']);

// Bloquear scroll do body ao abrir o modal
watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
}, { immediate: true });

onUnmounted(() => {
  document.body.style.overflow = '';
});

const iconComponent = computed(() => {
  switch (props.icon) {
    case 'trash': return Trash2;
    case 'triangle': return AlertTriangle;
    case 'circle': return AlertCircle;
    default: return Info;
  }
});

const confirm = () => emit('confirm');
const cancel = () => emit('cancel');
</script>
