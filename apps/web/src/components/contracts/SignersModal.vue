<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <Transition name="fade-backdrop">
        <div class="absolute inset-0 bg-brand-deep/80 backdrop-blur-md transition-opacity" @click="close"></div>
      </Transition>

      <!-- Modal Panel -->
      <Transition name="modal-scale" appear>
        <div v-if="isOpen"
          class="relative bg-brand-deep border border-brand-glass-border rounded-[32px] p-8 w-full max-w-lg shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col space-y-7">
          <!-- Gosh-rays / Ambient light -->
          <div
            class="absolute -top-24 -right-24 w-64 h-64 bg-brand-cyan/20 rounded-full blur-[100px] pointer-events-none">
          </div>
          <div
            class="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-blue/10 rounded-full blur-[100px] pointer-events-none">
          </div>

          <!-- Header -->
          <div class="flex items-center gap-5 relative z-10">
            <div
              class="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,212,255,0.15)]">
              <Users class="h-7 w-7 text-brand-cyan" />
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-2xl font-black text-white tracking-tight leading-none">Signatários</h3>
              <p class="text-[10px] text-brand-cyan/60 uppercase font-black tracking-[0.2em] mt-3 truncate">{{
                contractTitle }}</p>
            </div>
            <button @click="close"
              class="p-2.5 hover:bg-white/5 rounded-xl transition-all text-white/20 hover:text-white active:scale-90">
              <X class="h-5 w-5" />
            </button>
          </div>

          <!-- Content Wrapper -->
          <div class="relative z-10 space-y-4 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar -mr-2">

            <div v-if="loading" class="py-20 flex flex-col items-center justify-center space-y-4">
              <div class="relative">
                <div class="h-12 w-12 border-2 border-brand-cyan/20 border-t-brand-cyan rounded-full animate-spin">
                </div>
                <div class="absolute inset-0 h-12 w-12 border-2 border-brand-cyan/5 rounded-full animate-pulse"></div>
              </div>
              <p class="text-[10px] text-white/40 uppercase font-black tracking-[0.3em] animate-pulse">Sincronizando...
              </p>
            </div>

            <div v-else-if="signers.length === 0" class="py-20 text-center space-y-3">
              <div class="h-12 w-12 rounded-full bg-white/5 mx-auto flex items-center justify-center opacity-20">
                <Users class="h-6 w-6" />
              </div>
              <p class="text-white/30 text-xs font-medium italic">Nenhum signatário ativo.</p>
            </div>

            <div v-else v-for="(signer, idx) in signers" :key="idx"
              class="group p-5 rounded-[24px] bg-white/[0.03] border border-white/[0.05] transition-all duration-300 flex items-center justify-between hover:bg-white/[0.06] hover:border-brand-cyan/30 hover:shadow-[0_8px_32px_rgba(0,212,255,0.05)] animate-slide-up"
              :style="{ animationDelay: (idx * 0.1) + 's' }">

              <div class="flex items-center gap-4 text-left">
                <div
                  class="h-11 w-11 rounded-xl border border-white/10 flex items-center justify-center font-extrabold text-[11px] transition-all group-hover:border-brand-cyan/40 group-hover:shadow-[0_0_15px_rgba(0,212,255,0.2)]"
                  :class="signer.signed ? 'bg-brand-cyan/10 text-brand-cyan shadow-[inset_0_0_10px_rgba(0,212,255,0.1)]' : 'bg-white/5 text-white/30'">
                  {{ getInitials(signer.name) }}
                </div>
                <div class="min-w-0">
                  <h4 class="text-sm font-extrabold text-white group-hover:text-brand-cyan transition-colors truncate">
                    {{ signer.name }}</h4>
                  <p class="text-[10px] text-white/30 font-medium lowercase truncate mt-1 tracking-wide">{{ signer.email
                    }}</p>
                </div>
              </div>

              <div class="flex-shrink-0 ml-4">
                <div v-if="signer.signed"
                  class="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-[9px] font-black uppercase tracking-widest border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)] flex items-center gap-1.5">
                  <div class="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  Assinado
                </div>
                <div v-else
                  class="px-3 py-1.5 rounded-full bg-white/5 text-white/30 text-[9px] font-black uppercase tracking-widest border border-white/5 flex items-center gap-1.5">
                  <div class="h-1.5 w-1.5 rounded-full bg-white/20"></div>
                  Pendente
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-between pt-4 border-t border-brand-glass-border relative z-10">
            <div class="flex items-center gap-2">
              <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan/40 animate-pulse"></div>
              <p class="text-[9px] text-white/20 font-bold uppercase tracking-[0.1em]">Cloud Sync v3</p>
            </div>
            <button @click="close"
              class="group/close relative overflow-hidden px-10 py-3.5 rounded-2xl bg-brand-surface border border-brand-glass-border text-white/60 hover:text-white transition-all active:scale-95 shadow-lg">
              <div class="absolute inset-0 bg-white/5 opacity-0 group-hover/close:opacity-100 transition-opacity"></div>
              <span class="relative z-10 font-black text-[10px] uppercase tracking-[0.2em]">Fechar</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Users, X } from 'lucide-vue-next';
import { watch, onUnmounted } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  loading: boolean;
  contractTitle: string;
  signers: Array<{ name: string, email: string, signed: boolean }>;
}>();

const emit = defineEmits(['close']);

const close = () => emit('close');

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

const getInitials = (name: string) => {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  // Pega primeira letra do primeiro nome e primeira letra do último nome
  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
};
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.6s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.85) translateY(30px) rotateX(10deg);
}

.fade-backdrop-enter-active,
.fade-backdrop-leave-active {
  transition: opacity 0.4s ease;
}

.fade-backdrop-enter-from,
.fade-backdrop-leave-to {
  opacity: 0;
}

.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 212, 255, 0.1) transparent;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.1);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.3);
}
</style>
