<template>
  <Teleport to="body">
    <div class="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div 
          v-for="toast in toasts" 
          :key="toast.id"
          :class="[
            'pointer-events-auto flex items-start gap-4 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border transform transition-all',
            'w-80 font-sans',
            getTypeClasses(toast.type)
          ]"
        >
          <!-- Ícone Contextual -->
          <div class="flex-shrink-0 mt-0.5">
            <component :is="getIcon(toast.type)" :class="['h-6 w-6', getIconColor(toast.type)]" />
          </div>

          <!-- Conteúdo -->
          <div class="flex-1 space-y-1">
            <h4 :class="['text-sm font-bold', getTitleColor(toast.type)]">{{ getTitle(toast.type) }}</h4>
            <p class="text-xs text-white/70 leading-relaxed">{{ toast.message }}</p>
          </div>


        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  X 
} from 'lucide-vue-next';

const { toasts, removeToast } = useToast();

const getTypeClasses = (type: string = 'info') => {
  switch (type) {
    case 'success': return 'bg-[#0A0F1C] border border-green-500/20 shadow-lg shadow-green-500/10';
    case 'error': return 'bg-[#0A0F1C] border border-red-500/20 shadow-lg shadow-red-500/10';
    case 'warning': return 'bg-[#0A0F1C] border border-red-500/30 shadow-lg shadow-red-500/15';
    default: return 'bg-[#0A0F1C] border border-brand-cyan/20 shadow-lg shadow-brand-cyan/10';
  }
};

const getTitleColor = (type: string = 'info') => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-red-500';
    default: return 'text-brand-cyan';
  }
};

const getIconColor = (type: string = 'info') => {
  switch (type) {
    case 'success': return 'text-green-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-red-500';
    default: return 'text-brand-cyan';
  }
};

const getTitle = (type: string = 'info') => {
  switch (type) {
    case 'success': return 'Sucesso';
    case 'error': return 'Atenção';
    case 'warning': return 'Aviso';
    default: return 'Informação';
  }
};

const getIcon = (type: string = 'info') => {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'error': return AlertCircle;
    case 'warning': return AlertTriangle;
    default: return Info;
  }
};
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}
</style>
