<template>
  <div class="space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
      <div class="flex items-center gap-4">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <FileStack class="h-5 w-5 text-brand-cyan" />
          Gerenciar Contratos
        </h3>

        <button v-if="isLeadership" @click="showAlertsOnly = !showAlertsOnly"
          :class="['px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border flex items-center gap-2',
            showAlertsOnly ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 shadow-sm' : 'bg-brand-surface border-brand-glass-border text-white/40 hover:text-white']">
          <AlertCircle class="h-3 w-3" />
          Avisos Pendentes
        </button>

        <div class="h-8 w-px bg-white/5 mx-1 hidden md:block"></div>

        <div class="flex items-center gap-1 p-1 bg-black/20 border border-brand-glass-border rounded-xl">
          <button v-for="opt in signedFilterOptions" :key="opt.value"
            @click="signedFilter = opt.value"
            :class="['px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all',
              signedFilter === opt.value 
                ? 'bg-brand-cyan text-brand-deep shadow-lg shadow-brand-cyan/20' 
                : 'text-white/30 hover:text-white/60']">
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Search Input -->
      <div class="relative group w-full md:w-80">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20 group-focus-within:text-brand-cyan transition-colors" />
        <input v-model="searchQuery" type="text" placeholder="Buscar contratante ou plano..."
          class="w-full pl-10 pr-4 py-2 rounded-xl bg-brand-surface border border-brand-glass-border text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan/50 transition-all shadow-lg" />
      </div>
    </div>

    <!-- Loading State (Skeleton) -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 3" :key="i" 
        class="p-5 rounded-2xl bg-brand-surface/30 border border-brand-glass-border animate-pulse flex items-center justify-between relative overflow-hidden"
      >
        <!-- Shimmer gradient overlay -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-shimmer"></div>
        
        <div class="flex items-center gap-4 relative z-10">
          <div class="h-10 w-10 rounded-xl bg-white/5 border border-white/10"></div>
          <div class="space-y-2">
            <div class="h-4 w-56 bg-white/10 rounded-md"></div>
            <div class="h-3 w-40 bg-white/5 rounded-md"></div>
          </div>
        </div>
        <div class="flex items-center gap-8 relative z-10">
          <div class="hidden lg:flex flex-col items-end gap-2">
            <div class="h-2 w-20 bg-white/5 rounded"></div>
            <div class="h-6 w-28 bg-white/10 rounded-full"></div>
          </div>
          <div class="hidden md:flex flex-col items-end gap-2">
            <div class="h-2 w-16 bg-white/5 rounded"></div>
            <div class="h-4 w-24 bg-white/10 rounded"></div>
          </div>
          <div class="h-10 w-10 rounded-xl bg-white/5 border border-white/10"></div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredContracts.length === 0"
      class="p-12 rounded-2xl bg-brand-offset/30 border border-brand-glass-border border-dashed text-center space-y-3">
      <FileX2 class="h-10 w-10 text-white/10 mx-auto" />
      <p class="text-white/40 text-sm">Nenhum contrato encontrado.</p>
    </div>

    <div v-else class="space-y-3">
      <div v-for="contract in paginatedContracts" :key="contract.id?.toString()"
        :class="['group bg-brand-offset border rounded-xl transition-all overflow-hidden shadow-sm',
          contract.signed ? 'border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:border-green-400' : 'border-brand-glass-border hover:border-brand-cyan/30']">

        <!-- Header / Summary -->
        <div @click="toggleExpand(contract.id?.toString()!)"
          class="p-4 flex items-center justify-between cursor-pointer select-none transition-colors hover:bg-white/5">
          <div class="flex items-center gap-4">
            <div
              :class="['rounded-lg border border-brand-glass-border transition-all overflow-hidden flex items-center justify-center flex-shrink-0', getBuImage(contract.bu_id) ? 'bg-brand-surface' : 'p-2', contract.signed ? 'text-green-400 border-green-500/30 bg-green-500/5' : 'text-brand-cyan border-brand-cyan/20']"
              style="width: 36px; height: 36px;">
              <img v-if="getBuImage(contract.bu_id)" :src="getBuImage(contract.bu_id)!"
                class="h-full w-full object-cover" :alt="getBuName(contract.bu_id)" />
              <FileCheck v-else-if="contract.signed" class="h-4 w-4" />
              <FileText v-else class="h-4 w-4" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">{{ contract.title
                }}</h4>
              <p class="text-[10px] text-white/50 font-medium uppercase tracking-wider">{{
                getSellerName(contract.seller_id) }} · {{ contract.type_contract }}</p>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="hidden md:flex flex-col items-end gap-1">
              <span class="text-[8px] text-white/30 uppercase font-black tracking-widest">Status da Alteração</span>
              <span v-if="contract.change_status === 'alert'"
                class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm bg-orange-500/20 text-orange-400 border border-orange-500/20">
                <template v-if="isLeadership">Revisar Aviso</template>
                <template v-else>Em Validação</template>
              </span>
              <span v-else-if="contract.change_status === 'approved'"
                class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm bg-green-500/20 text-green-300 border border-green-500/20">Aprovado</span>
              <span v-else-if="contract.change_status === 'reject'"
                class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm bg-red-500/20 text-red-300 border border-red-500/20">Recusado</span>
              <span v-else
                class="text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20">Nenhum</span>
            </div>

            <div class="hidden md:flex flex-col items-end gap-1">
              <span class="text-[8px] text-white/30 uppercase font-black tracking-widest">Contrato</span>
              <span
                :class="['text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm',
                  contract.signed ? 'bg-green-500/20 text-green-300 border border-green-500/20' : 'bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20']">
                {{ contract.signed ? 'Assinado' : 'Pendente' }}
              </span>
            </div>
            <ChevronDown :class="['h-4 w-4 text-white/30 transition-transform duration-300',
              expandedId === contract.id?.toString() ? 'rotate-180 text-brand-cyan' : '']" />
          </div>
        </div>

        <!-- Content Expansível -->
        <Transition name="expand">
          <div v-if="expandedId === contract.id?.toString()"
            class="px-6 pb-8 pt-4 border-t border-brand-glass-border bg-black/20 space-y-8">

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <!-- Coluna 1: Infos e Link -->
              <div class="space-y-6">
                <div class="space-y-3">
                  <label
                    class="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                    <LinkIcon class="h-3 w-3" />
                    Link do Documento
                  </label>
                  <div class="flex gap-2">
                    <input v-model="editingLink" type="url" placeholder="Cole o link aqui..."
                      class="flex-1 px-4 py-3 rounded-xl bg-brand-offset border border-brand-glass-border text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-brand-cyan transition-all shadow-inner" />

                    <a v-if="contract.link" :href="contract.link" target="_blank" rel="noopener noreferrer"
                      title="Abrir Link"
                      class="flex items-center justify-center aspect-square px-3 py-3 rounded-xl bg-brand-offset border border-brand-cyan/20 text-brand-cyan hover:bg-brand-cyan/10 transition-all shadow-lg">
                      <ExternalLink class="h-4 w-4" />
                    </a>
                    <div v-else title="Nenhum link salvo"
                      class="flex items-center justify-center aspect-square px-3 py-3 rounded-xl bg-brand-offset opacity-50 border border-brand-glass-border text-white/20 cursor-not-allowed shadow-inner">
                      <ExternalLink class="h-4 w-4" />
                    </div>

                    <button @click="handleUpdateLink(contract)"
                      class="px-6 py-3 rounded-xl bg-brand-cyan text-brand-deep font-black text-[10px] uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg hover:shadow-brand-cyan/20">
                      Salvar
                    </button>
                  </div>
                </div>

                <div class="p-5 rounded-2xl bg-black/40 border border-brand-glass-border shadow-md space-y-4">
                  <div class="space-y-1.5 flex items-center justify-between border-b border-white/5 pb-3">
                    <div class="space-y-1">
                      <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">Vencimento</p>
                      <p class="text-sm font-bold text-white">{{ formatDate(contract.due_date) }}</p>
                    </div>
                    <div class="text-right space-y-1">
                      <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">CNPJ do Cliente</p>
                      <p class="text-sm font-bold text-white/60">{{ contract.cnpj_client || 'Não informado' }}</p>
                    </div>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1">
                      <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">Implementação</p>
                      <p class="text-sm font-black text-white">{{ formatCurrency(contract.implementation_fee) }}</p>
                    </div>
                    <div class="text-right space-y-1">
                      <p class="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">Mensalidade</p>
                      <p class="text-base font-black text-brand-cyan">{{ formatCurrency(contract.monthly_fee) }}</p>
                    </div>
                  </div>
                  
                  <!-- P1 Info (Nova) -->
                  <div class="pt-4 mt-4 border-t border-white/5 space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div class="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div class="flex items-center gap-2 mb-1">
                          <CreditCard class="h-3 w-3 text-brand-cyan/60" />
                          <span class="text-[8px] font-black text-white/30 uppercase tracking-widest">Valor P1</span>
                        </div>
                        <p class="text-xs font-bold text-white/90">{{ formatCurrency(contract.first_payment_amount) }}</p>
                      </div>
                      <div class="p-3 rounded-xl bg-white/5 border border-white/10">
                        <div class="flex items-center gap-2 mb-1">
                          <TrendingUp class="h-3 w-3 text-brand-cyan/60" />
                          <span class="text-[8px] font-black text-white/30 uppercase tracking-widest">ROI P1</span>
                        </div>
                        <p class="text-xs font-black" :class="getRoiP1(contract) >= 0 ? 'text-green-400' : 'text-red-400'">
                          {{ formatCurrency(getRoiP1(contract)) }}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Tempo Metric (Nova) -->
                  <div class="pt-4 border-t border-white/5">
                    <div class="flex items-center justify-between p-3 rounded-xl bg-brand-cyan/5 border border-brand-cyan/10">
                      <div class="flex items-center gap-2">
                        <Clock class="h-3.5 w-3.5 text-brand-cyan" />
                        <span class="text-[9px] font-black text-white/40 uppercase tracking-[0.15em]">
                          {{ contract.signed ? 'Tempo até Assinatura' : 'Tempo em Aberto' }}
                        </span>
                      </div>
                      <span class="text-xs font-black text-brand-cyan">
                        {{ calculateDuration(contract) }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Coluna 2: Ações de Status -->
              <div class="space-y-6">
                <div class="flex items-center justify-between">
                  <label
                    class="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center gap-2">
                    <Settings2 class="h-3 w-3" />
                    Ações Administrativas
                  </label>
                  <button @click="handleDeleteContract(contract)"
                    class="text-[10px] py-1 px-3 rounded-md font-bold uppercase tracking-widest text-white/20 hover:text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-all"
                    title="Excluir Contrato Permanentemente">
                    <Trash2 class="h-3 w-3" />
                    Excluir
                  </button>
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <button @click="handleToggleSigned(contract)" :disabled="contract.change_status === 'alert'"
                    :class="['p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 group/btn shadow-lg',
                      contract.change_status === 'alert' ? 'opacity-50 cursor-not-allowed grayscale' : '',
                      contract.signed
                        ? 'bg-green-500/20 border-green-500/50 text-green-400'
                        : 'bg-brand-offset border-brand-glass-border text-white/30 hover:border-green-500/50 hover:text-green-400 hover:bg-green-500/5']">
                    <CheckCircle2
                      :class="['h-8 w-8 transition-transform group-hover/btn:scale-110', contract.signed ? 'text-green-400' : 'group-hover/btn:text-green-400']" />
                    <span v-if="contract.signed"
                      class="text-[10px] font-black uppercase tracking-[0.15em]">Finalizado</span>
                    <span v-else class="text-[10px] font-black uppercase tracking-[0.15em]">Marcar Assinado</span>
                  </button>

                  <button v-if="!isLeadership && contract.change_status !== 'alert'" @click="openChangeModal(contract)"
                    :disabled="!contract.link" :class="['p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 shadow-lg',
                      'bg-brand-offset border-brand-glass-border text-white/30 hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-500/5',
                      !contract.link ? 'opacity-20 cursor-not-allowed grayscale' : '']">
                    <AlertCircle class="h-8 w-8" />
                    <span class="text-[10px] font-black uppercase tracking-[0.15em]">Aviso Mudança</span>
                  </button>

                  <div v-else-if="!isLeadership && contract.change_status === 'alert'"
                    class="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-orange-500/40 bg-orange-500/10 text-orange-400 text-center gap-2 relative group/cancel">
                    <button @click="cancelChangeRequest(contract)"
                      class="absolute top-2 right-2 p-1.5 rounded-lg bg-orange-500/20 text-orange-400 hover:bg-orange-500 hover:text-brand-deep transition-all opacity-0 group-hover/cancel:opacity-100"
                      title="Cancelar Aviso">
                      <X class="h-4 w-4" />
                    </button>
                    <AlertCircle class="h-6 w-6" />
                    <p class="text-[10px] font-black uppercase tracking-widest">Em Validação</p>
                    <p v-if="contract.change_description"
                      class="text-xs mt-2 text-white/60 italic border-t border-orange-500/20 pt-2 w-full break-all">
                      "{{ contract.change_description }}"</p>
                  </div>

                  <div v-if="isLeadership && contract.change_status === 'alert'"
                    class="col-span-1 border-2 border-orange-500/20 rounded-2xl p-4 flex flex-col gap-3 bg-orange-500/5">
                    <div class="flex flex-col">
                      <span
                        class="text-[9px] font-black text-orange-400/80 uppercase tracking-widest mb-1">Motivo:</span>
                      <p class="text-sm text-white/80 italic line-clamp-2 border-b border-orange-500/10 pb-3 mb-1">
                        "{{ contract.change_description || 'Sem descrição' }}"
                      </p>
                    </div>
                    <button @click="openReviewModal(contract)"
                      class="text-[10px] font-black uppercase tracking-widest text-orange-400 hover:text-orange-300 underline underline-offset-2 text-left transition-colors">
                      Ver detalhes &rarr;
                    </button>
                  </div>
                </div>

                <div v-if="!contract.link"
                  class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <HelpCircle class="h-3 w-3 text-orange-400/50" />
                  <p class="text-[9px] text-orange-400/70 font-bold uppercase tracking-widest text-center">
                    Adicione o link para habilitar o Aviso de Mudança
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
      
      <!-- Pagination Controls -->
      <div v-if="totalPages > 1" class="flex items-center justify-center gap-4 pt-4 pb-2">
        <button 
          @click="currentPage > 1 && currentPage--" 
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded-md bg-brand-surface border border-brand-glass-border text-xs text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Anterior
        </button>
        <span class="text-[10px] font-medium text-white/40 uppercase tracking-wider">
          Página {{ currentPage }} de {{ totalPages }}
        </span>
        <button 
          @click="currentPage < totalPages && currentPage++" 
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded-md bg-brand-surface border border-brand-glass-border text-xs text-white/60 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Próxima
        </button>
      </div>
    </div>

    <!-- Modal Aviso Mudança -->
    <Teleport to="body">
      <div v-if="changeRequestModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="changeRequestModalOpen = false"></div>
        <div
          class="relative bg-brand-surface border border-brand-glass-border rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6">
          <div class="flex items-center gap-4 text-orange-400">
            <AlertCircle class="h-8 w-8" />
            <div>
              <h3 class="text-xl font-bold text-white">Solicitar Aprovação de Alteração</h3>
              <p class="text-[10px] uppercase font-black tracking-widest text-orange-400/70">{{
                selectedContractForChange?.title }}</p>
            </div>
          </div>

          <div class="space-y-3">
            <label class="text-[10px] font-black text-brand-cyan uppercase tracking-[0.2em] flex items-center gap-2">
              <FileText class="h-3 w-3" /> Motivo da Alteração
            </label>
            <p class="text-xs text-white/50 mb-2 leading-relaxed">Nossa equipe de liderança irá analisar o motivo
              descrito
              antes de aprovar ou recusar o aviso de mudança. Seja detalhista.</p>
            <textarea v-model="changeDescriptionInput" rows="5"
              placeholder="Ex: O cliente solicitou a inclusão de uma cláusula especial..."
              class="w-full px-5 py-4 rounded-2xl bg-brand-offset border border-brand-glass-border text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-orange-500/50 transition-all resize-none shadow-inner"></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-6 border-t border-brand-glass-border">
            <button @click="changeRequestModalOpen = false"
              class="px-6 py-3 rounded-xl font-bold text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">Cancelar</button>
            <button @click="confirmChangeRequest"
              class="px-6 py-3 rounded-xl bg-orange-500 text-brand-deep font-black text-[12px] uppercase tracking-widest hover:brightness-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-orange-500/20 flex items-center gap-2">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de Revisão de Aviso (Liderança) -->
    <Teleport to="body">
      <div v-if="reviewModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="reviewModalOpen = false"></div>
        <div
          class="relative bg-brand-surface border border-brand-glass-border rounded-3xl p-8 w-full max-w-lg shadow-2xl space-y-6">
          <div class="flex items-center gap-4">
            <div
              class="h-14 w-14 rounded-xl bg-brand-offset border border-brand-glass-border overflow-hidden flex items-center justify-center flex-shrink-0">
              <img v-if="getBuImage(reviewContract?.bu_id)" :src="getBuImage(reviewContract?.bu_id)!"
                class="h-full w-full object-cover" />
              <AlertCircle v-else class="h-7 w-7 text-orange-400" />
            </div>
            <div>
              <h3 class="text-xl font-bold text-white">Aviso de Mudança</h3>
              <p class="text-[10px] uppercase font-black tracking-widest text-orange-400/70">{{ reviewContract?.title }}
              </p>
              <p class="text-[10px] text-white/40 font-medium mt-0.5">Vendedor: <span class="text-white/70">{{
                getSellerName(reviewContract?.seller_id) }}</span></p>
            </div>
          </div>

          <div class="space-y-2 p-5 rounded-2xl bg-brand-offset border border-orange-500/20">
            <span class="text-[9px] font-black text-orange-400/80 uppercase tracking-widest">Motivo descrito pelo
              vendedor:</span>
            <p class="text-sm text-white/80 leading-relaxed italic break-words">
              "{{ reviewContract?.change_description || 'Nenhuma descrição fornecida.' }}"
            </p>
          </div>

          <div class="grid grid-cols-2 gap-4 pt-4 border-t border-brand-glass-border">
            <button @click="handleApproveRejectChange(reviewContract!, 'reject'); reviewModalOpen = false"
              class="p-4 rounded-2xl bg-red-500/20 border-2 border-red-500/30 text-red-400 font-black text-xs uppercase tracking-widest hover:bg-red-500/30 transition-all flex items-center justify-center gap-2">
              <X class="h-4 w-4" /> Recusar
            </button>
            <button @click="handleApproveRejectChange(reviewContract!, 'approved'); reviewModalOpen = false"
              class="p-4 rounded-2xl bg-green-500/20 border-2 border-green-500/30 text-green-400 font-black text-xs uppercase tracking-widest hover:bg-green-500/30 transition-all flex items-center justify-center gap-2">
              <Check class="h-4 w-4" /> Aprovar
            </button>
          </div>
        </div>
      </div>
    </Teleport>
    <!-- Modal de Adicionar Link (Teleport) => Nenhuma Mudança aqui para cima -->

    <!-- Modal de Confirmação para Deletar -->
    <ConfirmModal :isOpen="deleteModalOpen" title="Excluir Contrato"
      message="Tem certeza que deseja excluir permanentemente este contrato? Esta ação não poderá ser desfeita e os dados serão perdidos para sempre."
      confirmText="Excluir" cancelText="Cancelar" type="danger" icon="trash" @confirm="executeDelete"
      @cancel="cancelDelete" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { Contracts } from '../../gen/types/Contracts';
