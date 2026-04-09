<template>
  <div class="min-h-screen bg-brand-deep text-white font-sans selection:bg-brand-cyan/30">
    <!-- Header -->
    <header class="border-b border-brand-glass-border bg-brand-offset/50 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-[90%] mx-auto px-2 h-20 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div
            class="h-10 w-10 rounded-full bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-brand-deep font-bold text-lg shadow-lg shadow-brand-cyan/20">
            {{ userInitials }}
          </div>
          <div>
            <h2 class="text-sm font-semibold text-white/90 leading-tight">{{ user?.name }}</h2>
            <p class="text-[11px] text-brand-cyan uppercase tracking-wider font-medium">{{ getRoleLabel(user?.type) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="contractStore.loading || sellerStore.loading" class="flex items-center gap-2 mr-2">
            <div class="h-2 w-2 rounded-full bg-brand-cyan animate-ping"></div>
            <span class="text-[10px] text-brand-cyan/70 font-bold uppercase tracking-widest">Sincronizando...</span>
          </div>

          <!-- Configurar Sistema Dropdown (Admin/Head/Coord Only) -->
          <div v-if="['admin', 'head', 'coord'].includes(user?.type || '')" class="relative">
            <button @click="managementMenuOpen = !managementMenuOpen"
              class="management-dropdown-btn flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-glass-border hover:bg-white/10 transition-all text-xs font-semibold text-brand-cyan hover:text-brand-cyan/80">
              <Settings class="h-4 w-4" />
              Configurar Sistema
              <ChevronDownIcon class="h-3 w-3 transition-transform duration-300"
                :class="{ 'rotate-180': managementMenuOpen }" />
            </button>

            <!-- Dropdown Menu -->
            <div v-if="managementMenuOpen"
              class="management-dropdown-menu absolute right-0 mt-2 w-52 rounded-xl bg-brand-offset/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200">
              <div class="p-1.5 space-y-1">
                <button v-if="['admin', 'head', 'coord'].includes(user?.type || '')"
                  @click="router.push('/admin/users'); managementMenuOpen = false"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-white/70 hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all">
                  <div class="p-1.5 rounded-md bg-white/5">
                    <Users class="h-3.5 w-3.5" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider">Usuários</span>
                </button>

                <button v-if="user?.type === 'admin'"
                  @click="router.push('/admin/business'); managementMenuOpen = false"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-white/70 hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all">
                  <div class="p-1.5 rounded-md bg-white/5">
                    <Building2 class="h-3.5 w-3.5" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider">Unidades (BUs)</span>
                </button>

                <button @click="handleOpenGoalSettings('goals'); managementMenuOpen = false"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-white/70 hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all">
                  <div class="p-1.5 rounded-md bg-white/5">
                    <Target class="h-3.5 w-3.5" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider">Metas</span>
                </button>

                <button @click="costsModalOpen = true; managementMenuOpen = false"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-white/70 hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all">
                  <div class="p-1.5 rounded-md bg-white/5">
                    <DollarSign class="h-3.5 w-3.5" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider">Custos Comerciais</span>
                </button>

                <!-- <button @click="cacModalOpen = true; managementMenuOpen = false"
                  class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-white/70 hover:text-brand-cyan hover:bg-brand-cyan/5 transition-all">
                  <div class="p-1.5 rounded-md bg-white/5">
                    <TrendingUp class="h-3.5 w-3.5" />
                  </div>
                  <span class="text-[11px] font-bold uppercase tracking-wider">Configurar CAC</span>
                </button> -->
              </div>
            </div>
          </div>

          <button @click="profileModalOpen = true"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-glass-border hover:bg-white/10 transition-all text-xs font-semibold text-brand-cyan hover:text-brand-cyan/80">
            <UserRound class="h-4 w-4" />
            Configurar Perfil
          </button>
          <button @click="handleLogout"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-surface border border-brand-glass-border hover:bg-white/10 transition-all text-xs font-semibold text-white/70 hover:text-white">
            <LogOut class="h-4 w-4" />
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Modals -->
    <ProfileModal :is-open="profileModalOpen" @close="profileModalOpen = false" @updated="handleProfileUpdated" />
    <SetGoalModal :is-open="goalModalOpen" :show-periods-only="goalModalMode === 'periods'"
      :initial-view="goalModalMode === 'periods' ? 'form' : 'list'" :initial-target="activeTarget"
      :month="dashboardContext.month" :year="dashboardContext.year" @saved="handleGoalSaved"
      @close="goalModalOpen = false" />
    <SetCostsModal :is-open="costsModalOpen" :month="dashboardContext.month" :year="dashboardContext.year"
      @close="costsModalOpen = false" @saved="handleCostsSaved" />
    <SetCacModal :is-open="cacModalOpen" :month="dashboardContext.month" :year="dashboardContext.year"
      @close="cacModalOpen = false" @saved="handleGoalSaved" />

    <ConfirmModal :is-open="dissociateConfirmOpen" title="Remover da Equipe"
      :message="`Tem certeza que deseja remover este vendedor da sua equipe?`" confirm-text="Remover"
      cancel-text="Manter" type="warning" icon="circle" @confirm="confirmDissociate"
      @cancel="dissociateConfirmOpen = false" />

    <main class="max-w-[90%] mx-auto px-2 py-8 space-y-4">
      <!-- Welcome Section -->
      <section class="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 pb-6 border-b border-white/5">
        <div class="space-y-1">
          <h1 class="text-3xl md:text-4xl font-black tracking-tight leading-tight">
            Olá,
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue">
              {{ firstName }}
            </span>
            .
          </h1>
          <p class="text-white/40 text-sm md:text-base max-w-xl font-medium leading-relaxed">
            Sua central de inteligência para gestão e automação de contratos da
            <span class="text-white/70">3F Venture</span>.
          </p>
        </div>

        <div class="flex flex-row justify-center items-center gap-2">
          <Calendar class="h-3 w-3 text-brand-cyan" />
          <span class="text-white/30 text-[11px] font-bold uppercase tracking-widest whitespace-nowrap">
            {{ new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }}
          </span>
        </div>
      </section>

      <!-- Filters Section -->
      <div ref="filterSectionRef" class="flex flex-wrap items-center gap-4 py-4 px-2 border-b border-white/5 mb-8">
        <!-- Mode Toggle -->
        <div v-if="['admin', 'coord'].includes(user?.type || '')"
          class="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button @click="dashboardFilterType = 'bu'"
            :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">Por
            BU</button>
          <button @click="dashboardFilterType = 'team'"
            :class="dashboardFilterType === 'team' ? 'bg-brand-cyan text-brand-deep shadow-lg scale-105' : 'text-white/40 hover:text-white'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300">Por
            Equipe</button>
        </div>

        <div v-if="user?.type === 'head'" class="flex p-1 bg-white/5 rounded-xl border border-white/5">
          <button @click="dashboardFilterType = 'team'"
            :class="dashboardFilterType === 'team' ? 'bg-brand-cyan text-brand-deep shadow-lg' : 'text-white/40'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">Minhas
            Equipes</button>
          <button @click="dashboardFilterType = 'bu'"
            :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep shadow-lg' : 'text-white/40'"
            class="px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all">Minhas
            BUs</button>
        </div>

        <!-- Dynamic Selects -->
        <div v-if="dashboardFilterType === 'bu'" class="min-w-[200px] flex-1 md:flex-none">
          <CustomSelect v-model="selectedBUId" :options="buOptionsFormatted" placeholder="Selecionar BU"
            :icon="Building2" />
        </div>
        <template v-if="dashboardFilterType === 'team' || user?.type === 'seller'">
          <div class="min-w-[240px] flex-1 md:flex-none">
            <CustomSelect v-model="selectedTeamId" :options="teamOptionsFormatted" placeholder="Selecionar Equipe"
              :icon="Users" searchable allow-clear />
          </div>
          <div class="min-w-[240px] flex-1 md:flex-none" v-if="!['seller', 'sdr'].includes(user?.type || '')">
            <CustomSelect v-model="selectedSellerId" :options="sellerOptionsFormatted" placeholder="Selecionar Vendedor"
              :icon="UserRound" searchable allow-clear />
          </div>
        </template>

        <!-- Temporal Filters -->
        <div class="flex-1 md:flex-none md:ml-auto flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div v-if="['quarter', 'month'].includes(selectedPeriodType)" class="min-w-[100px]">
              <CustomSelect v-model="selectedYear" :options="yearOptions" placeholder="Ano" :icon="Calendar"
                :allow-clear="false" />
            </div>
            <div class="min-w-[180px]">
              <CustomSelect v-model="selectedPeriodType" :options="periodTypeOptions" placeholder="Período"
                :icon="Clock" :allow-clear="false" />
            </div>
          </div>
          <div v-if="selectedPeriodType !== 'all'" class="w-full">
            <CustomSelect v-model="selectedPeriodValue" :options="dynamicPeriodOptions"
              :placeholder="periodValuePlaceholder" :icon="Calendar" :allow-clear="false" />
          </div>
        </div>
      </div>

      <!-- Goals Dashboard -->
      <GoalsDashboard :goal="activeGoal" :goals="activeGoalsList" :period-type="selectedPeriodType"
        :current-range="currentDateRange" :actuals="currentPerformance" :contracts="filteredP1Contracts"
        @open-settings="handleOpenGoalSettings('goals')" @open-periods="handleOpenGoalSettings('periods')"
        @open-costs="costsModalOpen = true" />

      <!-- Performance Section Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-2 px-2 pt-10">
        <div>
          <h2 class="text-base font-black uppercase tracking-[0.25em] text-white flex items-center gap-2.5">
            <TrendingUp class="h-4 w-4 text-brand-cyan" />
            Performance
          </h2>
        </div>
      </div>

      <!-- Indicadores Financeiros -->
      <div>
        <div class="flex items-center gap-2.5 mb-5 ml-1">
          <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]"></div>
          <span class="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">Indicadores Financeiros</span>
        </div>

        <!-- Row 1: 5 financial cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 mb-5">
          <div v-for="(stat, i) in financialStats" :key="stat.label"
            class="relative overflow-hidden p-6 rounded-[1.5rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.04] transition-all duration-500 group cursor-default"
            :style="{ animationDelay: i * 80 + 'ms' }">
            <!-- Ghost icon background -->
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.10] group-hover:scale-110 transition-all duration-700 pointer-events-none text-brand-cyan">
              <component :is="stat.icon" class="h-28 w-28 rotate-[-12deg]" />
            </div>

            <!-- Top row: icon + status badge -->
            <div class="flex items-center justify-between mb-5 relative z-10">
              <div
                class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300 shadow-sm">
                <component :is="stat.icon" class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[7px] font-black text-white/20 uppercase tracking-[0.25em]">Status</span>
                <span class="text-[8px] font-black text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
              </div>
            </div>

            <!-- Label + Value -->
            <div class="relative z-10">
              <div class="flex items-center gap-1.5 mb-1">
                <p class="text-[9px] font-black text-whitKe/45 uppercase tracking-[0.18em] leading-tight">{{ stat.label
                }}</p>
                <Info v-if="stat.tooltip" :title="stat.tooltip"
                  class="h-3 w-3 text-white/20 hover:text-brand-cyan transition-colors cursor-help flex-shrink-0" />
              </div>
              <div v-if="contractStore.loading" class="h-8 w-28 bg-white/5 rounded-lg animate-pulse"></div>
              <h3 v-else
                class="text-[22px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300 leading-none">
                {{ stat.value }}
              </h3>
            </div>

            <!-- Bottom glow line on hover -->
            <div
              class="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
          </div>
        </div>

        <!-- Row 2: CAC + ROI (2 cards, half width) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-5">
          <div v-for="(stat, i) in financialStats2" :key="stat.label"
            class="relative overflow-hidden p-6 rounded-[1.5rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.04] transition-all duration-500 group cursor-default xl:col-span-1">
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.10] group-hover:scale-110 transition-all duration-700 pointer-events-none text-brand-cyan">
              <component :is="stat.icon" class="h-28 w-28 rotate-[-12deg]" />
            </div>
            <div class="flex items-center justify-between mb-5 relative z-10">
              <div
                class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                <component :is="stat.icon" class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[7px] font-black text-white/20 uppercase tracking-[0.25em]">Status</span>
                <span class="text-[8px] font-black text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
              </div>
            </div>
            <div class="relative z-10">
              <p class="text-[9px] font-black text-white/45 uppercase tracking-[0.18em] leading-tight mb-1">{{
                stat.label }}
              </p>
              <div v-if="contractStore.loading" class="h-8 w-24 bg-white/5 rounded-lg animate-pulse"></div>
              <h3 v-else
                class="text-[22px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300 leading-none">
                {{ stat.value }}</h3>
            </div>
            <div
              class="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
          </div>
        </div>
      </div>

      <!-- Operação e Estrutura -->
      <div>
        <div class="flex items-center gap-2.5 mb-5 ml-1">
          <div class="h-1.5 w-1.5 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,212,255,0.8)]"></div>
          <span class="text-[9px] font-black uppercase tracking-[0.35em] text-white/35">Operação e Estrutura</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div v-for="(stat, i) in operationalStats" :key="stat.label"
            class="relative overflow-hidden p-6 rounded-[1.5rem] bg-brand-cyan/[0.02] border border-brand-cyan/10 hover:border-brand-cyan/40 hover:bg-brand-cyan/[0.04] transition-all duration-500 group cursor-default">
            <div
              class="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.10] group-hover:scale-110 transition-all duration-700 pointer-events-none text-brand-cyan">
              <component :is="stat.icon" class="h-28 w-28 rotate-[-12deg]" />
            </div>
            <div class="flex items-center justify-between mb-5 relative z-10">
              <div
                class="p-2.5 rounded-xl bg-brand-cyan/10 text-brand-cyan group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-300">
                <component :is="stat.icon" class="h-5 w-5" />
              </div>
              <div class="flex flex-col items-end">
                <span class="text-[7px] font-black text-white/20 uppercase tracking-[0.25em]">Status</span>
                <span class="text-[8px] font-black text-brand-cyan/80 uppercase tracking-widest">Ativo</span>
              </div>
            </div>
            <div class="relative z-10">
              <p class="text-[9px] font-black text-white/45 uppercase tracking-[0.18em] leading-tight mb-1">{{
                stat.label }}
              </p>
              <div v-if="sellerStore.loading || contractStore.loading"
                class="h-8 w-16 bg-white/5 rounded-lg animate-pulse">
              </div>
              <h3 v-else
                class="text-[22px] font-black tracking-tight text-white group-hover:text-brand-cyan transition-colors duration-300 leading-none">
                {{ stat.value }}</h3>
            </div>
            <div
              class="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-brand-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
          </div>
        </div>
      </div>

      <!-- Contracts List -->
      <section class="pt-10">
        <ContractList :contracts="allFilteredContracts" :isHead="user?.type === 'head'"
          :isLeadership="['head', 'coord', 'admin'].includes(user?.type || '')"
          :isAdmin="user?.type === 'admin'"
          :filterMode="contractFilterMode"
          :businessUnits="businessList" :sellers="sellerStore.allSellers" :loading="contractStore.loading"
          @update:filterMode="mode => contractFilterMode = mode" />
      </section>

      <!-- Team Manager -->
      <section v-if="['admin', 'head', 'coord'].includes(user?.type || '')" class="pt-10">
        <TeamManager />
      </section>

      <!-- Actions Grid -->
      <section class="pt-10 space-y-6">
        <h3 class="text-lg font-bold flex items-center gap-2">
          <LayoutGrid class="h-5 w-5 text-brand-cyan" />Geração de Contratos
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Premium Novo Contrato Button (UI/UX Pro Max + Design System Fixed) -->
          <button v-for="action in filteredActions" :key="action.title" @click="action.handler"
            class="group relative h-full p-8 rounded-[2rem] bg-brand-offset border border-brand-glass-border hover:border-brand-cyan/30 transition-all duration-700 overflow-hidden text-left flex flex-col gap-6 shadow-2xl hover:shadow-brand-cyan/5 hover:-translate-y-1">

            <!-- Animated Background Glow -->
            <div
              class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 bg-gradient-to-br from-brand-cyan/5 via-transparent to-brand-blue/5">
            </div>

            <!-- Floating Shimmer Effect (Hover Only - Single Pass) -->
            <div
              class="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div
                class="absolute -top-[100%] left-[-100%] w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/[0.03] to-transparent rotate-45 group-hover:animate-shimmer-once">
              </div>
            </div>

            <!-- Icon Container -->
            <div
              class="relative z-10 p-4 rounded-2xl bg-brand-cyan/5 border border-brand-cyan/20 text-brand-cyan group-hover:scale-110 group-hover:bg-brand-cyan group-hover:text-brand-deep transition-all duration-500 w-fit shadow-lg shadow-brand-cyan/5 active:scale-95">
              <component :is="action.icon" class="h-9 w-9 stroke-[1.5px]" />
            </div>

            <!-- Text Content -->
            <div class="relative z-10 space-y-3">
              <h4
                class="text-2xl font-black text-white group-hover:text-brand-cyan transition-colors duration-500 tracking-tight">
                {{ action.title }}
              </h4>
              <p
                class="text-white/40 text-[13px] leading-relaxed font-medium group-hover:text-white/60 transition-colors duration-500">
                {{ action.description }}
              </p>
            </div>

            <!-- Micro-interaction footer -->
            <div
              class="relative z-10 mt-auto pt-4 flex items-center justify-between border-t border-white/5 group-hover:border-brand-cyan/20 transition-colors duration-500">
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-brand-cyan/60 group-hover:text-brand-cyan transition-all translate-x-[-10px] group-hover:translate-x-0 duration-500 opacity-0 group-hover:opacity-100 flex items-center gap-2">
                Iniciar Geração
                <ArrowRight class="h-3 w-3" />
              </span>
              <div
                class="h-1 w-1 rounded-full bg-brand-cyan/20 group-hover:scale-[6] group-hover:bg-brand-cyan transition-all duration-700">
              </div>
            </div>
          </button>
        </div>
      </section>
    </main>

    <!-- Floating FAB System -->
    <Transition name="fab-fade">
      <div v-if="isFilterFABVisible" class="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-5">
        <Transition name="popover-zoom">
          <div v-if="isFloatingFilterOpen"
            class="floating-filter-popover w-80 p-6 rounded-[2rem] bg-brand-offset/95 backdrop-blur-2xl border border-white/10 shadow-2xl flex flex-col gap-6">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="p-1.5 rounded-lg bg-brand-cyan/10">
                  <ListFilterPlus class="h-4 w-4 text-brand-cyan" />
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest text-white/90">Filtros Rápidos</span>
              </div>
              <button @click.stop="isFloatingFilterOpen = false" class="p-1.5 hover:bg-white/5 rounded-full">
                <X class="h-3 w-3 text-white/40" />
              </button>
            </div>
            <div class="space-y-4">
              <div class="space-y-3">
                <span class="text-[8px] font-black uppercase tracking-widest text-brand-cyan/60 ml-1">Contexto
                  Visual</span>
                <div v-if="['admin', 'coord'].includes(user?.type || '')"
                  class="flex p-1 bg-white/5 rounded-xl border border-white/5">
                  <button @click="dashboardFilterType = 'bu'"
                    :class="dashboardFilterType === 'bu' ? 'bg-brand-cyan text-brand-deep' : 'text-white/40'"
                    class="flex-1 py-1 rounded-lg text-[8px] font-black uppercase">BU</button>
                  <button @click="dashboardFilterType = 'team'"
                    :class="dashboardFilterType === 'team' ? 'bg-brand-cyan text-brand-deep' : 'text-white/40'"
                    class="flex-1 py-1 rounded-lg text-[8px] font-black uppercase">Equipe</button>
                </div>
                <CustomSelect v-if="dashboardFilterType === 'bu'" v-model="selectedBUId" :options="buOptionsFormatted"
                  placeholder="BU" :icon="Building2" />
                <template v-else>
                  <CustomSelect v-model="selectedTeamId" :options="teamOptionsFormatted" placeholder="Equipe"
                    :icon="UsersRound" searchable allow-clear />
                  <CustomSelect v-if="!['seller', 'sdr'].includes(user?.type || '')" v-model="selectedSellerId"
                    :options="sellerOptionsFormatted" placeholder="Vendedor" :icon="UserRound" searchable allow-clear />
                </template>
              </div>
              <div class="h-px bg-white/5"></div>
              <div class="space-y-3">
                <span
                  class="text-[8px] font-black uppercase tracking-widest text-brand-cyan/60 ml-1">Periodicidade</span>
                <CustomSelect v-model="selectedPeriodType" :options="periodTypeOptions" placeholder="Período"
                  :icon="Clock" forceUp />
                <CustomSelect v-if="['quarter', 'month'].includes(selectedPeriodType)" v-model="selectedYear"
                  :options="yearOptions" placeholder="Ano" :icon="Calendar" :allow-clear="false" forceUp />
                <CustomSelect v-if="selectedPeriodType !== 'all'" v-model="selectedPeriodValue"
                  :options="dynamicPeriodOptions" :placeholder="periodValuePlaceholder" :icon="Calendar" forceUp />
              </div>
            </div>
          </div>
        </Transition>

        <button @click.stop="isFloatingFilterOpen = !isFloatingFilterOpen"
          class="floating-filter-btn p-5 rounded-full bg-brand-cyan text-brand-deep shadow-2xl hover:scale-110 active:scale-95 transition-all group relative overflow-hidden"
          :class="{ 'bg-white rotate-90': isFloatingFilterOpen }">
          <ListFilterPlus v-if="!isFloatingFilterOpen" class="h-5 w-5" />
          <X v-else class="h-5 w-5" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSellerStore } from '../store/seller'
