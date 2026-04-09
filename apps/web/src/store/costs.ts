import { defineStore } from 'pinia';
import { getCommercialCosts } from '../gen/hooks/getCommercialCosts';
import { postCommercialCosts } from '../gen/hooks/postCommercialCosts';
import client from '../api/client';

export interface CommercialCostMember {
  id?: number;
  type: 'SDR' | 'CLOSER';
  value: number;
}

export interface CommercialCosts {
  id?: number;
  month: number;
  year: number;
  bu_id?: number | string | null;
  media_investment?: number;
  commercial_tools?: number;
  remuneration_coord?: number;
  referral_commission?: number;
  members?: CommercialCostMember[];
  items?: CommercialCosts[];
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
      const base = (
        (Number(c.media_investment) || 0) +
        (Number(c.commercial_tools) || 0) +
        (Number(c.remuneration_coord) || 0) +
        (Number(c.referral_commission) || 0)
      );
      const membersTotal = (c.members || []).reduce((acc, m) => acc + (Number(m.value) || 0), 0);
      return base + membersTotal;
    }
  },

  actions: {
    async fetchCosts(month: number, year: number, buId?: number | string | null) {
      this.loading = true;
      try {
        const params: any = { month, year };
        if (buId !== undefined && buId !== null) params.bu_id = buId;
        const data = await getCommercialCosts({ params, client });
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
