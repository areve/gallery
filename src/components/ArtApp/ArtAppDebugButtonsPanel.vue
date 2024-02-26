<template>
  <RollupPanel title="Debug" v-model:panelState="artAppDebugButtonsPanelState">
    <button type="button" @click="signOut">Sign out</button>
    <button type="button" @click="refreshTokens">Refresh tokens</button>
    <button type="button" @click="toggleFps">Toggle FPS</button>
    <button type="button" @click="update" :disabled="!appState.updateAvailable">Update</button>
    <div class="version">v{{ appState.appVersion }}</div>
    {{ googleAuthState.expiresAt }}
  </RollupPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "./artAppState";
import { signOut, refreshTokens } from "@/lib/Google/GoogleAuth";
import type { PanelState } from "../RollupPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import RollupPanel from "@/components/RollupPanel/RollupPanel.vue";
import { appState } from "@/appState";
import { googleAuthState } from "@/lib/Google/googleAuthState";

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
