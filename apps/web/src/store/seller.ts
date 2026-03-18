import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getSellers } from '../gen/hooks/getSellers';
import { putSellersId } from '../gen/hooks/putSellersId';
import client from '../api/client';
import type { Sellers } from '../gen/types/Sellers';

export const useSellerStore = defineStore('seller', () => {
  const teamSellers = ref<Sellers[]>([]);
  const allSellers = ref<Sellers[]>([]);
  const loading = ref(false);

  async function fetchTeamSellers(headId: string) {
    loading.value = true;
    try {
      const sellers = await getSellers({ head_id: headId }, { client });
      teamSellers.value = sellers as Sellers[];
    } catch (error) {
      console.error('Erro ao buscar equipe:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllSellers() {
    loading.value = true;
    try {
      // Busca todos os usuários para que Admin possa gerenciar todos os cargos corretamente
      const sellers = await getSellers({}, { client });
      allSellers.value = sellers as Sellers[];
    } catch (error) {
      console.error('Erro ao buscar todos os vendedores:', error);
    } finally {
      loading.value = false;
    }
  }

  async function updateSeller(id: string | number, data: Partial<Sellers>) {
    loading.value = true;
    try {
      await putSellersId(id as any, { data: data as Sellers }, { client });
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar vendedor:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  return {
    teamSellers,
    allSellers,
    loading,
    fetchTeamSellers,
    fetchAllSellers,
    updateSeller
  };
});
