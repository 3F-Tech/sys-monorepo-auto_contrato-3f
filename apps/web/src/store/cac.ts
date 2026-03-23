import { defineStore } from 'pinia';
import { getCac } from '../gen/hooks/getCac';
import { postCac } from '../gen/hooks/postCac';
import client from '../api/client';

export interface BuCac {
  bu_id: number;
  bu_name: string;
  amount: number;
  is_inherited: boolean;
  month: number;
  year: number;
}

export const useCacStore = defineStore('cac', {
  state: () => ({
    cacValues: [] as BuCac[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    totalCac: (state) => {
      const validCacs = state.cacValues.filter(m => {
        const name = m.bu_name?.toLowerCase() || '';
        return !(name.includes('3f') || name.includes('group') || name.includes('venture'));
      });
      if (validCacs.length === 0) return 0;
      const sum = validCacs.reduce((acc, m) => acc + (Number(m.amount) || 0), 0);
      return sum / validCacs.length;
    },
    getBuCac: (state) => (buId: number) => {
      // @ts-ignore
      return state.cacValues.find(m => Number(m.bu_id) === Number(buId));
    }
  },

  actions: {
    async fetchCac(month: number, year: number) {
      this.loading = true;
      try {
        const data = await getCac({ params: { month, year }, client });
        this.cacValues = data as BuCac[];
      } catch (err: any) {
        this.error = 'Falha ao buscar indicadores de CAC';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async saveCac(buId: number, amount: number, month: number, year: number) {
      try {
        // @ts-ignore
        await postCac({ data: { bu_id: buId, amount, month, year }, client });
        await this.fetchCac(month, year);
      } catch (err: any) {
        this.error = 'Falha ao salvar valor de CAC';
        throw err;
      }
    }
  }
});
