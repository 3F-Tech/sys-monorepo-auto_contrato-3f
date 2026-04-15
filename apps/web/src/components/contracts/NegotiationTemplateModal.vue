<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-md" @click="handleClose"></div>

      <div
        class="relative w-full max-w-4xl bg-brand-offset/90 border border-brand-glass-border rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 backdrop-blur-xl">

        <!-- Header -->
        <div class="flex items-center justify-between px-10 pt-10 pb-6 border-b border-white/5 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20">
              <ScrollText class="h-6 w-6 text-brand-cyan" />
            </div>
            <div>
              <h3 class="text-2xl font-black text-white tracking-tighter uppercase">
                {{ viewTitle }}
              </h3>
              <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">
                Modelos de Negociação
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <!-- Botão Novo (apenas na list view) -->
            <button v-if="view === 'list'" @click="openCreate"
              class="btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              <Plus class="h-4 w-4" />
              Novo Modelo
            </button>
            <!-- Voltar (em create/edit) -->
            <button v-if="view !== 'list'" @click="backToList"
              class="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white/40 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
              <ChevronLeft class="h-4 w-4" />
              Voltar
            </button>
            <button @click="handleClose" class="p-2 text-white/20 hover:text-white transition-colors">
              <X class="h-6 w-6" />
            </button>
          </div>
        </div>

        <!-- ===== LIST VIEW ===== -->
        <div v-if="view === 'list'" class="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar">
          <!-- Loading -->
          <div v-if="listLoading" class="flex items-center justify-center py-16 gap-3">
            <div class="h-5 w-5 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
            <span class="text-sm text-white/30">Carregando modelos...</span>
          </div>

          <!-- Vazio -->
          <div v-else-if="templates.length === 0"
            class="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <ScrollText class="h-10 w-10 text-white/10" />
            <p class="text-sm text-white/30">Nenhum modelo cadastrado ainda.</p>
            <p class="text-[11px] text-white/20">Clique em "Novo Modelo" para criar o primeiro.</p>
          </div>

          <!-- Lista de templates -->
          <div v-else class="space-y-4">
            <div v-for="tpl in templates" :key="tpl.id"
              class="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-brand-cyan/20 transition-all duration-300">
              <div class="flex items-start justify-between gap-4">
                <div class="flex-1 min-w-0 space-y-2">
                  <p class="text-sm font-black text-white uppercase tracking-wide truncate">{{ tpl.name }}</p>
                  <!-- Preview resumido do texto -->
                  <p class="text-[11px] text-white/30 leading-relaxed line-clamp-3 whitespace-pre-wrap">{{
                    tpl.caluse_template }}</p>
                  <p class="text-[9px] text-white/20 font-bold uppercase tracking-widest">
                    {{ tpl.num_max_item }} {{ Number(tpl.num_max_item) === 1 ? 'item variável' : 'itens variáveis' }}
                  </p>
                </div>
                <div class="flex flex-col gap-2 flex-shrink-0">
                  <button @click="openEdit(tpl)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-brand-cyan border border-white/10 hover:border-brand-cyan/30 bg-white/[0.02] hover:bg-brand-cyan/5 transition-all duration-300">
                    <Pencil class="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button @click="confirmDeleteTemplate(tpl)"
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-rose-400 border border-white/10 hover:border-rose-400/30 bg-white/[0.02] hover:bg-rose-400/5 transition-all duration-300">
                    <Trash2 class="h-3.5 w-3.5" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== CREATE / EDIT VIEW ===== -->
        <div v-else class="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar space-y-6">
          <!-- Seleção de Coordenador (Para Admin e Head) -->
          <div v-if="isAdminOrHead" class="space-y-2">
            <label class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Disponibilizar para
              Vendedores do Coordenador (Opcional)</label>
            <CustomSelect v-model="selectedCoordId" :options="coordOptions" placeholder="Nenhum (Disponível para Todos)"
              allow-clear />
            <p class="text-[9px] text-white/20 uppercase tracking-widest mt-1">
              Se deixar vazio, o modelo será público e ficará disponível para todos os vendedores do sistema.
            </p>
          </div>

          <!-- Nome do modelo -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Nome do modelo</label>
            <input v-model="templateName" type="text" placeholder="Ex: Fee Mensal Padrão" class="input-glass w-full" />
          </div>

          <!-- Toggle Ativo/Desativado (apenas no edit) -->
          <div v-if="view === 'edit'"
            class="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
            <div class="space-y-0.5">
              <p class="text-xs font-bold text-white uppercase tracking-wide">Status do modelo</p>
              <p class="text-[10px] text-white/30">
                {{ isActive ? 'Modelo visível para os vendedores' : 'Modelo oculto — não aparece nos formulários' }}
              </p>
            </div>
            <button @click="isActive = !isActive" type="button"
              class="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-300 ease-in-out focus:outline-none"
              :class="isActive ? 'bg-brand-cyan/20 border-brand-cyan/40' : 'bg-white/5 border-white/10'">
              <span
                class="pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg transform transition-all duration-300 ease-in-out mt-[1px]"
                :class="isActive ? 'translate-x-5 bg-brand-cyan' : 'translate-x-[2px] bg-white/30'" />
            </button>
          </div>

          <!-- Descrição para IA -->
          <div class="space-y-2">
            <label class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Descreva a negociação</label>
            <textarea v-model="description" rows="4"
              placeholder="Ex: Cliente paga entrada maior no primeiro mês e depois parcelas fixas menores, com taxa de implementação junto da entrada"
              class="input-glass w-full resize-none custom-scrollbar"></textarea>
          </div>

          <!-- Botão Gerar -->
          <button @click="handleGenerate" :disabled="aiLoading"
            class="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            <Loader2 v-if="aiLoading" class="h-4 w-4 animate-spin" />
            <Sparkles v-else class="h-4 w-4" />
            {{ aiLoading ? 'Gerando...' : 'Gerar com IA' }}
          </button>

          <div class="space-y-2">
            <div class="flex items-center gap-2">
              <label class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Cláusula gerada</label>
              
              <!-- Tooltip de Informação sobre Variáveis -->
              <div class="group/info relative cursor-help">
                <Info class="h-3 w-3 text-brand-cyan/40 group-hover/info:text-brand-cyan transition-colors" />
                <div class="absolute bottom-full left-0 mb-2 w-64 p-3 rounded-xl bg-brand-offset/95 backdrop-blur-xl border border-white/10 shadow-2xl opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible translate-y-2 group-hover/info:translate-y-0 transition-all duration-300 z-[70] pointer-events-none">
                  <div class="flex items-center gap-2 mb-1.5">
                    <div class="p-1 rounded-md bg-brand-cyan/10">
                      <Sparkles class="h-3 w-3 text-brand-cyan" />
                    </div>
                    <span class="text-[9px] font-black text-white uppercase tracking-widest">Variáveis Dinâmicas</span>
                  </div>
                  <p class="text-[9px] font-bold text-white/40 leading-relaxed uppercase tracking-tight" v-pre>
                    Use <code class="text-brand-cyan font-black">{{ variável }}</code> para criar campos que o vendedor preencherá. Ex: <span class="text-white/60">{{ valor_mensalidade }}</span>.
                  </p>
                </div>
              </div>
            </div>
            <textarea v-if="generatedText" v-model="generatedText" rows="12"
              class="input-glass w-full leading-relaxed resize-none custom-scrollbar"></textarea>
            <div v-else
              class="min-h-[120px] px-5 py-4 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-sm text-white/30 leading-relaxed">
              <div class="flex flex-col items-center justify-center h-full gap-2 py-4">
                <ScrollText class="h-8 w-8 text-white/10" />
                <span>O texto gerado pela IA aparecerá aqui. Você também pode escrever diretamente.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer (create/edit) -->
        <div v-if="view !== 'list'"
          class="flex items-center justify-end gap-3 px-10 py-6 border-t border-white/5 flex-shrink-0">
          <button @click="backToList"
            class="px-6 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
            Cancelar
          </button>
          <button @click="handleSave" :disabled="saving || !generatedText"
            class="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed">
            <Loader2 v-if="saving" class="h-4 w-4 animate-spin" />
            <Check v-else class="h-4 w-4" />
            {{ saving ? 'Salvando...' : (view === 'edit' ? 'Salvar alterações' : 'Criar modelo') }}
          </button>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <ConfirmModal :is-open="confirmDeleteOpen" title="Excluir Modelo"
        message="Tem certeza que deseja excluir este modelo de negociação? Esta ação não pode ser desfeita."
        confirm-text="Excluir" cancel-text="Cancelar" type="danger" :preserve-scroll="true" @confirm="handleDelete" @cancel="cancelDelete" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { X, Sparkles, ScrollText, Loader2, Check, Plus, ChevronLeft, Pencil, Trash2, Info } from '@lucide/vue'
