import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import Home from '../views/Home.vue';
import LoginView from '../views/LoginView.vue';
import UsersView from '../views/admin/UsersView.vue';
import BusinessView from '../views/admin/BusinessView.vue';
import ContractFlow from '../views/contracts/ContractFlow.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true }
    },
    {
      path: '/admin/users',
      name: 'admin-users',
      component: UsersView,
      meta: { managementOnly: true }
    },
    {
      path: '/admin/business',
      name: 'admin-business',
      component: BusinessView,
      meta: { adminOnly: true }
    },
    {
      path: '/contratos/novo',
      name: 'new-contract',
      component: ContractFlow
    }
  ],
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  const isManagement = ['admin', 'head', 'coord'].includes(authStore.userRole);

  if (!to.meta.public && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.adminOnly && authStore.userRole !== 'admin') {
    next('/');
  } else if (to.meta.managementOnly && !isManagement) {
    next('/');
  } else if (to.meta.public && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;