import { useContractStore } from '../store/contracts'
import { useGoalStore } from '../store/goals'
import type { Business } from '../gen/types/Business'
import { getBusiness } from '../gen/hooks/getBusiness'
import client from '../api/client'
import {
  LogOut, FileText, Users, Building2, LayoutGrid, ArrowRight, TrendingUp, Receipt, DollarSign, BanknoteArrowUp, ShieldCheck,
  Settings, Users2, UserRound, Check, Search, Calendar, X, ChevronDown as ChevronDownIcon, Clock,
  Activity, Construction, Briefcase, Target, Info, ListFilterPlus, FileCheck, Percent, Timer,
  UsersRound
} from '@lucide/vue'
import ProfileModal from '../components/profile/ProfileModal.vue'
import GoalsDashboard from '../components/dashboard/GoalsDashboard.vue'
import SetGoalModal from '../components/dashboard/SetGoalModal.vue'
import SetCacModal from '../components/dashboard/SetCacModal.vue'
import SetCostsModal from '../components/dashboard/SetCostsModal.vue'
import ContractList from '../components/contracts/ContractList.vue'
import ConfirmModal from '../components/ui/ConfirmModal.vue'
import TeamManager from '../components/dashboard/TeamManager.vue'
import { useToast } from '../composables/useToast'
import CustomSelect from '../components/ui/CustomSelect.vue'
import { useTeamStore } from '../store/team'
import { useCacStore } from '../store/cac'
import { useCostsStore } from '../store/costs'
import { useBuStore } from '../store/bu'

