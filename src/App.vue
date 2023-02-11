<script setup lang="ts">
import EditorApp from "./components/EditorApp.vue";
</script>

<template>
  <div class="app-wrapper">
    <EditorApp />
  </div>
</template>

<style>
*[hidden] {
  display: none !important;
}

.app-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