import ConfirmModal from '../ui/ConfirmModal.vue'
import CustomSelect from '../ui/CustomSelect.vue'
import { useToast } from '../../composables/useToast'
import client from '../../api/client'
import { useSellerStore } from '../../store/seller'
import { useAuthStore } from '../../store/auth'

const props = defineProps<{ isOpen: boolean }>()
const emit = defineEmits<{ close: []; saved: [] }>()

const toast = useToast()
const sellerStore = useSellerStore()
const authStore = useAuthStore()

// Vista atual: 'list' | 'create' | 'edit'
const view = ref<'list' | 'create' | 'edit'>('list')

const viewTitle = computed(() => {
  if (view.value === 'create') return 'Novo Modelo'
  if (view.value === 'edit') return 'Editar Modelo'
  return 'Gerenciar Modelos'
})

// --- List state ---
const templates = ref<any[]>([])
const listLoading = ref(false)

// --- Form state (create/edit) ---
const editingId = ref<string | null>(null)
const templateName = ref('')
const description = ref('')
const generatedText = ref('')
const numItems = ref(0)
const aiLoading = ref(false)
const saving = ref(false)
const isActive = ref(true)
const confirmDeleteOpen = ref(false)
const deletingTemplate = ref<any>(null)
const selectedCoordId = ref<string | null>(null)