// --- Stores ---
const authStore = useAuthStore()
const sellerStore = useSellerStore()
const contractStore = useContractStore()
const goalStore = useGoalStore()
const teamStore = useTeamStore()
const costsStore = useCostsStore()
const cacStore = useCacStore()
const buStore = useBuStore()
const router = useRouter()
const toast = useToast()

// --- UI Logic ---
const managementMenuOpen = ref(false)
const profileModalOpen = ref(false)
const goalModalOpen = ref(false)
const costsModalOpen = ref(false)
const cacModalOpen = ref(false)
const goalModalMode = ref<'goals' | 'periods'>('goals')
const activeTarget = ref<{ type: string; id: string } | null>(null)
const dissociateConfirmOpen = ref(false)
const sellerToDissociate = ref<string | null>(null)
const contractFilterMode = ref<'own' | 'team'>('own')

// --- Filters State ---
const dashboardFilterType = ref<'bu' | 'team' | 'coord'>(authStore.user?.type === 'head' || authStore.user?.type === 'admin' ? 'bu' : 'team')
const selectedBUId = ref<string | null>(authStore.user?.type === 'admin' ? 'all' : null)
const selectedTeamId = ref<string | null>(null)
const selectedSellerId = ref<string | null>(null)
const selectedYear = ref(new Date().getFullYear().toString())
const selectedPeriodType = ref<'month' | 'quarter' | 'year' | 'all'>('month')
const selectedPeriodValue = ref(new Date().toISOString().substring(0, 7))
const businessList = computed(() => buStore.businesses)

