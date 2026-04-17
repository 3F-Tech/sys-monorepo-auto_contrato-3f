<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
      <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
        <DollarSign class="h-5 w-5" />
      </div>
      <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Valores e Pagamento</h3>
    </div>

    <!-- Seletor de Template de Negociação -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center justify-between">
        <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">MODELO DE NEGOCIAÇÃO</label>
        <button v-if="selectedTemplateId && parsedPlaceholders.length > 0" type="button"
          @click="showClausePreview = true"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white/40 hover:text-brand-cyan border border-white/10 hover:border-brand-cyan/30 bg-white/[0.02] hover:bg-brand-cyan/5 transition-all duration-300">
          <Eye class="h-3.5 w-3.5" />
          Visualizar Cláusula
        </button>
      </div>
      <div v-if="templatesLoading" class="flex items-center gap-2 text-white/30 text-xs py-4">
        <div class="h-4 w-4 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin"></div>
        Carregando modelos...
      </div>
      <template v-else>
        <p v-if="templates.length === 0" class="text-[10px] text-white/20">
          Nenhum modelo disponível. Use a cláusula personalizada abaixo.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button v-for="tpl in templates" :key="tpl.id" type="button" @click="selectTemplate(tpl)"
            class="flex flex-col items-start gap-1 p-4 rounded-xl border transition-all duration-200 text-left" :class="[
              selectedTemplateId === tpl.id
                ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)] ring-1 ring-brand-cyan/50'
                : 'bg-brand-surface border-brand-glass-border text-white/70 hover:border-brand-cyan/40 hover:text-white',
            ]">
            <span class="text-[11px] font-black uppercase tracking-wide">{{ tpl.name }}</span>
          </button>

          <button type="button" @click="selectCustomClause"
            class="flex items-start gap-2 p-4 rounded-xl border transition-all duration-200 text-left" :class="[
              showCustomClause
                ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_0_15px_rgba(0,212,255,0.15)] ring-1 ring-brand-cyan/50'
                : 'bg-brand-surface border-brand-glass-border text-white/70 hover:border-brand-cyan/40 hover:text-white',
            ]">
            <PenLine class="h-3.5 w-3.5" />
            <span class="text-[11px] font-black uppercase tracking-wide">Cláusula Personalizada</span>
          </button>
        </div>

        <transition enter-active-class="transition duration-300 ease-out"
          enter-from-class="transform -translate-y-2 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
          leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
          leave-to-class="transform -translate-y-2 opacity-0">
          <div v-if="showCustomClause" class="space-y-5 pt-4 border-t border-brand-glass-border">

            <!-- Etapa 1: descrição (antes de gerar) -->
            <template v-if="!aiClauseText && !aiGenerating">
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DESCREVA A NEGOCIAÇÃO</label>
                <textarea v-model="customDescription" rows="5" class="input-glass w-full resize-none leading-relaxed"
                  placeholder="Ex: cliente paga R$ 800 de implementação junto à primeira mensalidade, depois 12x de R$ 2.500, vencimento dia 10..." />
              </div>
              <p v-if="aiError" class="text-[11px] text-red-400 font-bold">{{ aiError }}</p>
              <button id="NEGOTIATION_AI_CLAUSE" type="button" @click="generateWithAI" :disabled="!customDescription.trim()"
                class="flex items-center gap-2 px-5 py-3 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan text-[11px] font-black uppercase tracking-wider hover:bg-brand-cyan/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                <Sparkles class="h-4 w-4" />
                Gerar com IA
              </button>
            </template>

            <!-- Loading -->
            <div v-if="aiGenerating" class="flex items-center gap-3 text-brand-cyan/60 text-xs py-2">
              <div class="h-4 w-4 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin flex-shrink-0"></div>
              Gerando cláusula personalizada...
            </div>

            <!-- Etapa 2: cláusula gerada -->
            <template v-if="aiClauseText && !aiGenerating">
              <!-- Texto read-only -->
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CLÁUSULA GERADA</label>
                <div class="px-4 py-4 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/60 leading-relaxed whitespace-pre-wrap select-none">{{ aiClauseText }}</div>
              </div>

              <!-- Ações -->
              <div class="flex flex-wrap gap-3 pt-1">
                <button type="button" @click="showEditRequest = !showEditRequest"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200 text-[11px] font-black uppercase tracking-wider"
                  :class="showEditRequest
                    ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                    : 'bg-white/[0.02] border-white/10 text-white/40 hover:border-brand-cyan/40 hover:text-white/70'">
                  <Sparkles class="h-3.5 w-3.5" />
                  Pedir edição à IA
                </button>
                <button type="button" @click="resetAIState"
                  class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.02] text-white/40 hover:border-red-500/40 hover:text-red-400 transition-all duration-200 text-[11px] font-black uppercase tracking-wider">
                  <RotateCcw class="h-3.5 w-3.5" />
                  Começar do zero
                </button>
              </div>

              <!-- Textarea de edição -->
              <transition enter-active-class="transition duration-200 ease-out"
                enter-from-class="-translate-y-1 opacity-0" enter-to-class="translate-y-0 opacity-100"
                leave-active-class="transition duration-150 ease-in" leave-from-class="translate-y-0 opacity-100"
                leave-to-class="-translate-y-1 opacity-0">
                <div v-if="showEditRequest" class="space-y-3">
                  <textarea v-model="aiEditRequest" rows="3" class="input-glass w-full resize-none leading-relaxed"
                    placeholder="Descreva o que deseja alterar na cláusula..." />
                  <p v-if="aiError" class="text-[11px] text-red-400 font-bold">{{ aiError }}</p>
                  <button type="button" @click="requestAIEdit" :disabled="!aiEditRequest.trim()"
                    class="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-cyan/30 bg-brand-cyan/10 text-brand-cyan text-[11px] font-black uppercase tracking-wider hover:bg-brand-cyan/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed">
                    <Send class="h-3.5 w-3.5" />
                    Enviar para IA
                  </button>
                </div>
              </transition>
            </template>

          </div>
        </transition>
      </template>
    </div>

    <!-- Campos Dinâmicos do Template -->
    <transition enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform -translate-y-4 opacity-0" enter-to-class="transform translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in" leave-from-class="transform translate-y-0 opacity-100"
      leave-to-class="transform -translate-y-4 opacity-0">
      <div v-if="selectedTemplateId && parsedPlaceholders.length > 0"
        class="space-y-6 pt-6 border-t border-brand-glass-border">

        <!-- Preview da cláusula (colapsável) -->
        <details class="group">
          <summary
            class="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-white/30 uppercase tracking-widest hover:text-white/50 transition-colors">
            <FileText class="h-3.5 w-3.5" />
            Preview da cláusula base
          </summary>
          <div
            class="mt-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-white/40 leading-relaxed whitespace-pre-wrap">
            {{ selectedTemplateText }}</div>
        </details>

        <!-- Taxa de Implementação (sempre presente) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR TAXA
              IMPLEMENTAÇÃO</label>
            <div class="relative">
              <span
                class="absolute left-4 h-full flex items-center text-brand-cyan/40 text-xs font-bold pointer-events-none">R$</span>
              <input type="text" v-model="form['VALOR TAXA IMPLEMENTACAO']" v-maska="{
                mask: '###.###.###,##',
                tokens: { '#': { pattern: /[0-9]/, repeated: true } },
                reversed: true,
              }" class="input-glass w-full !pl-10" placeholder="0,00" :class="[
                errors && errors['VALOR TAXA IMPLEMENTACAO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '',
              ]" />
              <span v-if="errors && errors['VALOR TAXA IMPLEMENTACAO']"
                class="text-[9px] text-red-500 font-bold mt-1 block">
                {{ errors['VALOR TAXA IMPLEMENTACAO'] }}
              </span>
            </div>
          </div>
        </div>

        <!-- Inputs dinâmicos gerados a partir dos placeholders -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="ph in parsedPlaceholders" :key="ph.key" class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">{{ ph.label }}</label>

            <!-- valor_ → R$ mascarado -->
            <div v-if="ph.type === 'currency'" class="relative">
              <span
                class="absolute left-4 h-full flex items-center text-brand-cyan/40 text-xs font-bold pointer-events-none">R$</span>
              <input type="text" v-model="placeholderValues[ph.key]" v-maska="{
                mask: '###.###.###,##',
                tokens: { '#': { pattern: /[0-9]/, repeated: true } },
                reversed: true,
              }" class="input-glass w-full !pl-10" placeholder="0,00" />
            </div>

            <!-- data_ → máscara DD/MM/AAAA -->
            <input v-else-if="ph.type === 'date'" type="text" v-model="placeholderValues[ph.key]" v-maska="'##/##/####'"
              class="input-glass w-full" placeholder="DD/MM/AAAA" />

            <!-- qtd_ ou dia_ → número inteiro -->
            <input v-else-if="ph.type === 'integer'" type="number" v-model="placeholderValues[ph.key]" min="1"
              class="input-glass w-full" :placeholder="ph.key.startsWith('dia_') ? 'Ex: 10' : 'Ex: 3'" />

            <!-- fallback → texto livre -->
            <input v-else type="text" v-model="placeholderValues[ph.key]" class="input-glass w-full"
              placeholder="Preencher" />
          </div>
        </div>

      </div>
    </transition>

    <!-- Modal: Preview da Cláusula Renderizada -->
    <div v-if="showClausePreview" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-md" @click="showClausePreview = false"></div>
      <div
        class="relative w-full max-w-3xl bg-brand-offset/90 border border-brand-glass-border rounded-[2.5rem] shadow-3xl overflow-hidden flex flex-col max-h-[80vh] backdrop-blur-xl">
        <!-- Header -->
        <div class="flex items-center justify-between px-10 pt-8 pb-5 border-b border-white/5 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-2xl bg-brand-cyan/10 border border-brand-cyan/20">
              <Eye class="h-5 w-5 text-brand-cyan" />
            </div>
            <div>
              <h3 class="text-lg font-black text-white tracking-tighter uppercase">Preview da Cláusula</h3>
              <p class="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Visualização com valores
                preenchidos</p>
            </div>
          </div>
          <button @click="showClausePreview = false" class="p-2 text-white/20 hover:text-white transition-colors">
            <X class="h-6 w-6" />
          </button>
        </div>
        <!-- Body -->
        <div class="flex-1 overflow-y-auto px-10 py-6 custom-scrollbar text-left font-sans">
          <p class="text-base font-black text-white uppercase tracking-wide mb-4">CLÁUSULA {{ clauseNumber }} – DA
            REMUNERAÇÃO</p>
          <div class="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">{{ renderedClause }}</div>
        </div>
        <!-- Footer -->
        <div class="flex items-center justify-end px-10 py-5 border-t border-white/5 flex-shrink-0">
          <button @click="showClausePreview = false"
            class="px-6 py-3 rounded-xl text-sm font-bold text-white/40 hover:text-white bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
            Fechar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import client from '../../api/client'
