<template>
  <AppWindow title="App Settings" v-model:panelState="panelStates.settings">
    <label for="openIdKey">Open API key</label>
    <input id="openIdKey" type="text" v-model="openAiService.config.value.openApiKey" />
  </AppWindow>
</template>

<script lang="ts" setup>
import { panelStates } from "@/components/EditorApp/panelStates";
import openAiService from "@/components/OpenAi/openAiService";
import AppWindow from "../AppWindow/AppWindow.vue";
</script>

<style scoped></style>
