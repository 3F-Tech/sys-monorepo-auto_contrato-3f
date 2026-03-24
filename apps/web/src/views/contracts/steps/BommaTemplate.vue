<template>
  <div class="space-y-12 pb-20">
    <!-- Seção: DADOS DA EMPRESA (CONTRATANTE) -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Building2 class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Dados da Empresa (Contratante)</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">RAZÃO SOCIAL DO CONTRATANTE</label>
          <input type="text" v-model="form['RAZAO SOCIAL DO CONTRATANTE']" class="input-glass w-full"
            placeholder="NOME COMPLETO DA EMPRESA" :class="[errors && errors['RAZAO SOCIAL DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['RAZAO SOCIAL DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['RAZAO SOCIAL DO CONTRATANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CNPJ DO CONTRATANTE</label>
          <input type="text" v-model="form['CNPJ DO CONTRATANTE']" v-maska="'##.###.###/####-##'"
            class="input-glass w-full" placeholder="00.000.000/0000-00" :class="[errors && errors['CNPJ DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CNPJ DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CNPJ DO CONTRATANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: ENDEREÇO DA EMPRESA -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <MapPin class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Endereço da Empresa</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div class="md:col-span-3 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest italic" v-if="cepLoading">Buscando...</label>
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest" v-else>CEP DO CONTRATANTE</label>
          <input type="text" v-model="form['CEP DO CONTRATANTE']" v-maska="'#####-###'" class="input-glass w-full"
            placeholder="00000-000" :class="[errors && errors['CEP DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CEP DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CEP DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-6 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">LOGRADOURO DO CONTRATANTE</label>
          <input type="text" v-model="form['LOGRADOURO DO CONTRATANTE']" class="input-glass w-full"
            placeholder="RUA, AVENIDA, ETC" :class="[errors && errors['LOGRADOURO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['LOGRADOURO DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['LOGRADOURO DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-3 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NÚMERO DO CONTRATANTE</label>
          <input type="text" v-model="form['NUMERO DO CONTRATANTE']" class="input-glass w-full" placeholder="123" :class="[errors && errors['NUMERO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['NUMERO DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NUMERO DO CONTRATANTE'] }}</span>
        </div>

        <div class="md:col-span-5 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">BAIRRO DO CONTRATANTE</label>
          <input type="text" v-model="form['BAIRRO DO CONTRATANTE']" class="input-glass w-full"
            placeholder="NOME DO BAIRRO" :class="[errors && errors['BAIRRO DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['BAIRRO DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['BAIRRO DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-5 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CIDADE DO CONTRATANTE</label>
          <input type="text" v-model="form['CIDADE DO CONTRATANTE']" class="input-glass w-full" placeholder="CIDADE" :class="[errors && errors['CIDADE DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CIDADE DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CIDADE DO CONTRATANTE'] }}</span>
        </div>
        <div class="md:col-span-2 space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">UF DO CONTRATANTE</label>
          <input type="text" v-model="form['UF DO CONTRATANTE']" v-maska="'@@'" class="input-glass w-full uppercase"
            placeholder="SP" :class="[errors && errors['UF DO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['UF DO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['UF DO CONTRATANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: REPRESENTANTE LEGAL -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <UserIcon class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Representante Legal</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO REPRESENTANTE</label>
          <input type="text" v-model="form['NOME DO REPRESENTANTE']" class="input-glass w-full"
            placeholder="NOME COMPLETO" :class="[errors && errors['NOME DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['NOME DO REPRESENTANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME DO REPRESENTANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CARGO DO REPRESENTANTE</label>
          <input type="text" v-model="form['CARGO DO REPRESENTANTE']" class="input-glass w-full"
            placeholder="EX: DIRETOR" :class="[errors && errors['CARGO DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CARGO DO REPRESENTANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CARGO DO REPRESENTANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DO REPRESENTANTE</label>
          <input type="text" v-model="form['CPF DO REPRESENTANTE']" v-maska="'###.###.###-##'"
            class="input-glass w-full" placeholder="000.000.000-00" :class="[errors && errors['CPF DO REPRESENTANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['CPF DO REPRESENTANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF DO REPRESENTANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: CONTATOS E REDES SOCIAIS -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <Share2 class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Contatos e Redes Sociais</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">TELEFONE FINANCEIRO</label>
          <input type="text" v-model="form['TELEFONE FINANCEIRO CONTRATANTE']" v-maska="'(##) #####-####'"
            class="input-glass w-full" placeholder="(00) 00000-0000" :class="[errors && errors['TELEFONE FINANCEIRO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['TELEFONE FINANCEIRO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['TELEFONE FINANCEIRO CONTRATANTE'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">E-MAIL FINANCEIRO</label>
          <input type="email" v-model="form['EMAIL FINANCEIRO CONTRATANTE']" class="input-glass w-full"
            placeholder="financeiro@empresa.com" :class="[errors && errors['EMAIL FINANCEIRO CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['EMAIL FINANCEIRO CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['EMAIL FINANCEIRO CONTRATANTE'] }}</span>
        </div>
        <div class="space-y-2 md:col-span-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">LINK INSTAGRAM DO CONTRATANTE</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs font-bold">@</span>
            <input type="text" v-model="form['LINK INSTAGRAM CONTRATANTE']" class="input-glass w-full !pl-8"
              placeholder="Ex: joao_pizzaria (sem o @)" :class="[errors && errors['LINK INSTAGRAM CONTRATANTE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          </div>
          <span v-if="errors && errors['LINK INSTAGRAM CONTRATANTE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['LINK INSTAGRAM CONTRATANTE'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: VALORES E PAGAMENTO -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <DollarSign class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Valores e Pagamento</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR TAXA IMPLEMENTAÇÃO</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs text-brand-cyan font-bold">R$</span>
            <input type="text" v-model="form['VALOR TAXA IMPLEMENTACAO']"
              v-maska="{ mask: '###.###.###,##', tokens: { '#': { pattern: /[0-9]/, repeated: true } }, reversed: true }"
              class="input-glass w-full !pl-10" placeholder="0,00" :class="[errors && errors['VALOR TAXA IMPLEMENTACAO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['VALOR TAXA IMPLEMENTACAO']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['VALOR TAXA IMPLEMENTACAO'] }}</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">VALOR MENSALIDADE</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs text-brand-cyan font-bold">R$</span>
            <input type="text" v-model="form['VALOR MENSALIDADE']"
              v-maska="{ mask: '###.###.###,##', tokens: { '#': { pattern: /[0-9]/, repeated: true } }, reversed: true }"
              class="input-glass w-full !pl-10" placeholder="0,00" :class="[errors && errors['VALOR MENSALIDADE'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['VALOR MENSALIDADE']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['VALOR MENSALIDADE'] }}</span>
          </div>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA PRIMEIRO PAGAMENTO</label>
          <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full"
            placeholder="DD/MM/AAAA" :class="[errors && errors['DATA PRIMEIRO PAGAMENTO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DATA PRIMEIRO PAGAMENTO']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['DATA PRIMEIRO PAGAMENTO'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
          <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="EX: 10" :class="[errors && errors['DIA VENCIMENTO MENSAL'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DIA VENCIMENTO MENSAL']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['DIA VENCIMENTO MENSAL'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: DADOS DO CONTRATO -->
    <div class="space-y-6">
      <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
        <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
          <FileText class="h-5 w-5" />
        </div>
        <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Dados do Contrato</h3>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">PRAZO CONTRATUAL MESES</label>
          <input type="number" v-model="form['PRAZO CONTRATUAL MESES']" class="input-glass w-full" placeholder="12" :class="[errors && errors['PRAZO CONTRATUAL MESES'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['PRAZO CONTRATUAL MESES']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['PRAZO CONTRATUAL MESES'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA ASSINATURA CONTRATO</label>
          <input type="text" v-model="form['DATA ASSINATURA CONTRATO']" v-maska="'##/##/####'"
            class="input-glass w-full" placeholder="DD/MM/AAAA" :class="[errors && errors['DATA ASSINATURA CONTRATO'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['DATA ASSINATURA CONTRATO']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['DATA ASSINATURA CONTRATO'] }}</span>
        </div>
        <!-- Novos campos para Social Media -->
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">QTD ARTES (Se aplicável)</label>
          <input type="text" v-model="form['QTD ARTES']" class="input-glass w-full" placeholder="Ex: 10 ou Ilimitado" :class="[errors && errors['QTD ARTES'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['QTD ARTES']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['QTD ARTES'] }}</span>
        </div>
        <div class="space-y-2">
          <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">QTD VÍDEOS (Se aplicável)</label>
          <input type="text" v-model="form['QTD VIDEOS']" class="input-glass w-full" placeholder="Ex: 4 ou Ilimitado" :class="[errors && errors['QTD VIDEOS'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
          <span v-if="errors && errors['QTD VIDEOS']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['QTD VIDEOS'] }}</span>
        </div>
      </div>
    </div>

    <!-- Seção: TESTEMUNHAS E RESPONSÁVEIS -->
    <div class="space-y-12 pt-6 border-t border-brand-glass-border">
      <!-- Testemunha 1 -->
      <div class="space-y-6">
        <div class="flex items-center gap-3 border-b border-brand-glass-border pb-2">
          <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
            <UserIcon class="h-5 w-5" />
          </div>
          <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Testemunha 1</h3>
          <div class="flex gap-2 ml-auto">
            <button @click="fillWitness('Luís Fernando Mauri Menti', '023.275.400-46')" type="button"
              class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Luís</button>
            <button @click="fillWitness('Natália Selister Piccoli', '013.266.710-06')" type="button"
              class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Natália</button>
            <button @click="fillWitness('', '')" type="button"
              class="text-[9px] px-3 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/20 hover:bg-brand-cyan/10 transition-all text-brand-cyan font-bold uppercase tracking-wider">Vazio</button>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DA TESTEMUNHA</label>
            <input type="text" v-model="form['NOME TESTEMUNHA 1']" class="input-glass w-full"
              placeholder="NOME COMPLETO" :class="[errors && errors['NOME TESTEMUNHA 1'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['NOME TESTEMUNHA 1']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME TESTEMUNHA 1'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DA TESTEMUNHA</label>
            <input type="text" v-model="form['CPF TESTEMUNHA 1']" v-maska="'###.###.###-##'" class="input-glass w-full"
              placeholder="000.000.000-00" :class="[errors && errors['CPF TESTEMUNHA 1'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['CPF TESTEMUNHA 1']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF TESTEMUNHA 1'] }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div class="flex items-center justify-between border-b border-brand-glass-border pb-2">
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
              <UsersIcon class="h-5 w-5" />
            </div>
            <h3 class="text-sm font-black uppercase tracking-[0.2em] text-white/90">Equipe Responsável</h3>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO VENDEDOR</label>
            <input type="text" v-model="form['NOME VENDEDOR']" class="input-glass w-full text-brand-cyan/90 font-medium"
              placeholder="NOME DO VENDEDOR" :class="[errors && errors['NOME VENDEDOR'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['NOME VENDEDOR']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME VENDEDOR'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DO VENDEDOR</label>
            <input type="text" v-model="form['CPF VENDEDOR']" v-maska="'###.###.###-##'" class="input-glass w-full"
              placeholder="000.000.000-00" :class="[errors && errors['CPF VENDEDOR'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['CPF VENDEDOR']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF VENDEDOR'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO COORDENADOR DA BU</label>
            <input type="text" v-model="form['NOME COORD BU']" class="input-glass w-full"
              placeholder="NOME DO COORDENADOR" :class="[errors && errors['NOME COORD BU'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['NOME COORD BU']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME COORD BU'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DO COORDENADOR DA BU</label>
            <input type="text" v-model="form['CPF COORD BU']" v-maska="'###.###.###-##'" class="input-glass w-full"
              placeholder="000.000.000-00" :class="[errors && errors['CPF COORD BU'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['CPF COORD BU']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF COORD BU'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">NOME DO SDR</label>
            <CustomSelect 
              v-model="selectedSDRId"
              :options="sdrOptions"
              placeholder="PESQUISAR SDR"
              searchable
              allow-clear
              variant="form"
              class="w-full"
              :class="[errors && errors['NOME SDR'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']"
            />
            <span v-if="errors && errors['NOME SDR']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['NOME SDR'] }}</span>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">CPF DO SDR</label>
            <input type="text" id="CPF SDR" v-model="form['CPF SDR']" v-maska="'###.###.###-##'" class="input-glass w-full"
              placeholder="000.000.000-00" :class="[errors && errors['CPF SDR'] ? '!border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)] bg-red-500/5' : '']">
            <span v-if="errors && errors['CPF SDR']" class="text-[9px] text-red-500 font-bold mt-1 block">{{ errors['CPF SDR'] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useCep } from '../../../composables/useCep';
import CustomSelect from '../../../components/ui/CustomSelect.vue';
import {
  Building2,
  MapPin,
  User as UserIcon,
  DollarSign,
  FileText,
  Users as UsersIcon,
  Share2
} from 'lucide-vue-next';

const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  },
  sellers: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-sdr-id']);