import { DollarSign, FileText, Eye, X, PenLine, Sparkles, RotateCcw, Send } from '@lucide/vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
  clauseNumber: {
    type: Number,
    default: 4,
  },
  fixedBoilerplate: {
    type: Array as () => string[],
    default: () => [
      'A CONTRATADA emitirá a Nota Fiscal de Serviços correspondente ao valor mensal contratado no primeiro dia útil de cada mês, encaminhando-a à CONTRATANTE juntamente com o boleto bancário ou outro meio de pagamento acordado, com antecedência mínima de 5 (cinco) dias da data de vencimento.',
      'Os valores contratados incluem todos os tributos, encargos e despesas incidentes sobre os serviços prestados, não sendo devidos valores adicionais pela CONTRATANTE, salvo na hipótese de serviços extraordinários ou aditivos contratuais formalmente acordados entre as partes.',
      'O atraso superior a 15 (quinze) dias no pagamento de qualquer parcela autoriza a CONTRATADA a suspender a execução dos serviços, que somente será retomada após a regularização integral do débito.',
      'O pagamento pontual constitui condição essencial para a manutenção dos prazos, rotinas de entrega e continuidade dos serviços contratados.',
    ]
  }
})

// Mapeamento padrão de placeholders para campos do banco (padrão 3F)
// Múltiplos placeholders podem mapear para o mesmo campo do form
const PLACEHOLDER_TO_FORM: Record<string, string> = {
  'data_primeiro_pagamento': 'DATA PRIMEIRO PAGAMENTO',
  'valor_mensalidade': 'VALOR MENSALIDADE',
  'valor_primeiro_pagamento': 'VALOR DO PRIMEIRO PAGAMENTO',
  'valor_pagamento_unico': 'VALOR DO PRIMEIRO PAGAMENTO',
  'valor_entrada': 'VALOR DO PRIMEIRO PAGAMENTO',
  'valor_a_vista': 'VALOR DO PRIMEIRO PAGAMENTO',
  'valor_parcela_unica': 'VALOR DO PRIMEIRO PAGAMENTO',
  'dia_vencimento_mensal': 'DIA VENCIMENTO MENSAL',
  'valor_parcela_inicial': 'VALOR DO PRIMEIRO PAGAMENTO',
  'valor_parcela_subsequente': 'VALOR MENSALIDADE',
}

