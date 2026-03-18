<template>
  <div class="min-h-screen w-full flex bg-[#0d1b2a]">

    <!-- Left Panel: Brand & Visual Identity -->
    <div class="hidden lg:flex flex-col justify-between w-[60%] relative overflow-hidden px-16 py-14">

      <!-- Top: Logo + Brand Name -->
      <div class="absolute left-[2vh] bottom-[3vh] z-10 flex items-center gap-3">
        <img src="../assets/3F/3fventure-logo.jpg" alt="3F Venture" class="h-11 w-11 rounded-lg opacity-90" />
        <span class="text-white/70 font-semibold tracking-widest text-md uppercase">3F Venture</span>
      </div>

      <!-- Center: Main brand block -->
      <div class="absolute top-[3vh] left-[3vh] z-10 flex flex-col">
        <h1 class="text-white text-[3.3rem] leading-[1.1] font-black tracking-tight">
          Métricas e<br />controle dos<br /><span style="color: #00d4ff;">seus contratos.</span>
        </h1>
      </div>
      <div class="w-full h-[45vh]">
        <img class="absolute bottom-0 left-0 w-full h-[110vh] object-cover"
          src="../assets/Blog-Assinei_Assinatura-digital-de-contratos_Creditos-Shutterstock-scaled.webp" alt=""
          srcset="">
      </div>
    </div>

    <!-- Right Panel: Login Form -->
    <div class="flex-1 flex flex-col px-10 py-12 relative bg-brand-offset">
      <LoginForm 
        :loading="loading" 
        @submit="handleLogin" 
      />
    </div>

    <!-- Simple Local Toast for Login Error (Teleported to body to guarantee z-index and visibility) -->
    <Teleport to="body">
      <div v-if="localError" class="fixed top-6 right-6 z-[99999] bg-[#0A0F1C] border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.2)] p-4 rounded-xl flex items-center gap-4 min-w-[320px] pointer-events-none transition-all duration-300 transform translate-y-0 opacity-100">
        <div class="flex-shrink-0 bg-red-500/15 p-2 rounded-full">
          <AlertCircle class="h-6 w-6 text-red-500" />
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-bold text-red-500 uppercase tracking-widest">Atenção</h4>
          <p class="text-sm text-white/90 mt-1">{{ localError }}</p>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import { AlertCircle } from 'lucide-vue-next';
import LoginForm from '../components/auth/LoginForm.vue';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const localError = ref('');
let errorTimeout: any = null;

const showLocalError = (msg: string) => {
  localError.value = msg;
  if (errorTimeout) clearTimeout(errorTimeout);
  errorTimeout = setTimeout(() => {
    localError.value = '';
  }, 4000);
};

const handleLogin = async ({ email, password }: any) => {
  if (loading.value) return;

  loading.value = true;
  // Não limpamos o erro aqui para que ele "se mantenha" visível enquanto
  // o novo carregamento acontece, evitando que a caixa desapareça e apareça.
  
  const startTime = Date.now();
  const result = await authStore.login(email, password);
  const elapsed = Date.now() - startTime;

  // Garante pelo menos 600ms de loading para evitar o "flicker" de estados ultra-rápidos
  const remaining = Math.max(0, 600 - elapsed);
  
  setTimeout(() => {
    if (result.success) {
      router.push('/');
    } else {
      showLocalError(result.error || 'Login incorreto');
      loading.value = false;
    }
  }, remaining);
};
</script>
