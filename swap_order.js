const fs = require('fs');
const path = require('path');

const files = [
  'apps/web/src/views/contracts/steps/ImpulsePlano1.vue',
  'apps/web/src/views/contracts/steps/ImpulsePlano2.vue',
  'apps/web/src/views/contracts/steps/SeedPlano1.vue',
  'apps/web/src/views/contracts/steps/SeedPlano2.vue',
  'apps/web/src/views/contracts/steps/SeedPlanoGrowth.vue'
];

files.forEach(f => {
  const p = path.join('C:/Projects/automacao_contratos', f);
  let content = fs.readFileSync(p, 'utf8');

  // isencao_terceira has P1 now between MENSALIDADE and DATA 1 PAGAMENTO, so DATA 1 and DIA VENCIMENTO are contiguous.
  // We can just find all instances of DATA ... followed by DIA VENCIMENTO ...
  // Since spacing can vary, let's just do it directly.

  const blocks = [
    {
      find: `<div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
                <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
                <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
              </div>`,
      replace: `<div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
                <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
              </div>
              <div class="space-y-2">
                <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
                <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
              </div>`
    },
    {
      find: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>
            <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>`,
      replace: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>
            <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>`
    },
    {
      find: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA DA ENTRADA</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>
            <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO DAS PARCELAS</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>`,
      replace: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO DAS PARCELAS</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>
            <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA DA ENTRADA</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>`
    },
    {
      find: `<div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>`,
      replace: `<div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>`
    },
    {
      find: `<div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA DA ENTRADA</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO DAS PARCELAS</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>`,
      replace: `<div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO DAS PARCELAS</label>
              <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA DA ENTRADA</label>
              <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
            </div>`
    },
    {
      find: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
                <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
              </div>
              <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
                <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
              </div>`,
      replace: `<div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DIA VENCIMENTO MENSAL</label>
                <input type="number" v-model="form['DIA VENCIMENTO MENSAL']" min="1" max="31" class="input-glass w-full" placeholder="Ex: 10" />
              </div>
              <div class="space-y-2"><label class="text-[10px] font-bold text-white/40 uppercase tracking-widest">DATA 1º PAGAMENTO</label>
                <input type="text" v-model="form['DATA PRIMEIRO PAGAMENTO']" v-maska="'##/##/####'" class="input-glass w-full" placeholder="DD/MM/AAAA" />
              </div>`
    }
  ];

  let prevContent = content;
  blocks.forEach(block => {
    // Replace all occurrences using split and join to ensure exact match ignoring multiple instances if they somehow exist exactly
    content = content.split(block.find).join(block.replace);
  });
  
  if (prevContent !== content) {
    fs.writeFileSync(p, content);
    console.log('Updated', f);
  } else {
    console.log('No matches in', f);
  }
});