// --- FAB Logic ---
const filterSectionRef = ref<HTMLElement | null>(null)
const isFilterFABVisible = ref(false)
const isFloatingFilterOpen = ref(false)

const handleScroll = () => {
  if (filterSectionRef.value) {
    const rect = filterSectionRef.value.getBoundingClientRect()
    isFilterFABVisible.value = rect.bottom < 0
  }
}

const handleGlobalClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  // Management dropdown: close if clicked outside
  if (managementMenuOpen.value && !target.closest('.management-dropdown-btn') && !target.closest('.management-dropdown-menu')) {
    managementMenuOpen.value = false
  }
  // FAB filter: close if clicked outside (but NOT on the FAB button itself)
  if (isFloatingFilterOpen.value && !target.closest('.floating-filter-btn') && !target.closest('.floating-filter-popover')) {
    isFloatingFilterOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('click', handleGlobalClick)

  // Data load
  if (authStore.user?.id) {
    if (authStore.user.type === 'admin') contractStore.fetchAllContracts()
    else if (authStore.user.type === 'coord') contractStore.fetchTeamContracts(authStore.user.id.toString())
    else contractStore.fetchMyContracts(authStore.user.id.toString())
  }
  sellerStore.fetchAllSellers()
  teamStore.fetchTeams()
  buStore.fetchBusinesses()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', handleGlobalClick)
})

