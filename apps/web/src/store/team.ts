import { defineStore } from 'pinia';
import { ref } from 'vue';
import client from '../api/client';

export interface Team {
  id: number;
  name: string;
  photo_url?: string;
  description?: string;
  head_id: string;
  sellers_sellers_team_idToteams?: any[];
}

export const useTeamStore = defineStore('team', () => {
  const teams = ref<Team[]>([]);
  const loading = ref(false);

  async function fetchTeams() {
    loading.value = true;
    try {
      const response = await client.get('/teams');
      teams.value = response.data;
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
    } finally {
      loading.value = false;
    }
  }

  async function createTeam(data: Partial<Team>) {
    loading.value = true;
    try {
      const response = await client.post('/teams', data);
      await fetchTeams();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao criar equipe:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function updateTeam(id: number, data: Partial<Team>) {
    loading.value = true;
    try {
      const response = await client.put(`/teams/${id}`, data);
      await fetchTeams();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erro ao atualizar equipe:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function deleteTeam(id: number) {
    loading.value = true;
    try {
      await client.delete(`/teams/${id}`);
      await fetchTeams();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar equipe:', error);
      return { success: false, error };
    } finally {
      loading.value = false;
    }
  }

  async function addMember(teamId: number, sellerId: string) {
    try {
      await client.post(`/teams/${teamId}/members`, { sellerId });
      await fetchTeams();
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar membro:', error);
      return { success: false, error };
    }
  }

  async function removeMember(teamId: number, sellerId: string) {
    try {
      await client.delete(`/teams/${teamId}/members/${sellerId}`);
      await fetchTeams();
      return { success: true };
    } catch (error) {
      console.error('Erro ao remover membro:', error);
      return { success: false, error };
    }
  }

  return {
    teams,
    loading,
    fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember
  };
});
