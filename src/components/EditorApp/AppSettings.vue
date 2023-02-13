<template>
  <section class="tool-panel" v-if="panelStates.settings">
    <div class="panel-titlebar">
      <h1>App Settings</h1>
      <button type="button" @click="panelStates.settings.visible = false">
        Close
      </button>
      <button type="button" @click="panelStates.settings.visible = false">
        Dock/Undock
      </button>
      <button type="button" @click="panelStates.settings.visible = false">
        Rollup
      </button>
    </div>
    <label for="openIdKey">Open API key</label>
    <input
      id="openIdKey"
      type="text"
      v-model="openAiService.config.value.openApiKey"
    />
  </section>
</template>

<script lang="ts" setup>
import { panelStates } from "@/components/EditorApp/panelStates";
import openAiService from "@/components/OpenAi/openAiService";
</script>

<style scoped></style>
