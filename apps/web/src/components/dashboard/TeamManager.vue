<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
    <!-- Header with Create Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      <div class="space-y-1">
        <h3 class="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
          <Users2 class="h-5 w-5 text-brand-cyan" />
          Gestão de Equipes
        </h3>
        <p class="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
          Crie e gerencie agrupamentos de vendedores
        </p>
      </div>

      <button v-if="['admin', 'head', 'coord'].includes(authStore.user?.type || '')" @click="showCreateModal = true"
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan hover:text-brand-deep transition-all duration-300 text-[10px] font-black uppercase tracking-wider group">
        <Plus class="h-4 w-4 group-hover:rotate-90 transition-transform duration-500" />
        Nova Equipe
      </button>
    </div>

    <!-- Teams Grid -->
    <div v-if="teamStore.loading && teamStore.teams.length === 0"
      class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 rounded-[2rem] bg-white/[0.02] border border-white/5 animate-pulse">
      </div>
    </div>

    <div v-else-if="teamStore.teams.length === 0"
      class="py-20 rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.01] flex flex-col items-center justify-center text-center space-y-4">
      <div class="p-4 rounded-2xl bg-white/5">
        <Users2 class="h-8 w-8 text-white/10" />
      </div>
      <p class="text-xs font-bold text-white/20 uppercase tracking-widest">Nenhuma equipe cadastrada ainda.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
      <div v-for="team in filteredTeams" :key="team.id"
        class="group relative p-8 rounded-[2.5rem] bg-brand-offset/50 border border-brand-glass-border hover:border-brand-cyan/30 transition-all duration-500 overflow-hidden flex flex-col gap-6">
        <!-- Abstract Background -->
        <div
          class="absolute -top-24 -right-24 w-48 h-48 bg-brand-cyan/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        </div>

        <div class="flex items-start justify-between relative z-10">
          <div class="flex items-center gap-4">
            <div
              class="h-16 w-16 rounded-2xl bg-brand-surface border border-brand-glass-border flex items-center justify-center shrink-0 overflow-hidden">
              <img v-if="team.photo_url" :src="team.photo_url" alt="Team Photo" class="w-full h-full object-cover" />
              <Users2 v-else class="h-8 w-8 text-brand-cyan/20" />
            </div>

            <div>
              <h4 class="text-lg font-black text-white tracking-tight">{{ team.name }}</h4>
              <p class="text-[10px] font-bold text-brand-cyan/60 uppercase tracking-widest">
                {{ team.sellers_sellers_team_idToteams?.length || 0 }} Membros
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button @click="handleEditTeam(team)"
              class="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-brand-cyan hover:bg-brand-cyan/10 hover:border-brand-cyan/20 transition-all">
              <Edit2 class="h-4 w-4" />
            </button>
            <button @click="handleDeleteTeam(team.id)"
              class="p-2 rounded-xl bg-white/5 border border-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 hover:border-red-400/20 transition-all">
              <Trash2 class="h-4 w-4" />
            </button>
          </div>
        </div>

        <p class="text-xs text-white/40 leading-relaxed min-h-[3em] line-clamp-2 relative z-10">
          {{ team.description || 'Sem descrição definida.' }}
        </p>

        <!-- Members List -->
        <div class="space-y-4 pt-6 border-t border-white/5 relative z-10">
          <div class="flex items-center justify-between">
            <span class="text-[9px] font-black text-white/20 uppercase tracking-[0.2em]">Membros da Equipe</span>
            <button @click="prepareAddMember(team)"
              class="text-[9px] font-black text-brand-cyan hover:text-white uppercase tracking-widest transition-colors flex items-center gap-1">
              <Plus class="h-3 w-3" />
              Adicionar
            </button>
          </div>

          <div class="flex flex-wrap gap-2">
            <div v-for="member in team.sellers_sellers_team_idToteams" :key="member.id"
              class="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-brand-surface border border-brand-glass-border group/member hover:border-brand-cyan/30 transition-all">
              <div
                class="h-5 w-5 rounded-full bg-brand-cyan/20 flex items-center justify-center text-[8px] font-black text-brand-cyan">
                {{ member.name?.[0] }}
              </div>
              <span class="text-[9px] font-bold text-white/60 group-hover/member:text-white">{{ member.name }}</span>
              <button @click="handleRemoveMember(team.id, member.id)"
                class="opacity-0 group-hover/member:opacity-100 transition-opacity hover:text-red-400 p-0.5">
                <X class="h-2.5 w-2.5" />
              </button>
            </div>
            <div v-if="!team.sellers_sellers_team_idToteams?.length"
              class="text-[9px] font-medium text-white/10 italic">
              Nenhum vendedor associado.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals (Create/Edit and Add Member) -->
    <!-- Form Modal -->
    <div v-if="showCreateModal || editingTeam" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl" @click="closeFormModal"></div>

      <div
        class="relative w-full max-w-xl bg-brand-offset border border-brand-glass-border rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-300">
        <div class="space-y-2">
          <h3 class="text-2xl font-black text-white tracking-tighter uppercase">
            {{ editingTeam ? 'Editar Equipe' : 'Nova Equipe' }}
          </h3>
          <p class="text-xs text-white/40 uppercase tracking-widest font-bold">
            Defina os detalhes fundamentais da equipe
          </p>
        </div>

        <div class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Photo Upload Area -->
            <div class="md:col-span-1 space-y-2">
              <label class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.2em] ml-1">
                Foto da Equipe
              </label>
              <div @click="(fileInput as any)?.click()" @dragover.prevent="dragOver = true"
                @dragleave.prevent="dragOver = false" @drop.prevent="handleDrop"
                class="relative aspect-square rounded-[2rem] bg-brand-surface border-2 border-dashed transition-all cursor-pointer overflow-hidden flex flex-col items-center justify-center group/upload"
                :class="[
                  dragOver ? 'border-brand-cyan bg-brand-cyan/5' : 'border-brand-glass-border',
                  form.photo_url
                    ? 'border-solid border-brand-cyan/30'
                    : 'hover:border-brand-cyan/50 hover:bg-brand-cyan/5',
                ]">
                <img v-if="form.photo_url" :src="form.photo_url"
                  class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/upload:scale-110" />

                <div v-if="!form.photo_url" class="relative z-10 flex flex-col items-center gap-2 text-center p-4">
                  <div
                    class="p-3 rounded-2xl bg-brand-cyan/10 text-brand-cyan group-hover/upload:scale-110 group-hover/upload:bg-brand-cyan group-hover/upload:text-brand-deep transition-all duration-500">
                    <Plus class="h-6 w-6" />
                  </div>
                  <p class="text-[8px] font-black text-white/20 uppercase tracking-widest leading-tight">
                    Solte a imagem ou clique
                  </p>
                </div>

                <!-- Overlay on hover if has image -->
                <div v-else
                  class="absolute inset-0 bg-brand-deep/60 backdrop-blur-sm opacity-0 group-hover/upload:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-2">
                  <Edit2 class="h-5 w-5" />
                  <span class="text-[8px] font-black uppercase tracking-widest">Alterar Foto</span>
                </div>

                <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange" />
              </div>
            </div>

            <div class="md:col-span-2 space-y-6">
              <div class="space-y-2">
                <label class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.2em] ml-1">
                  Nome da Equipe
                </label>
                <input v-model="form.name" type="text" placeholder="Ex: Guerreiros do Growth"
                  class="w-full px-6 py-4 rounded-2xl bg-brand-surface border border-brand-glass-border text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:bg-brand-cyan/5 transition-all" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-black text-brand-cyan/60 uppercase tracking-[0.2em] ml-1">
                  Descrição
                </label>
                <textarea v-model="form.description" rows="3"
                  placeholder="Ex: Os maiores odiadores de Churny da empresa."
                  class="w-full px-6 py-4 rounded-2xl bg-brand-surface border border-brand-glass-border text-sm text-white focus:outline-none focus:border-brand-cyan/50 focus:bg-brand-cyan/5 transition-all resize-none"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="closeFormModal"
            class="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-black uppercase text-white/40 hover:bg-white/10 hover:text-white transition-all">
            Cancelar
          </button>
          <button @click="saveTeam" :disabled="!form.name || teamStore.loading"
            class="flex-1 py-4 rounded-2xl bg-brand-cyan text-brand-deep shadow-xl shadow-brand-cyan/20 text-xs font-black uppercase hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {{ teamStore.loading ? 'Salvando...' : 'Salvar Equipe' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Delete Modal -->
    <ConfirmModal
      :is-open="confirmDeleteOpen"
      title="Excluir Equipe"
      message="Tem certeza que deseja excluir esta equipe? Esta ação não pode ser desfeita."
      confirm-text="Excluir"
      cancel-text="Cancelar"
      type="danger"
      @confirm="confirmDelete"
      @cancel="confirmDeleteOpen = false"
    />

    <!-- Add Member Modal -->
    <!-- Add Member Modal -->
    <div v-if="selectingTeamForMember" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-brand-deep/80 backdrop-blur-xl" @click="selectingTeamForMember = null"></div>

      <div
        class="relative w-full max-w-lg bg-brand-offset border border-brand-glass-border rounded-[2.5rem] shadow-2xl overflow-hidden p-10 space-y-8 animate-in zoom-in-95 duration-300">
        <div class="flex items-center justify-between">
          <div class="space-y-1">
            <h3 class="text-xl font-black text-white tracking-tighter uppercase">Adicionar Membros</h3>
            <p class="text-[10px] text-brand-cyan uppercase tracking-widest font-bold">
              {{ selectingTeamForMember.name }}
            </p>
          </div>
          <button @click="selectingTeamForMember = null" class="p-2 text-white/20 hover:text-white transition-colors">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
          <div v-for="seller in availableSellers" :key="seller.id"
            class="group p-4 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.03] transition-all duration-500 flex items-center justify-between relative overflow-hidden">
            <!-- Background detail -->
            <div
              class="absolute -right-4 -top-4 w-12 h-12 bg-brand-cyan/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity">
            </div>

            <div class="flex items-center gap-4 relative z-10">
              <div
                class="h-12 w-12 rounded-2xl bg-gradient-to-br from-brand-cyan/20 to-brand-blue/20 border border-brand-cyan/20 flex items-center justify-center text-brand-cyan font-black text-lg group-hover:scale-110 transition-transform duration-500">
                {{ seller.name?.[0] }}
              </div>
              <div>
                <p class="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                  {{ seller.name }}
                </p>
                <div class="flex items-center gap-2 mt-0.5">
                  <div class="h-1 w-1 rounded-full bg-brand-cyan/40"></div>
                  <p
                    class="text-[8px] text-white/40 uppercase font-black tracking-widest group-hover:text-white/60 transition-colors">
                    Disponível para equipe
                  </p>
                </div>
              </div>
            </div>

            <button @click="addMember(selectingTeamForMember!.id, seller.id!)"
              class="relative z-10 p-3 rounded-2xl bg-brand-cyan/10 text-brand-cyan hover:bg-brand-cyan hover:text-brand-deep transition-all duration-300 shadow-lg hover:shadow-brand-cyan/20 active:scale-90">
              <Plus class="h-5 w-5" />
            </button>
          </div>

          <div v-if="availableSellers.length === 0" class="text-center py-10 space-y-2">
            <p class="text-xs text-white/20 uppercase font-bold tracking-widest">Nenhum vendedor disponível</p>
            <p class="text-[9px] text-white/10 italic leading-relaxed uppercase">
              Todos os seus vendedores já estão em equipes ou ainda não foram criados.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Users2, Plus, Edit2, Trash2, X, Search, Settings2, Check } from '@lucide/vue'
