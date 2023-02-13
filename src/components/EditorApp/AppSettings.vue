<template>
  <ToolPanel
    title="App Settings"
    v-model:rolled="panelStates.settings.rolled"
    v-model:visible="panelStates.settings.visible"
    v-model:docked="panelStates.settings.docked"
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