// --- Computed ---
const isAdminOrHead = computed(() => {
  return authStore.user?.type === 'admin' || authStore.user?.type === 'head'
})

const coordOptions = computed(() => {
  return sellerStore.allSellers
    .filter(s => s.type === 'coord')
    .map(s => ({
      value: s.id.toString(),
      label: s.name
    }))
})

// --- Actions ---
const fetchTemplates = async () => {
  listLoading.value = true
  try {
    const { data } = await client.get('/negotiation-templates')
    templates.value = data
  } catch {
    toast.error('Erro ao carregar modelos')
  } finally {
    listLoading.value = false
  }
}

const openCreate = () => {
  editingId.value = null
  templateName.value = ''
  description.value = ''
  generatedText.value = ''
  numItems.value = 0
  isActive.value = true
  selectedCoordId.value = null
  view.value = 'create'
}

const openEdit = (tpl: any) => {
  editingId.value = tpl.id
  templateName.value = tpl.name
  description.value = ''
  generatedText.value = tpl.caluse_template
  numItems.value = Number(tpl.num_max_item)
  isActive.value = tpl.is_active !== false
  selectedCoordId.value = null

  if (isAdminOrHead.value && tpl.created_by) {
    selectedCoordId.value = tpl.created_by.toString()
  }

  view.value = 'edit'
}

const backToList = () => {
  view.value = 'list'
}

const handleGenerate = async () => {
  if (!description.value.trim()) {
    toast.warning('Descreva a negociação antes de gerar')
    return
  }
  aiLoading.value = true
  try {
    const { data } = await client.post('/negotiation-templates/generate', {
      description: description.value.trim(),
    })
    generatedText.value = data.text
    numItems.value = data.numItems
    toast.success('Cláusula gerada com sucesso')
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erro ao gerar cláusula')
  } finally {
    aiLoading.value = false
  }
}

const handleSave = async () => {
  if (!templateName.value.trim()) {
    toast.warning('Informe o nome do modelo')
    return
  }
  if (!generatedText.value.trim()) {
    toast.warning('O texto da cláusula não pode estar vazio')
    return
  }

  saving.value = true
  try {
    const payload: any = {
      name: templateName.value.trim(),
      caluse_template: generatedText.value.trim(),
      num_max_item: numItems.value,
    }

    if (isAdminOrHead.value) {
      if (selectedCoordId.value) {
        payload.created_by = selectedCoordId.value
      } else {
        payload.created_by = null
      }
    }

    if (view.value === 'edit' && editingId.value) {
      payload.is_active = isActive.value
      await client.put(`/negotiation-templates/${editingId.value}`, payload)
      toast.success('Modelo atualizado com sucesso')
    } else {
      await client.post('/negotiation-templates', payload)
      toast.success('Modelo criado com sucesso')
    }

    emit('saved')
    await fetchTemplates()
    backToList()
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erro ao salvar modelo')
  } finally {
    saving.value = false
  }
}

const confirmDeleteTemplate = (tpl: any) => {
  deletingTemplate.value = tpl
  confirmDeleteOpen.value = true
}

const handleDelete = async () => {
  if (!deletingTemplate.value) return
  try {
    await client.patch(`/negotiation-templates/${deletingTemplate.value.id}/toggle`)
    toast.success('Modelo excluído com sucesso')
    await fetchTemplates()
  } catch (err: any) {
    toast.error(err.response?.data?.error || 'Erro ao excluir modelo')
  } finally {
    confirmDeleteOpen.value = false
    deletingTemplate.value = null
  }
}

const cancelDelete = () => {
  confirmDeleteOpen.value = false
}

const handleClose = () => {
  emit('close')
}

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      document.body.classList.add('overflow-hidden')
      document.documentElement.classList.add('overflow-hidden')
      const app = document.getElementById('app')
      if (app) app.classList.add('overflow-hidden', 'h-screen')

      view.value = 'list'
      if (isAdminOrHead.value) {
        sellerStore.fetchAllSellers()
      }
      fetchTemplates()
    } else {
      document.body.classList.remove('overflow-hidden')
      document.documentElement.classList.remove('overflow-hidden')
      const app = document.getElementById('app')
      if (app) app.classList.remove('overflow-hidden', 'h-screen')
      
      selectedCoordId.value = null
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  document.body.classList.remove('overflow-hidden')
  document.documentElement.classList.remove('overflow-hidden')
  const app = document.getElementById('app')
  if (app) app.classList.remove('overflow-hidden', 'h-screen')
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 212, 255, 0.1);
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 212, 255, 0.3);
}
</style>
