<template>
  ArtAppDebugButtonsPanel
  <div :hidden="!showDebugButtons">
    <hr />
    debug buttons
    <button type="button" @click="signOut">Sign out</button>
    <button type="button" @click="refreshTokens">Refresh tokens</button>
    <button type="button" @click="toggleFps">Toggle FPS</button>
  </div>
  <button type="button" @click="toggleDebug">{{ showDebugButtons ? "Hide" : "Show" }} debug</button>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "./artAppState";
import { signOut, refreshTokens } from "@/lib/Google/GoogleAuth";

const showDebugButtons = ref<boolean>(false);

const toggleFps = () => (artAppState.value.showFps = !artAppState.value.showFps);
const toggleDebug = () => (showDebugButtons.value = !showDebugButtons.value);
</script>

<style scoped></style>