import { useTeamStore, type Team } from '../../store/team'
import { useSellerStore } from '../../store/seller'
import { useAuthStore } from '../../store/auth'
import { useToast } from '../../composables/useToast'
import ConfirmModal from '../ui/ConfirmModal.vue'

const teamStore = useTeamStore()
const sellerStore = useSellerStore()
const authStore = useAuthStore()
const toast = useToast()

const showCreateModal = ref(false)
const editingTeam = ref<Team | null>(null)
const selectingTeamForMember = ref<Team | null>(null)
const confirmDeleteOpen = ref(false)
const teamToDelete = ref<number | null>(null)

const dragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const form = ref({
  name: '',
  description: '',
  photo_url: '',
})

onMounted(() => {
  teamStore.fetchTeams()
  sellerStore.fetchAllSellers()
})

const filteredTeams = computed(() => {
  const u = authStore.user
  if (!u) return []
  if (u.type === 'admin') return teamStore.teams

  // Se for Head de BU (head) ou Coordenador (coord)
  const myBUIds = (u as any).seller_business?.map((sb: any) => sb.business_id) || []

  return teamStore.teams.filter((team) => {
    // Verifica se a equipe tem membros que pertencem a uma das BUs do usuário
    const hasMembersInMyBUs = team.sellers_sellers_team_idToteams?.some((m: any) =>
      (m as any).seller_business?.some((sb: any) => myBUIds.includes(sb.business_id)),
    )

    // Ou se o Head da equipe é o próprio usuário (para o caso de Head de Equipe)
    const isLeadOfTeam = team.head_id?.toString() === u.id?.toString()

    return hasMembersInMyBUs || isLeadOfTeam
  })
})