import type { Business } from '../../gen/types/Business';
import type { Sellers } from '../../gen/types/Sellers';
import { useContractStore } from '../../store/contracts';
import { useCacStore } from '../../store/cac';
import {
  FileStack,
  FileCheck,
  FileText,
  ChevronDown,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  FileX2,
  Search,
  Settings2,
  HelpCircle,
  Check,
  X,
  ExternalLink,
  Trash2,
  Clock,
  CreditCard,
  Calendar,
  TrendingUp
} from 'lucide-vue-next';
import { useToast } from '../../composables/useToast';
import ConfirmModal from '../ui/ConfirmModal.vue';

const props = defineProps<{
  contracts: Contracts[];
  isHead?: boolean;
  isLeadership?: boolean;
  businessUnits?: Business[];
  sellers?: Sellers[];
  loading?: boolean;
}>();

const contractStore = useContractStore();
const cacStore = useCacStore();
const { success: toastSuccess, error: toastError, info: toastInfo } = useToast();
const expandedId = ref<string | null>(null);
const editingLink = ref('');
const changeDescriptionInput = ref('');
const searchQuery = ref('');
const showAlertsOnly = ref(false);
const signedFilter = ref<'all' | 'signed' | 'pending'>('all');

const signedFilterOptions = [
  { label: 'Todas', value: 'all' },
  { label: 'Assinados', value: 'signed' },
  { label: 'Pendentes', value: 'pending' },
] as const;

