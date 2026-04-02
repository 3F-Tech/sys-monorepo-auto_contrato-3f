<template>
  <div class="min-h-screen bg-brand-deep">
    <router-view />
    <ToastProvider />
  </div>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router'
  import ToastProvider from './components/ui/ToastProvider.vue'

  const route = useRoute()
</script>
