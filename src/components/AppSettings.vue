<template>
  <section class="tool-panel" v-if="panelsVisibleState.settings">
    <h3>App Settings</h3>
    <button type="button" @click="panelsVisibleState.settings = false">
      Close Settings
    </button>
    <input type="text" v-model="openAiService.config.value.openApiKey" />
  </section>
</template>

<script lang="ts" setup>
import { panelsVisibleState } from "@/states/panelsVisibleState"
import openAiService from "@/components/OpenAi/openAiService";
</script>

<style scoped>
.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>