const changeRequestModalOpen = ref(false);
const selectedContractForChange = ref<Contracts | null>(null);

const reviewModalOpen = ref(false);
const reviewContract = ref<Contracts | null>(null);

const deleteModalOpen = ref(false);
const contractToDelete = ref<Contracts | null>(null);

const currentPage = ref(1);
const itemsPerPage = 10;

watch([searchQuery, showAlertsOnly, signedFilter], () => {
  currentPage.value = 1;
});

const getBuImage = (buId?: number | null): string | null => {
  if (!buId || !props.businessUnits) return null;
  const bu = props.businessUnits.find(b => b.id === buId);
  return bu?.img_base64 || null;
};

const getBuName = (buId?: number | null): string => {
  if (!buId || !props.businessUnits) return '';
  const bu = props.businessUnits.find(b => b.id === buId);
  return bu?.name || '';
};

const getSellerName = (sellerId?: string | null): string => {
  if (!sellerId || !props.sellers) return 'Vendedor';
  const seller = props.sellers.find(s => s.id === sellerId);
  return seller?.name || 'Vendedor';
};

const openReviewModal = (contract: Contracts) => {
  reviewContract.value = contract;
  reviewModalOpen.value = true;
};

const filteredContracts = computed(() => {
  let displayContracts = props.contracts;

  if (props.isLeadership && showAlertsOnly.value) {
    displayContracts = displayContracts.filter(c => c.change_status === 'alert');
  }

  if (signedFilter.value === 'signed') {
    displayContracts = displayContracts.filter(c => c.signed);
  } else if (signedFilter.value === 'pending') {
    displayContracts = displayContracts.filter(c => !c.signed);
  }
  
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    displayContracts = displayContracts.filter(c =>
      c.title?.toLowerCase().includes(q) ||
      c.type_contract?.toLowerCase().includes(q) ||
      c.cnpj_client?.toLowerCase().includes(q)
    );
  }

  // Ordenação automática de prioridade:
  // 1. Alertas pendentes (change_status === 'alert') sempre no topo
  // 2. Pendentes (signed === false) ordenados por data de vencimento (mais próximo primeiro)
  // 3. Assinados (signed === true) sempre no fundo
  return [...displayContracts].sort((a, b) => {
    const priorityOf = (c: typeof a): number => {
      if (c.change_status === 'alert') return 0;
      if (!c.signed) return 1;
      return 2;
    };

    const pa = priorityOf(a);
    const pb = priorityOf(b);

    if (pa !== pb) return pa - pb;

    // Dentro do mesmo grupo, ordena por data de vencimento (mais próxima primeiro)
    const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
    const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
    return dateA - dateB;
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredContracts.value.length / itemsPerPage) || 1;
});

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredContracts.value.slice(start, end);
});