const templates = ref<any[]>([])
const templatesLoading = ref(false)
const selectedTemplateId = ref<string | null>(null)
const placeholderValues = ref<Record<string, string>>({})
const showClausePreview = ref(false)
const showCustomClause = ref(false)
const customDescription = ref('')
const aiGenerating = ref(false)
const aiClauseText = ref('')
const aiClauseNumItems = ref(0)
const aiEditRequest = ref('')
const showEditRequest = ref(false)
const aiError = ref('')

watch(showClausePreview, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

const selectedTemplateText = computed(() => {
  if (!selectedTemplateId.value) return ''
  const tpl = templates.value.find((t) => t.id === selectedTemplateId.value)
  return tpl?.caluse_template || ''
})

const selectedTemplateNumItems = computed(() => {
  if (!selectedTemplateId.value) return 0
  const tpl = templates.value.find((t) => t.id === selectedTemplateId.value)
  return Number(tpl?.num_max_item || 0)
})

const parsedPlaceholders = computed(() => {
  if (!selectedTemplateText.value) return []
  const regex = /\{\{\s*(\w+)\s*\}\}/g
  const found = new Set<string>()
  let match: RegExpExecArray | null
  while ((match = regex.exec(selectedTemplateText.value)) !== null) {
    found.add(match[1])
  }
  found.delete('valor_taxa_implementacao')

  return Array.from(found).map((key) => {
    const label = key.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    let type: 'currency' | 'date' | 'integer' | 'text' = 'text'
    if (key.startsWith('valor_')) type = 'currency'
    else if (key.startsWith('data_')) type = 'date'
    else if (key.startsWith('qtd_') || key.startsWith('dia_')) type = 'integer'
    return { key, label, type }
  })
})

const renderedClause = computed(() => {
  if (!selectedTemplateText.value) return ''
  let variablePart = selectedTemplateText.value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match: string, key: string) => {
    if (key === 'valor_taxa_implementacao') {
      const val = props.form['VALOR TAXA IMPLEMENTACAO']
      return val ? `R$ ${val}` : `{{${key}}}`
    }
    const val = placeholderValues.value[key]
    if (!val) return `{{${key}}}`
    if (key.startsWith('valor_')) return `R$ ${val}`
    return val
  })

  // Templates da IA sempre geram com "4.X" — renumera para a cláusula correta
  if (props.clauseNumber !== 4) {
    variablePart = variablePart.replace(/\b4\./g, `${props.clauseNumber}.`)
  }

  const startNum = selectedTemplateNumItems.value + 1
  const fixedPart = props.fixedBoilerplate
    .map((text, i) => `${props.clauseNumber}.${startNum + i}. ${text}`)
    .join('\n')

  const full = `${variablePart}\n${fixedPart}`
  return full.replace(/\n{2,}/g, '\n')
})

