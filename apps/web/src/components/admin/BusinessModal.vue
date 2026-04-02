<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-brand-deep/80 backdrop-blur-sm" @click="close"></div>

    <!-- Modal Content -->
    <div
      class="relative w-full max-w-md bg-brand-offset border border-brand-glass-border rounded-3xl p-8 shadow-2xl overflow-hidden group"
    >
      <!-- Decoration -->
      <div
        class="absolute -top-24 -right-24 h-48 w-48 bg-brand-cyan/5 rounded-full blur-3xl group-hover:bg-brand-cyan/10 transition-all"
      ></div>

      <div class="relative z-10 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-xl font-bold flex items-center gap-2">
            <PlusCircle v-if="!business" class="h-5 w-5 text-brand-cyan" />
            <Edit3 v-else class="h-5 w-5 text-brand-cyan" />
            {{ business ? 'Editar Empresa' : 'Nova Empresa' }}
          </h3>
          <button @click="close" class="p-2 rounded-lg hover:bg-white/5 transition-colors">
            <X class="h-5 w-5 text-white/40" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Logo Upload -->
          <div class="flex flex-col items-center justify-center space-y-3 pb-4 border-b border-white/5">
            <div class="relative group/logo">
              <div
                :style="{ borderColor: form.color }"
                class="h-24 w-24 rounded-2xl bg-brand-surface border-2 flex items-center justify-center overflow-hidden transition-all shadow-xl shadow-black/20"
              >
                <img v-if="form.img_base64" :src="form.img_base64" class="h-full w-full object-cover" />
                <Building2
                  v-else
                  class="h-10 w-10 text-white/10"
                  :style="{ color: !form.img_base64 ? form.color + '20' : '' }"
                />

                <div
                  class="absolute inset-0 bg-black/60 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                  @click="triggerFileUpload"
                >
                  <Camera class="h-6 w-6 text-white" />
                </div>
              </div>
              <button
                type="button"
                @click="triggerFileUpload"
                class="absolute -bottom-2 -right-2 p-2 rounded-xl bg-brand-cyan text-brand-deep shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Upload class="h-3.5 w-3.5" />
              </button>
              <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="handleFileChange" />
            </div>
            <p class="text-[9px] text-white/40 uppercase tracking-widest font-bold">Logo da Empresa (PNG/JPG)</p>
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Nome da Empresa</label>
            <input
              v-model="form.name"
              type="text"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="Ex: 3F Venture"
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">CNPJ</label>
            <input
              v-model="form.cnpj"
              type="text"
              v-maska="'##.###.###/####-##'"
              class="w-full bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-3 text-sm text-white focus:border-brand-cyan/40 focus:outline-none transition-all"
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div class="grid grid-cols-1 gap-4">
            <div class="space-y-1.5">
              <label class="text-[10px] font-semibold text-brand-cyan uppercase tracking-widest">Cor Principal</label>
              <div class="flex gap-2">
                <input
                  v-model="form.color"
                  type="color"
                  class="h-11 w-11 bg-brand-surface border border-brand-glass-border rounded-xl p-1 cursor-pointer"
                />
                <input
                  v-model="form.color"
                  type="text"
                  class="flex-1 bg-brand-surface border border-brand-glass-border rounded-xl px-4 py-2.5 text-xs text-white uppercase focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div class="pt-4 flex gap-3">
            <button
              type="button"
              @click="close"
              class="flex-1 px-4 py-3 rounded-xl bg-brand-surface border border-brand-glass-border text-xs font-bold hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-brand-cyan to-brand-blue text-brand-deep text-xs font-bold hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              <Loader2 v-if="loading" class="h-4 w-4 animate-spin" />
              {{ loading ? 'Salvando...' : 'Salvar Empresa' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onBeforeUnmount } from 'vue'
  import { PlusCircle, Edit3, X, Loader2, Camera, Upload, Building2 } from '@lucide/vue'
  import type { Business } from '../../gen/types/Business'
  import { postBusiness } from '../../gen/hooks/postBusiness'
  import { putBusinessId } from '../../gen/hooks/putBusinessId'
  import client from '../../api/client'
  import { useToast } from '../../composables/useToast'

  const props = defineProps<{
    isOpen: boolean
    business: Business | null
  }>()

  const emit = defineEmits(['close', 'saved'])

  const toast = useToast()
  const loading = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const form = ref({
    name: '',
    cnpj: '',
    color: '#00d4ff',
    img_base64: '' as string | null,
  })

  const triggerFileUpload = () => fileInput.value?.click()

  const handleFileChange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        form.value.img_base64 = reader.result as string
      }
      reader.readAsDataURL(file)
    }
  }

  watch(
    () => props.isOpen,
    (newVal) => {
      if (newVal) {
        if (props.business) {
          form.value = {
            name: props.business.name || '',
            cnpj: props.business.cnpj || '',
            color: props.business.color || '#00d4ff',
            img_base64: props.business.img_base64 as any,
          }
        } else {
          form.value = {
            name: '',
            cnpj: '',
            color: '#00d4ff',
            img_base64: null,
          }
        }
      }
    },
  )

  const close = () => emit('close')

  // Disable body scroll when modal opens, enable when closes
  watch(
    () => props.isOpen,
    (isOpen) => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = ''
      }
    },
  )

  const handleSubmit = async () => {
    // Validação de campos obrigatórios
    if (!form.value.name?.trim()) {
      toast.error('Por favor, insira o nome da empresa.')
      return
    }
    const cnpjClean = (form.value.cnpj || '').replace(/\D/g, '')
    if (!cnpjClean) {
      toast.error('Por favor, insira o CNPJ.')
      return
    }
    if (cnpjClean.length !== 14) {
      toast.error('CNPJ incompleto. O CNPJ deve ter 14 dígitos.')
      return
    }

    loading.value = true
    try {
      if (props.business) {
        // Update
        await putBusinessId(props.business.id as any, { data: form.value as any }, { client })
      } else {
        // Create
        await postBusiness({ data: form.value as any }, { client })
      }
      toast.success(props.business ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!')
      emit('saved')
      close()
    } catch (error) {
      console.error('Falha ao salvar empresa:', error)
      toast.error('Erro ao salvar empresa. Verifique os dados.')
    } finally {
      loading.value = false
    }
  }
</script>
