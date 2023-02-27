<script setup lang="ts">
import EditorApp from "./components/EditorApp/EditorApp.vue";
import { authState } from "./components/google-auth";
import GoogleLogin from "./components/GoogleLogin.vue";


</script>

<template>
  <div class="app-wrapper">
    <GoogleLogin />
    <EditorApp v-if="authState.state === 'signed_in'" />
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
