<template>
  <div class="w-full h-full flex flex-col">
    <!-- Alerta de validação / erro do servidor -->
    <Transition
      enter-active-class="transition-all duration-500 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-98"
    >
      <div
        v-if="displayError"
        role="alert"
        aria-live="assertive"
        class="mb-6 bg-[#0A0F1C] border border-red-500/50 rounded-lg p-4 flex items-start gap-3 shadow-[0_0_20px_rgba(239,68,68,0.15)]"
      >
        <AlertCircle class="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <p class="text-sm text-white/90">{{ displayError }}</p>
        </div>
      </div>
    </Transition>

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
        Automação de
        <span class="text-brand-cyan">Contratos</span>
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
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              placeholder="seu@email.com"
              class="input-glass"
              :class="{ error: emailError }"
            />
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <label for="password" class="block text-xs font-semibold uppercase tracking-widest text-brand-cyan">
                Senha
              </label>
            </div>
            <div class="relative">
              <input
                id="password"
                v-model="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="••••••••"
                class="input-glass pr-11"
              />
              <button
                type="button"
                aria-label="Alternar visibilidade da senha"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="h-4 w-4" />
                <EyeOff v-else class="h-4 w-4" />
              </button>
            </div>
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
  import { ref, watch, computed } from 'vue'
  import { Loader2, AlertCircle, Eye, EyeOff } from '@lucide/vue'

  const props = defineProps({
    loading: {
      type: Boolean,
      default: false,
    },
    error: {
      type: String,
      default: '',
    },
  })

  const emit = defineEmits(['submit', 'clear-error'])

  const showPassword = ref(false)
  const email = ref('')
  const password = ref('')
  const validationError = ref('')
  const emailError = ref(false)

  const displayError = computed(() => validationError.value || props.error)

  watch([email, password], () => {
    validationError.value = ''
    emailError.value = false
    if (props.error) {
      emit('clear-error')
    }
  })

  const validate = (): boolean => {
    emailError.value = false
    if (!email.value.trim()) {
      validationError.value = 'Por favor, insira seu e-mail.'
      emailError.value = true
      return false
    }
    if (!password.value.trim()) {
      validationError.value = 'Por favor, insira sua senha.'
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.value)) {
      validationError.value = 'E-mail inválido. Verifique e tente novamente.'
      emailError.value = true
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (props.loading) return
    if (!validate()) return
    emit('submit', { email: email.value, password: password.value })
  }
</script>
