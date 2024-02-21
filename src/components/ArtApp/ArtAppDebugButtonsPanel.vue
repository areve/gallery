<template>
  <RollupPanel title="Debug" v-model:panelState="artAppDebugButtonsPanelState">
    <button type="button" @click="signOut">Sign out</button>
    <button type="button" @click="refreshTokens">Refresh tokens</button>
    <button type="button" @click="toggleFps">Toggle FPS</button>
  </RollupPanel>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { artAppState } from "./artAppState";
import { signOut, refreshTokens } from "@/lib/Google/GoogleAuth";
import type { PanelState } from "../RollupPanel/PanelState";
import { usePersistentState } from "@/lib/PersistentState";
import RollupPanel from "@/components/RollupPanel/RollupPanel.vue";
const artAppDebugButtonsPanelState = ref<PanelState>({
  rolled: true,
});
usePersistentState("artAppDebugButtonsPanelState", artAppDebugButtonsPanelState);

const toggleFps = () => (artAppState.value.showFps = !artAppState.value.showFps);
</script>

<style scoped></style>
