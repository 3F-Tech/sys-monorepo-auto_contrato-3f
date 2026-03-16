<template>
  <div class="min-h-screen w-full flex bg-[#0d1b2a]">

    <!-- Left Panel: Brand & Visual Identity -->
    <div class="hidden lg:flex flex-col justify-between w-[60%] relative overflow-hidden px-16 py-14">

      <!-- Top: Logo + Brand Name -->
      <div class="absolute left-[2vh] bottom-[3vh] z-10 flex items-center gap-3">
        <img src="../assets/3F/3fventure-logo.jpg" alt="3F Venture" class="h-11 w-11 rounded-lg opacity-90" />
        <span class="text-white/70 font-semibold tracking-widest text-md uppercase">3F Venture</span>
      </div>

      <!-- Center: Main brand block -->
      <div class="absolute top-[3vh] left-[3vh] z-10 flex flex-col">
        <h1 class="text-white text-[3.3rem] leading-[1.1] font-black tracking-tight">
          Métricas e<br />controle dos<br /><span style="color: #00d4ff;">seus contratos.</span>
        </h1>
      </div>
      <div class="w-full h-[45vh]">
        <img class="absolute bottom-0 left-0 w-full h-[110vh] object-cover"
          src="../assets/Blog-Assinei_Assinatura-digital-de-contratos_Creditos-Shutterstock-scaled.webp" alt=""
          srcset="">
      </div>
    </div>

    <!-- Right Panel: Login Form -->
    <div class="flex-1 flex flex-col px-10 py-12 relative bg-brand-offset">
      <LoginForm />
    </div>

  </div>
</template>

<script setup lang="ts">
import LoginForm from '../components/auth/LoginForm.vue';
</script>
