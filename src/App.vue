<script setup lang="ts">
import ArtApp from "@/components/ArtApp/ArtApp.vue";
import ReloadPrompt from "@/components/ReloadPrompt/ReloadPrompt.vue";
</script>

<template>
  <div class="app-wrapper">
    <ArtApp />
  </div>
  <ReloadPrompt />
</template>

<style>
*[hidden] {
  display: none !important;
}

.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: row;
  touch-action: none;
}
</style>
