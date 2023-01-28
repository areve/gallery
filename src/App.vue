<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <!-- <header class="header">
      <nav>
        <RouterLink to="/">Gallery</RouterLink>
        <RouterLink to="/editor">Editor</RouterLink>
      </nav>
  </header> -->
  <div class="router-wrapper">
    <RouterView />
  </div>
</template>

<style>

*[hidden] {
    display: none !important;
}

.router-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
