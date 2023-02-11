<script setup lang="ts">
import EditorApp from "./components/EditorApp.vue";
</script>

<template>
  <div class="router-wrapper">
    <EditorApp />
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
