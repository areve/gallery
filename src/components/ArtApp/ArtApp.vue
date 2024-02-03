<template>
  <main class="art-app">
    <ArtboardPanel />
  </main>
</template>

<script lang="ts" setup>
import ArtboardPanel from "@/components/ArtboardPanel/ArtboardPanel.vue";
</script>

<style scoped>
.art-app {
  flex: 1 0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: row;
}
</style>
