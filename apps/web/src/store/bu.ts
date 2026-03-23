import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getBusiness } from '../gen/hooks/getBusiness';
import type { Business } from '../gen/types/Business';
import client from '../api/client';

export const useBuStore = defineStore('bu', () => {
  const businesses = ref<Business[]>([]);
  const loading = ref(false);

  async function fetchBusinesses() {
    loading.value = true;
    try {
      const data = await getBusiness({ client });
      businesses.value = data as Business[];
    } catch (error) {
      console.error('Erro ao buscar BUs:', error);
    } finally {
      loading.value = false;
    }
  }

  return {
    businesses,
    loading,
    fetchBusinesses
  };
});
