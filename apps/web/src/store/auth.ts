import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { postLogin } from '../gen/hooks/postLogin';
import client from '../api/client';
import type { Sellers } from '../gen/types/Sellers';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<Sellers | null>(
    localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
  );
  const token = ref<string | null>(localStorage.getItem('token'));
  
  const isAuthenticated = computed(() => !!token.value);
  const userRole = computed(() => user.value?.type || 'seller');

  async function login(email: string, password: string) {
    try {
      const response = await postLogin({ email, password }, { client });
      const { user: userData, token: userToken } = response as any;
      
      user.value = userData as Sellers;
      token.value = userToken;
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', userToken);
      
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 'Erro ao realizar login' 
      };
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  function updateUser(newData: Partial<Sellers>) {
    if (user.value) {
      user.value = { ...user.value, ...newData };
      localStorage.setItem('user', JSON.stringify(user.value));
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    userRole,
    login,
    logout,
    updateUser
  };
});
