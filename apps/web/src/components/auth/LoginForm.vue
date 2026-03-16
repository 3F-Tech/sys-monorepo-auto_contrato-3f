<template>
  <div class="w-full h-full flex flex-col">

    <!-- Top-left: Título da marca -->
    <div class="mb-auto">

      <!-- Mobile: Logo -->
      <div class="flex justify-start mb-6 lg:hidden">
        <img src="../../assets/3F/3fventure-logo.jpg" alt="3F Venture" class="h-12 w-12 rounded-xl" />
      </div>

      <!-- Eyebrow -->
      <div class="flex items-center gap-2.5 mb-3">
        <span class="block w-6 h-px bg-brand-cyan"></span>
        <span class="text-brand-cyan text-[10px] font-semibold uppercase tracking-[0.18em]">Sistema de Gestão</span>
      </div>

      <!-- Título principal -->
      <h1 class="text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.03em] text-white">
        Automação de <span class="text-brand-cyan">Contratos</span>
      </h1>
    </div>

    <!-- Center: Formulário -->
    <div class="flex-1 flex items-center justify-center">
      <div class="w-full max-w-[420px]">

        <!-- Subheading -->
        <div class="mb-8">
          <h2 class="text-xl font-bold text-white tracking-tight">Bem-vindo de volta</h2>
          <p class="mt-1.5 text-sm text-white/40">Entre com suas credenciais para continuar.</p>
        </div>

        <!-- Form -->
        <form class="space-y-5 w-full flex flex-col justify-center" @submit.prevent="handleSubmit">

          <!-- Email -->
          <div>
            <label for="email" class="block text-xs font-semibold uppercase tracking-widest mb-2 text-brand-cyan">
              E-mail
            </label>
            <input id="email" v-model="email" name="email" type="email" autocomplete="email" placeholder="seu@email.com"
              required class="input-glass" />
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-xs font-semibold uppercase tracking-widest text-brand-cyan">
                Senha
              </label>
            </div>
            <div class="relative">
              <input id="password" v-model="password" name="password" :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password" placeholder="••••••••" required class="input-glass pr-11" />
              <button type="button" aria-label="Alternar visibilidade da senha"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                @click="showPassword = !showPassword">
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
          </div>

          <!-- Alerta de Erro -->
          <div v-if="errorMessage"
            class="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm animate-shake">
            <AlertCircle class="h-5 w-5 flex-shrink-0" />
            <p>{{ errorMessage }}</p>
          </div>

          <div class="space-y-2">
            <button type="submit" class="btn-primary" :disabled="loading">
              <span v-if="!loading">Entrar</span>
              <Loader2 v-else class="h-5 w-5 animate-spin mx-auto" />
            </button>
          </div>

        </form>

        <!-- Footer -->
        <!-- <p class="mt-8 text-center text-xs text-white/25">
          Não tem uma conta?
          <a href="#"
            class="font-semibold ml-1 transition-colors hover:text-white/60 text-brand-cyan/60">Cadastre-se</a>
        </p> -->

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-vue-next';
import { useAuthStore } from '../../store/auth';

const showPassword = ref(false);
const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  if (loading.value) return;

  loading.value = true;
  errorMessage.value = '';

  const result = await authStore.login(email.value, password.value);

  if (result.success) {
    router.push('/');
  } else {
    errorMessage.value = result.error || 'Credenciais inválidas';
    loading.value = false;
  }
};
</script>