const availableSellers = computed(() => {
  const u = authStore.user
  if (!u) return []

  // Se for Coordenador de Equipe
  if (u.type === 'coord') {
    return sellerStore.allSellers.filter(
      (s) =>
        (s.type === 'seller' || s.type === 'sdr') &&
        s.head_id?.toString() === u.id?.toString() &&
        !(s as any).team_id,
    )
  }

  // Se for Head de BU
  if (u.type === 'head') {
    const myBUIds = (u as any).seller_business?.map((sb: any) => sb.business_id) || []
    return sellerStore.allSellers.filter(
      (s) =>
        (s.type === 'seller' || s.type === 'sdr') &&
        (s as any).seller_business?.some((sb: any) => myBUIds.includes(sb.business_id)) &&
        !(s as any).team_id,
    )
  }

  // Admin vê todos sem equipe
  if (u.type === 'admin') {
    return sellerStore.allSellers.filter((s) => (s.type === 'seller' || s.type === 'sdr') && !(s as any).team_id)
  }

  return []
})

const closeFormModal = () => {
  showCreateModal.value = false
  editingTeam.value = null
  form.value = { name: '', description: '', photo_url: '' }
}

const handleFileChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}

const handleDrop = (e: DragEvent) => {
  dragOver.value = false
  const file = e.dataTransfer?.files[0]
  if (file) processFile(file)
}