// --- Computeds ---
const user = computed(() => authStore.user)
const firstName = computed(() => user.value?.name?.split(' ')[0] || 'Gestor')
const userInitials = computed(() => user.value?.name?.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase() || '??')
const dashboardContext = computed(() => {
  if (selectedPeriodType.value === 'month') {
    const [y, m] = selectedPeriodValue.value.split('-').map(Number)
    return { month: m, year: y }
  }
  const y = parseInt(selectedYear.value)
  let m = 1
  if (selectedPeriodValue.value === 'q2') m = 4
  else if (selectedPeriodValue.value === 'q3') m = 7
  else if (selectedPeriodValue.value === 'q4') m = 10
  return { month: m, year: y }
})

// Helper: parseia datas ISO do Prisma como data local (evita offset UTC em comparações de range)
const parseLocalDate = (raw: string | null | undefined): Date => {
  if (!raw) return new Date('')
  const d = new Date(raw)
  d.setHours(0, 0, 0, 0)
  return d
}

const currentDateRange = computed(() => {
  const now = new Date(); const curM = now.getMonth() + 1; const curY = now.getFullYear()
  if (selectedPeriodType.value === 'all') {
    const sy = 2026; const ms = []
    for (let y = sy; y <= curY; y++) {
      const mx = y === curY ? curM : 12
      for (let m = 1; m <= mx; m++) ms.push({ m, y })
    }
    const genEnd = new Date(curY, curM, 0, 23, 59, 59, 999)
    return { p1: { start: new Date(sy, 0, 6), end: new Date(curY, curM, 5, 23, 59, 59, 999) }, gen: { start: new Date(sy, 0, 1), end: genEnd }, months: ms }
  }
  if (selectedPeriodType.value === 'month') {
    const [y, m] = selectedPeriodValue.value.split('-').map(Number)
    return {
      p1: { start: new Date(y, m - 1, 6, 0, 0, 0), end: new Date(y, m, 5, 23, 59, 59, 999) },
      gen: { start: new Date(y, m - 1, 1, 0, 0, 0), end: new Date(y, m, 0, 23, 59, 59, 999) },
      months: [{ m, y }]
    }
  }
  if (selectedPeriodType.value === 'year') {
    const y = parseInt(selectedPeriodValue.value); const isC = y === curY; const mx = isC ? curM : 12
    const ms = []; for (let i = 1; i <= mx; i++) ms.push({ m: i, y })
    const genEnd = isC ? new Date(y, curM, 0, 23, 59, 59, 999) : new Date(y, 11, 31, 23, 59, 59, 999)
    return { p1: { start: new Date(y, 0, 6), end: isC ? new Date(y, curM, 5) : new Date(y + 1, 0, 5) }, gen: { start: new Date(y, 0, 1), end: genEnd }, months: ms }
  }
  // Quarter
  let sm, em; const y = parseInt(selectedYear.value)
  if (selectedPeriodValue.value === 'q1') { sm = 0; em = 2 }
  else if (selectedPeriodValue.value === 'q2') { sm = 3; em = 5 }
  else if (selectedPeriodValue.value === 'q3') { sm = 6; em = 8 }
  else { sm = 9; em = 11 }
  const ms = []; for (let i = sm; i <= em; i++) {
    const m = i + 1; if (y > curY || (y === curY && m > curM)) continue
    ms.push({ m, y })
  }
  const eem = ms.length > 0 ? ms[ms.length - 1].m : em + 1
  return { p1: { start: new Date(y, sm, 6), end: new Date(y, eem, 5, 23, 59, 59, 999) }, gen: { start: new Date(y, sm, 1), end: new Date(y, eem, 0, 23, 59, 59, 999) }, months: ms }
})

