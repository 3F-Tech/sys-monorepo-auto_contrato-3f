import { defineStore } from 'pinia';
import { goalService, type Goal, type GoalInput } from '../api/goalService';

export const useGoalStore = defineStore('goals', {
  state: () => ({
    goals: [] as Goal[],
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    getGoalByTarget: (state) => (type: string, id: string | number) => {
      return state.goals.find(g => g.target_type === type && g.target_id.toString() === id.toString());
    }
  },

  actions: {
    async fetchGoals(month?: number, year?: number) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await goalService.getGoals(month, year);
        this.goals = response.data;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Falha ao buscar metas';
        console.error('Error fetching goals:', err);
      } finally {
        this.isLoading = false;
      }
    },

    async saveGoal(goalInput: GoalInput) {
      this.error = null;
      try {
        const response = await goalService.upsertGoal(goalInput);
        const newGoal = response.data;
        
        const index = this.goals.findIndex(g => 
          g.target_type === newGoal.target_type && 
          g.target_id.toString() === newGoal.target_id.toString() &&
          g.month === newGoal.month &&
          g.year === newGoal.year
        );

        if (index !== -1) {
          this.goals[index] = newGoal;
        } else {
          this.goals.push(newGoal);
        }
        return newGoal;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Falha ao salvar meta';
        throw err;
      }
    },

    async deleteGoal(id: number) {
      this.error = null;
      try {
        await goalService.deleteGoal(id);
        this.goals = this.goals.filter(g => g.id !== id);
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Falha ao excluir meta';
        throw err;
      }
    }
  }
});