const toggleExpand = (id: string) => {
  if (expandedId.value === id) {
    expandedId.value = null;
  } else {
    expandedId.value = id;
    const contract = props.contracts.find(c => c.id?.toString() === id);
    editingLink.value = contract?.link || '';
    changeDescriptionInput.value = '';
  }
};

const handleUpdateLink = async (contract: Contracts) => {
  if (!contract.id) return;
  const res = await contractStore.updateContract(contract.id, { link: editingLink.value });
  if (res.success) {
    contract.link = editingLink.value;
    toastInfo('Link do documento salvo com sucesso!');
  } else {
    toastError('Erro ao salvar o link do documento.');
  }
};

const handleToggleSigned = async (contract: Contracts) => {
  if (!contract.id) return;
  const newValue = !contract.signed;
  const res = await contractStore.updateContract(contract.id, {
    signed: newValue,
    signed_date: newValue ? new Date().toISOString() : null
  });
  if (res.success) {
    contract.signed = newValue;
    contract.signed_date = newValue ? new Date().toISOString() : null;
  }
};

const openChangeModal = (contract: Contracts) => {
  selectedContractForChange.value = contract;
  changeDescriptionInput.value = '';
  changeRequestModalOpen.value = true;
};

const confirmChangeRequest = async () => {
  const contract = selectedContractForChange.value;
  if (!contract?.id || !contract.link) return;

  const newStatus = 'alert';
  const desc = changeDescriptionInput.value.trim();

  const res = await contractStore.updateContract(contract.id, {
    change_status: newStatus,
    change_description: desc
  });

  if (res.success) {
    contract.change_status = newStatus;
    contract.change_description = desc;
    changeDescriptionInput.value = '';
    changeRequestModalOpen.value = false;
  }
};

