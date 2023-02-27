<script setup lang="ts">
import EditorApp from "./components/EditorApp/EditorApp.vue";
import GoogleLogin from "./components/GoogleLogin.vue";
</script>

<template>
  <div class="app-wrapper">
    <!-- <EditorApp /> -->
    <GoogleLogin />
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
  touch-action: none;
}
</style>
