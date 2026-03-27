import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getContracts } from '../gen/hooks/getContracts';
import { getContractsSellerSellerid } from '../gen/hooks/getContractsSellerSellerid';
import { getContractsHeadHeadid } from '../gen/hooks/getContractsHeadHeadid';
import { getContractsBuBuid } from '../gen/hooks/getContractsBuBuid';
import { putContractsId } from '../gen/hooks/putContractsId';
import { deleteContractsId } from '../gen/hooks/deleteContractsId';
import client from '../api/client';
import type { Contracts } from '../gen/types/Contracts';

export const useContractStore = defineStore('contract', () => {
  const myContracts = ref<Contracts[]>([]);
  const loading = ref(false);

  async function fetchMyContracts(sellerId: string) {
    loading.value = true;
    try {
      const contracts = await getContractsSellerSellerid(sellerId, { client });
      myContracts.value = (contracts as Contracts[]) || [];
    } catch (error) {
      console.error('Erro ao buscar meus contratos:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchAllContracts() {
    loading.value = true;
    try {
      const contracts = await getContracts({ client });
      myContracts.value = (contracts as Contracts[]) || [];
    } catch (error) {
      console.error('Erro ao buscar todos os contratos:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchTeamContracts(headId: string) {
    loading.value = true;
    try {
      const contracts = await getContractsHeadHeadid(headId, { client });
      myContracts.value = (contracts as Contracts[]) || [];
    } catch (error) {
      console.error('Erro ao buscar contratos da equipe:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchBUContracts(buId: string | number) {
    loading.value = true;
    try {
      const contracts = await getContractsBuBuid(Number(buId), { client });
      myContracts.value = (contracts as Contracts[]) || [];
    } catch (error) {
      console.error('Erro ao buscar contratos da BU:', error);
    } finally {
      loading.value = false;
    }
  }

  async function fetchMultipleBUContracts(buIds: number[]) {
    loading.value = true;
    try {
      const results = await Promise.all(
        buIds.map(id => getContractsBuBuid(id, { client }))
      );
      // Achata os resultados de todas as BUs em um único array
      myContracts.value = results.flat() as Contracts[];
    } catch (error) {
      console.error('Erro ao buscar múltiplos contratos de BUs:', error);
    } finally {
      loading.value = false;
    }
  }

  async function updateContract(id: string | number, data: Partial<Contracts>) {
    loading.value = true;
    try {
      await putContractsId(id.toString(), {
        signed: data.signed,
        signed_date: data.signed_date,
        created_at: data.created_at,
        link: data.link,
        change_status: data.change_status,
        change_description: data.change_description
      }, { client });
      
      const index = myContracts.value.findIndex(c => c.id?.toString() === id.toString());
      if (index !== -1) {
        myContracts.value[index] = { ...myContracts.value[index], ...data };
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function deleteContract(id: string | number) {
    loading.value = true;
    try {
      await deleteContractsId(id.toString(), { client });
      myContracts.value = myContracts.value.filter(c => c.id !== id && c.id?.toString() !== id.toString());
      return { success: true };
    } catch (error) {
      console.error('Erro ao excluir contrato:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  return {
    myContracts,
    loading,
    fetchMyContracts,
    fetchAllContracts,
    fetchTeamContracts,
    fetchBUContracts,
    fetchMultipleBUContracts,
    updateContract,
    deleteContract
  };
});
