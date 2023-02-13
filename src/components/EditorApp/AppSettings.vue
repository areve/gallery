<template>
  <section class="tool-panel" v-if="panelsVisibleState.settings">
    <div class="panel-titlebar">
      <h1>App Settings</h1>
      <button type="button" @click="panelsVisibleState.settings = false">
        Close
      </button>
      <button type="button" @click="panelsVisibleState.settings = false">
        Dock/Undock
      </button>
      <button type="button" @click="panelsVisibleState.settings = false">
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
import { panelsVisibleState } from "@/components/EditorApp/panelsVisibleState";
import openAiService from "@/components/OpenAi/openAiService";
</script>

<style scoped></style>
