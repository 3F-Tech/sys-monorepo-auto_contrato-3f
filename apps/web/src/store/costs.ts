import { defineStore } from 'pinia';
import { getCommercialCosts } from '../gen/hooks/getCommercialCosts';
import { postCommercialCosts } from '../gen/hooks/postCommercialCosts';
import client from '../api/client';

export interface CommercialCosts {
  id?: number;
  month: number;
  year: number;
  media_investment?: number;
  commercial_tools?: number;
  remuneration_pre_sales_1?: number;
  remuneration_pre_sales_2?: number;
  remuneration_closer_1?: number;
  remuneration_closer_2?: number;
  remuneration_coord?: number;
  referral_commission?: number;
}

export const useCostsStore = defineStore('costs', {
  state: () => ({
    currentCosts: null as CommercialCosts | null,
    loading: false,
    error: null as string | null,
  }),

  getters: {
    totalCommercialCosts: (state) => {
      if (!state.currentCosts) return 0;
      const c = state.currentCosts;
      return (
        (Number(c.media_investment) || 0) +
        (Number(c.commercial_tools) || 0) +
        (Number(c.remuneration_pre_sales_1) || 0) +
        (Number(c.remuneration_pre_sales_2) || 0) +
        (Number(c.remuneration_closer_1) || 0) +
        (Number(c.remuneration_closer_2) || 0) +
        (Number(c.remuneration_coord) || 0) +
        (Number(c.referral_commission) || 0)
      );
    }
  },

  actions: {
    async fetchCosts(month: number, year: number) {
      this.loading = true;
      try {
        const data = await getCommercialCosts({ params: { month, year }, client });
        this.currentCosts = data as CommercialCosts;
      } catch (err: any) {
        this.error = 'Falha ao buscar indicadores de custos';
        console.error(err);
      } finally {
        this.loading = false;
      }
    },

    async saveCosts(costs: CommercialCosts) {
      this.loading = true;
      try {
        // @ts-ignore
        await postCommercialCosts({ data: { ...costs }, client });
        await this.fetchCosts(costs.month, costs.year);
      } catch (err: any) {
        this.error = 'Falha ao salvar indicadores de custos';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  }
});