const cancelChangeRequest = async (contract: Contracts) => {
  if (!contract.id) return;
  const res = await contractStore.updateContract(contract.id, {
    change_status: null,
    change_description: null
  });
  if (res.success) {
    contract.change_status = null;
    contract.change_description = null;
  }
};

const handleApproveRejectChange = async (contract: Contracts, status: 'approved' | 'reject') => {
  if (!contract.id) return;
  const res = await contractStore.updateContract(contract.id, { change_status: status });
  if (res.success) {
    contract.change_status = status;
  }
};

const handleDeleteContract = async (contract: Contracts) => {
  if (!contract.id) return;
  contractToDelete.value = contract;
  deleteModalOpen.value = true;
};

const cancelDelete = () => {
  contractToDelete.value = null;
  deleteModalOpen.value = false;
};

const executeDelete = async () => {
  const contract = contractToDelete.value;
  if (!contract || !contract.id) {
    cancelDelete();
    return;
  }

  deleteModalOpen.value = false;
  const res = await contractStore.deleteContract(contract.id);

  if (res.success) {
    toastSuccess('Contrato excluído com sucesso.');
  } else {
    toastError('Erro ao excluir contrato.');
  }

  contractToDelete.value = null;
};

const formatDate = (date: string | null | undefined) => {
  if (!date) return 'Não definida';
  return new Date(date).toLocaleDateString('pt-BR');
};

const formatCurrency = (value: any) => {
  const amount = parseFloat(value?.toString() || '0');
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
};

const calculateDuration = (contract: Contracts) => {
  if (!contract.created_at) return 'N/A';
  
  const start = new Date(contract.created_at as string);
  const end = contract.signed && contract.signed_date 
    ? new Date(contract.signed_date as string) 
    : new Date();
    
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1 ? '1 dia' : `${diffDays} dias`;
};

const getRoiP1 = (contract: Contracts) => {
  if (!contract.bu_id) return 0;
  const buCac = cacStore.getBuCac(contract.bu_id);
  const cac = buCac ? Number(buCac.amount) : 0;
  const p1 = parseFloat(contract.first_payment_amount?.toString() || '0');
  return p1 - cac;
};
</script>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 500px;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
</style>