const aiRenderedClause = computed(() => {
  if (!aiClauseText.value) return ''
  let variablePart = aiClauseText.value
  if (props.clauseNumber !== 4) {
    variablePart = variablePart.replace(/\b4\./g, `${props.clauseNumber}.`)
  }
  const startNum = aiClauseNumItems.value + 1
  const fixedPart = props.fixedBoilerplate
    .map((text, i) => `${props.clauseNumber}.${startNum + i}. ${text}`)
    .join('\n')
  return `${variablePart}\n${fixedPart}`.replace(/\n{2,}/g, '\n')
})

// Sincronização
watch(renderedClause, (val) => {
  if (!showCustomClause.value) props.form['NEGOTIATION_RENDERED_CLAUSE'] = val
})

watch(aiRenderedClause, (val) => {
  if (showCustomClause.value) props.form['NEGOTIATION_RENDERED_CLAUSE'] = val
})

watch(placeholderValues, (vals) => {
  for (const [placeholder, formKey] of Object.entries(PLACEHOLDER_TO_FORM)) {
    if (vals[placeholder] !== undefined && vals[placeholder] !== '') {
      props.form[formKey] = vals[placeholder]
    }
  }
}, { deep: true })

const resetAIState = () => {
  aiClauseText.value = ''
  aiClauseNumItems.value = 0
  customDescription.value = ''
  aiEditRequest.value = ''
  showEditRequest.value = false
  aiError.value = ''
  props.form['NEGOTIATION_AI_PROMPT'] = null
  props.form['NEGOTIATION_RENDERED_CLAUSE'] = ''
}