const baseContextContracts = computed(() => {
  let base = contractStore.myContracts
  if (dashboardFilterType.value === 'bu') {
    if (selectedBUId.value && selectedBUId.value !== 'all') {
      base = base.filter(c => c.bu_id === parseInt(selectedBUId.value!))
    }
  } else if (dashboardFilterType.value === 'team') {
    if (selectedTeamId.value) {
      if (selectedTeamId.value.startsWith('team_')) {
        const tid = parseInt(selectedTeamId.value.replace('team_', ''))
        base = base.filter(c => {
          const seller = sellerStore.allSellers.find(s => s.id === c.seller_id)
          return seller?.team_id === tid
        })
      } else if (selectedTeamId.value.startsWith('head_own_')) {
        const hid = selectedTeamId.value.replace('head_own_', '')
        base = base.filter(c => {
          const seller = sellerStore.allSellers.find(s => s.id === c.seller_id)
          return seller?.head_id?.toString() === hid
        })
      }
    }
    if (selectedSellerId.value) {
      base = base.filter(c => c.seller_id?.toString() === selectedSellerId.value)
    }
  }
  return base
})

const filteredContracts = computed(() => baseContextContracts.value.filter(c => !c.canceled_at))
const signedContracts = computed(() => filteredContracts.value.filter(c => c.signed))
const filteredP1Contracts = computed(() => {
  const range = currentDateRange.value

  // Passo 1: contrato deve estar assinado dentro do período (ex: abril)
  const contractsInPeriod = signedContracts.value.filter(c => {
    const d = parseLocalDate(c.signed_date || c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })

  // Passo 2: first_payment_date deve ser ≤ dia 6 do mês seguinte ao período
  // Senão o P1 é perdido e não conta para nenhum mês
  const end = range.gen.end
  const tMonth = end.getMonth() + 1
  const tYear = tMonth > 11 ? end.getFullYear() + 1 : end.getFullYear()
  const threshold = new Date(tYear, tMonth > 11 ? 0 : tMonth, 6, 23, 59, 59)

  return contractsInPeriod.filter(c => {
    if (!c.first_payment_date) return true
    const pDate = parseLocalDate(c.first_payment_date as string)
    return pDate.getTime() <= threshold.getTime()
  })
})

const currentPerformance = computed(() => {
  const range = currentDateRange.value
  // Para TCV/NMRR: usa signed_date dentro do mês
  const gen = signedContracts.value.filter(c => {
    const d = parseLocalDate(c.signed_date || c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })
  // PRINCIPAIS CÁLCULOS
  const p1 = filteredP1Contracts.value.reduce((acc, c) => {
    let p1Amount = parseFloat(c.first_payment_amount as any) || 0
    if (!p1Amount) {
      p1Amount = parseFloat(c.monthly_fee as any) || 0
    }
    return acc + p1Amount
  }, 0)

  const tcv = gen.reduce((acc, c) => acc + ((parseFloat(c.monthly_fee as any) || 0) * (c.contractual_term || 12)) + (parseFloat(c.implementation_fee as any) || 0), 0)
  const nmrr = gen.reduce((acc, c) => acc + ((parseFloat(c.implementation_fee as any) || 0) / (c.contractual_term || 12)) + (parseFloat(c.monthly_fee as any) || 0), 0)
  return { p1, tcv, nmrr, implementation: gen.reduce((acc, c) => acc + (parseFloat(c.implementation_fee as any) || 0), 0), monthly: gen.reduce((acc, c) => acc + (parseFloat(c.monthly_fee as any) || 0), 0) }
})

const activeGoalsList = computed(() => {
  const months = currentDateRange.value.months
  if (dashboardFilterType.value === 'bu') {
    const buId = selectedBUId.value || 'all'
    return goalStore.goals.filter(g => g.target_type === 'bu' && (buId === 'all' || g.target_id.toString() === buId.toString()) && months.some(m => g.month === m.m && g.year === m.y))
  }
  if (selectedSellerId.value) return goalStore.goals.filter(g => g.target_type === 'seller' && g.target_id.toString() === selectedSellerId.value && months.some(m => g.month === m.m && g.year === m.y))
  if (selectedTeamId.value) {
    const tid = selectedTeamId.value.replace('team_', '').replace('head_own_', '')
    return goalStore.goals.filter(g => (g.target_type === 'team' || g.target_type === 'head') && g.target_id.toString() === tid && months.some(m => g.month === m.m && g.year === m.y))
  }
  return []
})

const activeGoal = computed(() => {
  if (!activeGoalsList.value.length) return null
  const combined = activeGoalsList.value.reduce((acc, g) => {
    acc.p1 += Number(g.p1 || 0); acc.tcv += Number(g.tcv || 0); acc.nmrr += Number(g.nmrr || 0)
    acc.implementation += Number(g.implementation || 0); acc.monthly += Number(g.monthly || 0)
    return acc
  }, { p1: 0, tcv: 0, nmrr: 0, implementation: 0, monthly: 0 })
  return { ...combined, target_type: dashboardFilterType.value, month: dashboardContext.value.month, year: dashboardContext.value.year } as any
})


// --- Stats Computeds ---
const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

const financialStats = computed(() => {
  const perf = currentPerformance.value
  return [
    { label: 'Total Implementação', value: fmt(perf.implementation), icon: Receipt },
    { label: 'Recorrência Mensal', value: fmt(perf.monthly), icon: Activity },
    { label: 'Valor P1', value: fmt(perf.p1), icon: TrendingUp, tooltip: 'Competência P1: soma da primeira parcela dos contratos gerados no período, desde que o pagamento ocorra até o dia 06 do mês seguinte.' },
    { label: 'Valor Total (TCV)', value: fmt(perf.tcv), icon: Briefcase },
    { label: 'NMRR', value: fmt(perf.nmrr), icon: ShieldCheck },
  ]
})

const financialStats2 = computed(() => {
  const totalCosts = costsStore.totalCommercialCosts
  const range = currentDateRange.value
  const clientsAcquired = signedContracts.value.filter(c => {
    const d = parseLocalDate(c.signed_date || c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  }).length
  const cac = clientsAcquired > 0 ? totalCosts / clientsAcquired : 0
  const p1 = currentPerformance.value.p1
  const roi = totalCosts > 0 ? (p1 / totalCosts).toFixed(2) + 'x' : '0x'
  return [
    { label: 'Custo por Aquisição (CAC)', value: fmt(cac), icon: DollarSign },
    { label: 'ROI P1', value: roi, icon: BanknoteArrowUp },
  ]
})

const operationalStats = computed(() => {
  const range = currentDateRange.value
  // Contratos gerados no período (por created_at) — base para total e taxa
  const contracts = filteredContracts.value.filter(c => {
    const d = parseLocalDate(c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })
  // Contratos assinados no mês (por signed_date)
  const signedInPeriod = signedContracts.value.filter(c => {
    const d = parseLocalDate(c.signed_date || c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })
  // Contratos pendentes no mês (por created_at) — ainda não assinados e não cancelados
  const pendingInPeriod = filteredContracts.value.filter(c => {
    if (c.signed) return false
    const d = parseLocalDate(c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })
  const signed = signedInPeriod.length
  const total = signed + pendingInPeriod.length
  const rate = total > 0 ? ((signed / total) * 100).toFixed(1) + '%' : '0%'

  const avgDays = (() => {
    const withDates = signedInPeriod.filter(c => c.signed_date && c.created_at)
    if (!withDates.length) return '0,0 dias'
    const avg = withDates.reduce((acc, c) => {
      const d1 = parseLocalDate(c.created_at)
      const d2 = parseLocalDate(c.signed_date)
      const diff = Math.round((d2.getTime() - d1.getTime()) / 86400000)
      return acc + Math.max(1, diff)
    }, 0) / withDates.length
    return avg.toFixed(1).replace('.', ',') + ' dias'
  })()

  return [
    { label: 'Contratos Assinados', value: signed.toString(), icon: FileCheck },
    { label: 'Média de Assinatura', value: avgDays, icon: Timer },
    { label: 'Taxa de Assinatura', value: rate, icon: Percent },
    { label: 'Total de Colaboradores', value: sellerStore.allSellers.length.toString(), icon: Users },
  ]
})

// --- Options ---
const periodTypeOptions = [{ value: 'month', label: 'Por Mês' }, { value: 'quarter', label: 'Por Trimestre' }, { value: 'year', label: 'Por Ano' }, { value: 'all', label: 'Geral' }]
const yearOptions = computed(() => {
  const ys = []; for (let i = 2026; i <= new Date().getFullYear(); i++) ys.push({ value: i.toString(), label: i.toString() })
  return ys.length ? ys : [{ value: '2026', label: '2026' }]
})
const dynamicPeriodOptions = computed(() => {
  if (selectedPeriodType.value === 'month') return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(parseInt(selectedYear.value), i, 1)
    return { value: d.toISOString().substring(0, 7), label: d.toLocaleDateString('pt-BR', { month: 'long' }) }
  })
  if (selectedPeriodType.value === 'quarter') return [{ value: 'q1', label: 'Q1' }, { value: 'q2', label: 'Q2' }, { value: 'q3', label: 'Q3' }, { value: 'q4', label: 'Q4' }]
  if (selectedPeriodType.value === 'year') return yearOptions.value
  return []
})
const periodValuePlaceholder = computed(() => selectedPeriodType.value === 'quarter' ? 'Trimestre' : selectedPeriodType.value === 'year' ? 'Ano' : 'Mês')

const buOptionsFormatted = computed(() => {
  const u = authStore.user
  const isAdmin = u?.type === 'admin'
  const myBUIds = (u as any)?.seller_business?.map((sb: any) => Number(sb.business_id)) || []
  
  const opts: any[] = []
  
  // Apenas Admin ou quem tem múltiplas BUs vê a opção "Geral"
  if (isAdmin) {
    opts.push({ value: 'all', label: '3F Venture', image: '/3fventure-logo.jpg' })
  } else if (myBUIds.length > 1) {
    opts.push({ value: 'all', label: 'Geral (Minhas BUs)', image: '/3fventure-logo.jpg' })
  }

  businessList.value.forEach(b => {
    const isMyBU = myBUIds.includes(Number(b.id))
    if (isAdmin || isMyBU) {
      opts.push({
        value: b.id?.toString() || '',
        label: b.name || '',
        image: b.img_base64 || undefined
      })
    }
  })
  
  return opts
})

// Garantir que selectedBUId seja inicializado corretamente de acordo com as permissões
watch(buOptionsFormatted, (opts) => {
  if (!opts.length) return
  
  const canSeeAll = opts.some(o => o.value === 'all')
  
  if (!selectedBUId.value) {
    selectedBUId.value = opts[0].value
  } else if (selectedBUId.value === 'all' && !canSeeAll) {
    // Se o usuário não pode ver "Geral", muda para a primeira BU disponível
    selectedBUId.value = opts[0].value
  }
}, { immediate: true })
const teamOptionsFormatted = computed(() => teamStore.teams.map(t => ({ value: `team_${t.id}`, label: t.name })))
const sellerOptionsFormatted = computed(() => {
  let sls = sellerStore.allSellers
  if (selectedTeamId.value?.startsWith('team_')) sls = sls.filter(s => s.team_id === parseInt(selectedTeamId.value!.replace('team_', '')))
  return sls.map(s => ({ value: s.id?.toString() || '', label: s.name || '' }))
})

// --- Actions ---
const handleLogout = () => { authStore.logout(); router.push('/login') }
const handleOpenGoalSettings = (mode: 'goals' | 'periods') => {
  if (mode === 'periods' && activeGoal.value) activeTarget.value = { type: activeGoal.value.target_type, id: activeGoal.value.target_id?.toString() || 'all' }
  else activeTarget.value = null
  goalModalMode.value = mode; goalModalOpen.value = true
}
const handleGoalSaved = () => { goalModalOpen.value = false; goalStore.fetchGoals(dashboardContext.value.month, dashboardContext.value.year) }
const handleCostsSaved = () => { costsModalOpen.value = false; costsStore.fetchCosts(dashboardContext.value.month, dashboardContext.value.year) }
const handleProfileUpdated = () => toast.success('Perfil atualizado!')

const confirmDissociate = async () => {
  if (sellerToDissociate.value) {
    await sellerStore.updateSeller(sellerToDissociate.value, { head_id: null })
    await sellerStore.fetchAllSellers()
    dissociateConfirmOpen.value = false
    toast.success('Vendedor removido.')
  }
}

const filteredActions = computed(() => [
  { title: 'Novo Contrato', description: 'Gere novos contratos com preenchimento automatizado.', icon: FileText, handler: () => router.push('/contratos/novo') }
])

const allFilteredContracts = computed(() => {
  const range = currentDateRange.value
  return baseContextContracts.value.filter(c => {
    const d = parseLocalDate(c.signed_date || c.created_at)
    return d.getTime() >= range.gen.start.getTime() && d.getTime() <= range.gen.end.getTime()
  })
})

const getRoleLabel = (t?: string) => t === 'admin' ? 'Administrador' : t === 'head' ? 'Head de BU' : t === 'coord' ? 'Coordenador' : 'Vendedor'

// --- Watchers ---
watch(selectedPeriodType, (t) => {
  if (t === 'month') selectedPeriodValue.value = `${selectedYear.value}-${new Date().toISOString().substring(5, 7)}`
  else if (t === 'quarter') selectedPeriodValue.value = 'q1'
  else if (t === 'year') selectedPeriodValue.value = selectedYear.value
})

watch(selectedYear, (y) => {
  if (selectedPeriodType.value === 'month') {
    const currentMonth = selectedPeriodValue.value.split('-')[1] || new Date().toISOString().substring(5, 7)
    selectedPeriodValue.value = `${y}-${currentMonth}`
  }
})

watch([dashboardContext], () => {
  goalStore.fetchGoals(dashboardContext.value.month, dashboardContext.value.year)
  if (['admin', 'head', 'coord'].includes(user.value?.type || '')) {
    cacStore.fetchCac(dashboardContext.value.month, dashboardContext.value.year)
    costsStore.fetchCosts(dashboardContext.value.month, dashboardContext.value.year)
  }
}, { immediate: true })
</script>

<style scoped>
.fab-fade-enter-active,
.fab-fade-leave-active {
  transition: all 0.5s ease;
}

.fab-fade-enter-from,
.fab-fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

.popover-zoom-enter-active,
.popover-zoom-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.popover-zoom-enter-from,
.popover-zoom-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
  transform-origin: bottom right;
}

.animate-shimmer {
  animation: shimmer 2s infinite linear;
}

.animate-shimmer-once {
  animation: shimmer 1.5s ease-out forwards;
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
