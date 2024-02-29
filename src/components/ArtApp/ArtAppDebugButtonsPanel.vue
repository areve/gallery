<template>
  <DockPanel title="Debug" v-model:panelState="artAppDebugButtonsPanelState">
    <button type="button" @click="signOut">Sign out</button>
    <button type="button" @click="refreshTokens">Refresh tokens</button>
    <button type="button" @click="toggleFps">Toggle FPS</button>
    <button type="button" @click="loadDefaultGallery">Load gallery</button>
    <button type="button" @click="update" :disabled="!appState.updateAvailable">Update</button>
    <div class="version">v{{ appState.appVersion }}</div>
    {{ googleAuthState.expiresAt }}
  </DockPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "./artAppState";
import { signOut, refreshTokens } from "@/lib/Google/GoogleAuth";
import type { PanelState } from "../DockPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import DockPanel from "@/components/DockPanel/DockPanel.vue";
import { appState } from "@/appState";
import { googleAuthState } from "@/lib/Google/googleAuthState";
import { loadDefaultGallery } from "../Gallery/galleryService";

const artAppDebugButtonsPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("artAppDebugButtonsPanelState", artAppDebugButtonsPanelState);

googleAuthState;
const toggleFps = () => (artAppState.value.showFps = !artAppState.value.showFps);
function update() {
  appState.value.updateApproved = true;
}
</script>

<style scoped>
.version {
  text-align: right;
}
</style>