const { loading: cepLoading, fetchAddress } = useCep();

const selectedSDRId = ref<string | null>(null);

const sdrOptions = computed(() => {
  return (props.sellers as any[])
    .filter(s => s.type === 'sdr')
    .map(s => ({ value: s.id.toString(), label: s.name }));
});

watch(selectedSDRId, (newId) => {
  emit('update-sdr-id', newId);
  if (newId) {
    const sdr = (props.sellers as any[]).find(s => s.id.toString() === newId);
    if (sdr) {
      props.form['NOME SDR'] = sdr.name;
      props.form['CPF SDR'] = sdr.cpf;
    }
  } else {
    props.form['NOME SDR'] = '';
    props.form['CPF SDR'] = '';
  }
});

watch(() => props.form['CEP DO CONTRATANTE'], async (newCep) => {
  if (newCep && newCep.replace(/\D/g, '').length === 8) {
    const address = await fetchAddress(newCep);
    if (address) {
      props.form['LOGRADOURO DO CONTRATANTE'] = address.logradouro;
      props.form['BAIRRO DO CONTRATANTE'] = address.bairro;
      props.form['CIDADE DO CONTRATANTE'] = address.cidade;
      props.form['UF DO CONTRATANTE'] = address.uf;
    }
  }
});

watch(() => props.form['LINK INSTAGRAM CONTRATANTE'], (newVal) => {
  if (newVal && newVal.startsWith('@')) {
    props.form['LINK INSTAGRAM CONTRATANTE'] = newVal.substring(1);
  }
});

const fillWitness = (name: string, cpf: string) => {
  props.form['NOME TESTEMUNHA 1'] = name;
  props.form['CPF TESTEMUNHA 1'] = cpf;
};
</script>

<style scoped>
.input-glass {
  @apply bg-brand-surface border border-brand-glass-border px-4 py-3 rounded-xl text-white placeholder:text-white/10 focus:border-brand-cyan/40 outline-none transition-all;
}
</style>