const processFile = (file: File) => {
  if (!file.type.startsWith('image/')) {
    toast.error('Por favor, selecione um arquivo de imagem.')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 2MB.')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.photo_url = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

const handleEditTeam = (team: Team) => {
  editingTeam.value = team
  form.value = {
    name: team.name,
    description: team.description || '',
    photo_url: team.photo_url || '',
  }
}

const saveTeam = async () => {
  let res
  if (editingTeam.value) {
    res = await teamStore.updateTeam(editingTeam.value.id, form.value)
  } else {
    res = await teamStore.createTeam(form.value)
  }

  if (res.success) {
    toast.success(editingTeam.value ? 'Equipe atualizada!' : 'Equipe criada com sucesso!')
    closeFormModal()
  } else {
    const status = (res.error as any)?.response?.status
    const msg = (res.error as any)?.response?.data?.error
    if (status === 403) {
      toast.error(msg || 'Acesso negado. Você não tem permissão para esta ação.')
    } else {
      toast.error('Erro ao salvar equipe.')
    }
  }
}

const handleDeleteTeam = (id: number) => {
  teamToDelete.value = id
  confirmDeleteOpen.value = true
}

const confirmDelete = async () => {
  if (teamToDelete.value === null) return
  confirmDeleteOpen.value = false
  const res = await teamStore.deleteTeam(teamToDelete.value)
  teamToDelete.value = null
  if (res.success) {
    toast.success('Equipe removida.')
  } else {
    const status = (res.error as any)?.response?.status
    const msg = (res.error as any)?.response?.data?.error
    if (status === 403) {
      toast.error(msg || 'Acesso negado. Você não tem permissão para excluir esta equipe.')
    } else {
      toast.error('Erro ao remover equipe.')
    }
  }
}

const prepareAddMember = (team: Team) => {
  selectingTeamForMember.value = team
}

const addMember = async (teamId: number, sellerId: string) => {
  const res = await teamStore.addMember(teamId, sellerId)
  if (res.success) {
    toast.success('Vendedor adicionado!')
    await sellerStore.fetchAllSellers()
    selectingTeamForMember.value = teamStore.teams.find((t) => t.id === teamId) || null
  } else {
    const status = (res.error as any)?.response?.status
    const msg = (res.error as any)?.response?.data?.error
    if (status === 403) {
      toast.error(msg || 'Acesso negado. Você não tem permissão para adicionar este vendedor.')
    } else {
      toast.error('Erro ao adicionar vendedor.')
    }
  }
}

const handleRemoveMember = async (teamId: number, sellerId: string) => {
  const res = await teamStore.removeMember(teamId, sellerId)
  if (res.success) {
    toast.success('Membro removido da equipe.')
    await sellerStore.fetchAllSellers()
  } else {
    const status = (res.error as any)?.response?.status
    const msg = (res.error as any)?.response?.data?.error
    if (status === 403) {
      toast.error(msg || 'Acesso negado. Você não tem permissão para remover este membro.')
    } else {
      toast.error('Erro ao remover membro.')
    }
  }
}
</script>
