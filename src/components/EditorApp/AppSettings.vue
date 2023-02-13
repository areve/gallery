<template>
  <ToolPanel
    title="App Settings"
    :panelState="panelStates.settings"
    @update:rolled="(value) => (panelStates.settings.rolled = value)"
    @update:docked="(value) => (panelStates.settings.docked = value)"
    @update:visible="(value) => (panelStates.settings.visible = value)"
  >
    <label for="openIdKey">Open API key</label>
    <input
      id="openIdKey"
      type="text"
      v-model="openAiService.config.value.openApiKey"
    />
  </ToolPanel>
</template>

<script lang="ts" setup>
import { panelStates } from "@/components/EditorApp/panelStates";
import openAiService from "@/components/OpenAi/openAiService";
import ToolPanel from "../ToolPanel/ToolPanel.vue";
</script>

<style scoped></style>
