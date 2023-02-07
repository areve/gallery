<script setup lang="ts">
import { RouterView } from "vue-router";
</script>

<template>
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