const selectTemplate = (tpl: any) => {
  selectedTemplateId.value = tpl.id
  placeholderValues.value = {}
  props.form['NEGOTIATION_TEMPLATE_ID'] = tpl.id
  props.form['NEGOTIATION_TEMPLATE_NAME'] = tpl.name
  props.form['NEGOTIATION_CLAUSE_MODE'] = null
  if (showCustomClause.value) {
    showCustomClause.value = false
    resetAIState()
  }
}

const selectCustomClause = () => {
  showCustomClause.value = !showCustomClause.value
  if (showCustomClause.value) {
    selectedTemplateId.value = null
    placeholderValues.value = {}
    props.form['NEGOTIATION_TEMPLATE_ID'] = null
    props.form['NEGOTIATION_TEMPLATE_NAME'] = null
    props.form['NEGOTIATION_CLAUSE_MODE'] = 'custom'
  } else {
    props.form['NEGOTIATION_CLAUSE_MODE'] = null
    resetAIState()
  }
}

const callGenerateAPI = async (description: string) => {
  const { data } = await client.post('/negotiation-templates/generate-custom', { description })
  aiClauseText.value = data.text
  aiClauseNumItems.value = data.numItems
  props.form['NEGOTIATION_AI_PROMPT'] = data.text
}

const generateWithAI = async () => {
  if (!customDescription.value.trim()) return
  aiGenerating.value = true
  aiError.value = ''
  try {
    await callGenerateAPI(customDescription.value.trim())
  } catch (err) {
    aiError.value = 'Erro ao gerar cláusula. Tente novamente.'
    console.error('[CUSTOM CLAUSE] Erro ao gerar:', err)
  } finally {
    aiGenerating.value = false
  }
}

const requestAIEdit = async () => {
  if (!aiEditRequest.value.trim()) return
  aiGenerating.value = true
  aiError.value = ''
  try {
    const composed = `[Cláusula atual]\n${aiClauseText.value}\n\n[Solicito a seguinte alteração]\n${aiEditRequest.value.trim()}`
    await callGenerateAPI(composed)
    aiEditRequest.value = ''
    showEditRequest.value = false
  } catch (err) {
    aiError.value = 'Erro ao editar cláusula. Tente novamente.'
    console.error('[CUSTOM CLAUSE] Erro ao editar:', err)
  } finally {
    aiGenerating.value = false
  }
}

const fetchTemplates = async () => {
  templatesLoading.value = true
  try {
    const { data } = await client.get('/negotiation-templates')
    templates.value = data
  } catch (err) {
    console.error('[NEGOTIATION] Erro ao buscar modelos:', err)
  } finally {
    templatesLoading.value = false
  }
}

onMounted(fetchTemplates)
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
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
