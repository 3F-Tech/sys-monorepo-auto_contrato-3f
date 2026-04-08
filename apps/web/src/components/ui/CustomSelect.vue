<template>
  <div class="relative group/custom-select w-full" ref="container">
    <div
      v-if="icon || selectedOptionImage"
      class="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none"
    >
      <img
        v-if="selectedOptionImage"
        :src="selectedOptionImage"
        class="h-5 w-5 rounded-md object-cover border border-white/10"
      />
      <component
        v-else
        :is="icon"
        class="h-3.5 w-3.5 text-white/20 group-hover/custom-select:text-brand-cyan transition-colors"
      />
    </div>

    <div
      v-if="!searchable"
      @click="toggleDropdown"
      :class="[
        'w-full backdrop-blur-xl border border-brand-glass-border text-white cursor-pointer transition-all shadow-xl flex items-center justify-between',
        variant === 'form'
          ? 'bg-brand-surface py-3 px-4 rounded-xl hover:border-brand-cyan/40 text-sm font-medium'
          : 'bg-brand-offset/40 py-2.5 px-4 rounded-2xl hover:border-brand-cyan/30 text-[10px] font-black uppercase tracking-widest',
        (icon || selectedOptionImage) ? 'pl-11' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'pr-10',
      ]"
    >
      <span class="truncate">{{ selectedOptionLabel || placeholder }}</span>
    </div>

    <input
      v-else
      type="text"
      v-model="searchQuery"
      @focus="isOpen = true"
      @click="isOpen = true"
      :placeholder="selectedOptionLabel || placeholder"
      :disabled="disabled"
      :class="[
        'w-full backdrop-blur-xl border border-brand-glass-border text-white focus:outline-none transition-all shadow-xl',
        variant === 'form'
          ? 'bg-brand-surface py-3 px-4 rounded-xl focus:border-brand-cyan/40 placeholder:text-white/20 text-sm font-medium'
          : 'bg-brand-offset/40 py-2.5 px-4 rounded-2xl focus:text-brand-cyan focus:border-brand-cyan/50 placeholder:text-white/60 text-[10px] font-black uppercase tracking-widest',
        (icon || selectedOptionImage) ? 'pl-11' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : 'pr-10',
      ]"
    />

    <!-- Seta e botão de limpar -->
    <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20 pointer-events-none">
      <button
        v-if="allowClear && modelValue && !disabled"
        @click.stop="clearSelection"
        class="hover:text-red-400 transition-colors mr-1 pointer-events-auto"
      >
        <X class="h-3 w-3 text-white/20 hover:text-red-400" />
      </button>
      <ChevronDown
        :class="[
          'h-4 w-4 text-white/20 group-hover/custom-select:text-brand-cyan transition-transform duration-300',
          isOpen ? 'rotate-180' : '',
        ]"
      />
    </div>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0 -translate-y-2"
      enter-to-class="transform scale-100 opacity-100 translate-y-0"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-100 translate-y-0"
      leave-to-class="transform scale-95 opacity-0 -translate-y-2"
    >
      <div
        v-if="isOpen"
        :class="[
          'absolute left-0 right-0 py-2 bg-brand-offset/95 backdrop-blur-2xl border border-brand-glass-border rounded-2xl shadow-2xl z-[100] max-h-64 overflow-y-auto custom-scrollbar overscroll-contain',
          (forceUp || (shouldOpenUp && !forceDown)) ? 'bottom-full mb-2' : 'top-full mt-2'
        ]"
      >
        <div
          v-for="option in filteredOptions"
          :key="option.value"
          @click="selectOption(option)"
          :class="[
            'px-4 py-2 cursor-pointer transition-colors flex items-center justify-between',
            variant === 'form' ? 'text-xs font-semibold' : 'text-[10px] font-bold uppercase tracking-widest',
            modelValue === option.value
              ? 'text-brand-cyan bg-brand-cyan/5'
              : 'text-white/60 hover:text-white hover:bg-white/5',
          ]"
        >
          <span class="flex items-center gap-2.5">
            <img
              v-if="option.image"
              :src="option.image"
              class="h-5 w-5 rounded-md object-cover border border-white/5"
            />
            <component :is="option.icon" v-else-if="option.icon" class="h-3 w-3" />
            {{ option.label }}
          </span>
          <Check v-if="modelValue === option.value" class="h-3 w-3" />
        </div>

        <div v-if="filteredOptions.length === 0" class="px-4 py-8 text-center">
          <p class="text-[10px] font-bold text-white/20 uppercase tracking-widest">Nenhum resultado encontrado</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onUnmounted } from 'vue'
  import { ChevronDown, Check, X } from '@lucide/vue'

  interface Option {
    label: string
    value: any
    icon?: any
    image?: string
  }

  const props = defineProps<{
    modelValue: any
    options: Option[]
    placeholder?: string
    icon?: any
    searchable?: boolean
    disabled?: boolean
    allowClear?: boolean
    variant?: 'default' | 'form'
    forceUp?: boolean
    forceDown?: boolean
  }>()

  const emit = defineEmits(['update:modelValue', 'change'])

  const container = ref<HTMLElement | null>(null)
  const isOpen = ref(false)
  const searchQuery = ref('')
  const shouldOpenUp = ref(false)

  const toggleDropdown = () => {
    if (props.disabled) return
    if (!isOpen.value) {
      checkDirection()
    }
    isOpen.value = !isOpen.value
  }

  const checkDirection = () => {
    if (!container.value) return
    const rect = container.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const hasSpaceBelow = spaceBelow > 300 // aprox dropdown height
    shouldOpenUp.value = !hasSpaceBelow
  }

  const selectOption = (option: Option) => {
    emit('update:modelValue', option.value)
    emit('change', option.value)
    isOpen.value = false
    searchQuery.value = ''
  }

  const clearSelection = () => {
    emit('update:modelValue', null)
    emit('change', null)
    searchQuery.value = ''
  }

  const selectedOptionLabel = computed(() => {
    const option = props.options.find((o) => o.value === props.modelValue)
    // Se for a opção de "todas" (value: ''), não mostramos o label no input, forçando o placeholder
    if (!option || (option.value === '' && props.searchable)) return ''
    return option.label
  })

  const selectedOptionImage = computed(() => {
    const option = props.options.find((o) => o.value === props.modelValue)
    return option?.image || null
  })

  const filteredOptions = computed(() => {
    if (!props.searchable || !searchQuery.value) return props.options
    const q = searchQuery.value.toLowerCase()
    return props.options.filter((o) => o.label.toLowerCase().includes(q))
  })

  const handleClickOutside = (event: MouseEvent) => {
    if (container.value && !container.value.contains(event.target as Node)) {
      isOpen.value = false
    }
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
  })

  onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
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
    @apply bg-white/10 rounded-full;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-white/20;
  }
</style>
