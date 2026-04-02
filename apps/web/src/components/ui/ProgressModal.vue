<script setup lang="ts">
  import { computed, ref, onUnmounted, watch } from 'vue'

  interface ProgressStep {
    status: 'processing' | 'completed' | 'error' | 'idle' | 'connected'
    progress: number
    step: string
    log?: string
    error?: string
  }

  const props = defineProps<{
    show: boolean
    trackingId: string | null
    serverUrl: string
  }>()

  const emit = defineEmits(['close', 'completed', 'error'])

  const currentStatus = ref<ProgressStep>({
    status: 'idle',
    progress: 0,
    step: 'Aguardando início...',
  })

  const logs = ref<string[]>([])
  const showSuccessMessage = ref(false)
  let eventSource: EventSource | null = null

  const statusColor = computed(() => {
    if (currentStatus.value.status === 'error') return 'text-red-400'
    if (currentStatus.value.status === 'completed') return 'text-brand-cyan'
    if (currentStatus.value.status === 'connected') return 'text-green-400'
    return 'text-brand-cyan'
  })

  const progressWidth = computed(() => `${currentStatus.value.progress}%`)

  const connectSSE = (id: string) => {
    if (eventSource) {
      eventSource.close()
    }

    const url = `${props.serverUrl}/contracts/progress/${id}`
    eventSource = new EventSource(url)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        currentStatus.value = data

        if (data.log) {
          logs.value.push(data.log)
        }

        if (data.status === 'completed') {
          showSuccessMessage.value = true
          emit('completed', data)

          // Timer de 5 segundos para visualização do sucesso
          setTimeout(() => {
            // O usuário tem a opção de fechar manualmente agora ou via fluxo do pai
          }, 5000)
        }

        if (data.status === 'error') {
          emit('error', data.error)
          eventSource?.close()
        }
      } catch (e) {
        console.error('Erro ao processar mensagem SSE:', e)
      }
    }

    eventSource.onerror = (err) => {
      console.error('Erro na conexão SSE:', err)
      // Só mostramos erro se não tiver finalizado com sucesso (resolvendo fechamento prematuro pela VPS)
      if (currentStatus.value.status !== 'completed') {
        currentStatus.value.status = 'error'
        currentStatus.value.error = 'Conexão com o servidor perdida.'
      }
      eventSource?.close()
    }
  }

  watch(
    () => props.show,
    (newVal) => {
      if (newVal) {
        document.body.style.overflow = 'hidden'
        if (props.trackingId) {
          logs.value = []
          showSuccessMessage.value = false
          currentStatus.value = {
            status: 'processing',
            progress: 0,
            step: 'Iniciando conexão...',
          }
          connectSSE(props.trackingId)
        }
      } else {
        document.body.style.overflow = ''
        if (eventSource) {
          eventSource.close()
          eventSource = null
        }
      }
    },
  )

  onUnmounted(() => {
    document.body.style.overflow = ''
    if (eventSource) {
      eventSource.close()
    }
  })

  const close = () => {
    if (currentStatus.value.status === 'completed' || currentStatus.value.status === 'error') {
      emit('close')
    }
  }

  const setError = (message: string) => {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    currentStatus.value = {
      status: 'error',
      progress: currentStatus.value.progress,
      step: 'Erro identificado',
      error: message,
    }
    logs.value.push(`❌ Erro crítico: ${message}`)
  }

  defineExpose({
    setError,
  })
</script>

<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-deep/80 backdrop-blur-sm">
      <div
        class="w-full max-w-xl bg-brand-offset/95 border border-brand-glass-border rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md"
      >
        <!-- Header -->
        <div class="p-6 border-b border-brand-glass-border">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-xl font-bold text-white tracking-tight">Processando Contrato</h3>
            <div
              :class="['text-xs font-mono uppercase tracking-widest px-2 py-1 rounded bg-brand-surface', statusColor]"
            >
              {{ currentStatus.status }}
            </div>
          </div>
          <p class="text-sm text-gray-400">{{ currentStatus.step }}</p>
        </div>

        <!-- Progress Bar Section -->
        <div class="p-6 space-y-4">
          <div class="relative h-2 w-full bg-brand-surface rounded-full overflow-hidden">
            <div
              class="absolute top-0 left-0 h-full bg-gradient-to-r from-brand-cyan to-brand-blue transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,212,255,0.5)]"
              :style="{ width: progressWidth }"
            ></div>
          </div>

          <div class="flex justify-between text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
            <span>Início</span>
            <span>{{ currentStatus.progress }}%</span>
            <span>Finalizado</span>
          </div>
        </div>

        <div class="px-6 pb-6 mt-2">
          <div
            class="bg-brand-deep/50 rounded-xl border border-brand-glass-border p-5 min-h-[160px] font-mono text-sm space-y-2"
          >
            <div
              v-if="showSuccessMessage"
              class="flex flex-col items-center justify-center py-4 space-y-3 animate-bounce-subtle"
            >
              <div class="p-3 bg-green-500/20 rounded-full">
                <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h4 class="text-xl font-bold text-green-400">Contrato gerado com Sucesso!</h4>
            </div>

            <div v-for="(log, index) in logs" :key="index" class="text-gray-400">
              <span class="text-brand-cyan mr-2">></span>
              {{ log }}
            </div>
            <div
              v-if="currentStatus.error"
              class="text-red-400 font-bold border-l-2 border-red-500 pl-3 py-1 bg-red-500/10"
            >
              <span class="mr-2">X</span>
              ERROR: {{ currentStatus.error }}
            </div>
            <div
              v-if="currentStatus.status === 'processing' && !showSuccessMessage"
              class="animate-pulse text-brand-cyan"
            >
              <span class="mr-2">_</span>
              aguardando próximo passo...
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-4 bg-brand-surface/20 flex justify-end gap-3">
          <button
            v-if="currentStatus.status === 'completed' || currentStatus.status === 'error'"
            @click="close"
            class="px-6 py-2 rounded-lg bg-brand-surface hover:bg-brand-surface/40 text-white text-sm font-medium transition-colors border border-brand-glass-border"
          >
            Fechar
          </button>
          <div v-else class="flex items-center gap-2 text-xs text-gray-500 px-4">
            <svg
              class="animate-spin h-4 w-4 text-brand-cyan"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processando... não feche esta janela
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }
  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  @keyframes bounce-subtle {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
  }
  .animate-bounce-subtle {
    animation: bounce-subtle 2s infinite ease-in-out;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.2);
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.4);
  }
</style>
