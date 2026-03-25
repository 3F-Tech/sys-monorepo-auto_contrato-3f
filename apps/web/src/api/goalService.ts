import client from './client';

export interface Goal {
  id: number;
  target_type: 'seller' | 'head' | 'team' | 'bu';
  target_id: string;
  p1: number | null;
  p1_period_1: number | null;
  p1_period_2: number | null;
  p1_period_3: number | null;
  p1_period_4: number | null;
  tcv: number | null;
  nmrr: number | null;
  implementation: number | null;
  monthly: number | null;

  month: number;
  year: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GoalInput {
  target_type: 'seller' | 'head' | 'team' | 'bu';
  target_id: string | number;
  month: number;
  year: number;
  p1?: number | null;
  p1_period_1?: number | null;
  p1_period_2?: number | null;
  p1_period_3?: number | null;
  p1_period_4?: number | null;
  tcv?: number | null;
  nmrr?: number | null;
  implementation?: number | null;
  monthly?: number | null;

}

export const goalService = {
  getGoals(month?: number, year?: number) {
    const params: any = {};
    if (month) params.month = month;
    if (year) params.year = year;
    return client.get<Goal[]>('/goals', { params });
  },

  upsertGoal(data: GoalInput) {
    return client.post<Goal>('/goals', data);
  },

  deleteGoal(id: number) {
    return client.delete<{ message: string; id: number }>(`/goals/${id}`);
  }
};
