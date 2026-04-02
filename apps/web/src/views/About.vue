<template>
  <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12 text-center">
    <InfoIcon class="mx-auto h-12 w-12 text-indigo-500 mb-4" />
    <h2 class="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">About Page</h2>
    <p class="mx-auto mt-4 max-w-xl text-lg leading-8 text-gray-600">
      This is a simple About page to test the Vue Router functionality.
    </p>
  </div>
</template>

<script setup lang="ts">
  import { InfoIcon } from '@lucide/vue'
</script>
