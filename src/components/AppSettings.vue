<template>
  <section class="tool-panel" v-if="editorAppState.settingsPanelVisible">
    <h3>App Settings</h3>
    <button type="button" @click="editorAppState.settingsPanelVisible = false">
      Close Settings
    </button>
    <input type="text" v-model="openAiService.config.value.openApiKey" />
  </section>
</template>

<script lang="ts" setup>
import { editorAppState } from "@/services/editorAppState";
import openAiService from "@/services/openAiService";
</script>

<style scoped>
.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>
