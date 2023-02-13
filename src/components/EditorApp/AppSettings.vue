<template>
  <section
    class="panel"
    v-if="panelStates.settings.visible"
    :class="{ docked: panelStates.settings.docked }"
  >
    <div class="panel-titlebar">
      <h1 class="title">App Settings</h1>
      <button
        class="icon-button"
        type="button"
        @click="panelStates.settings.docked = !panelStates.settings.docked"
      >
        <i v-if="panelStates.settings.docked" class="fa-solid fa-lock"></i>
        <i v-else class="fa-solid fa-lock-open"></i>
        <span class="text">Dock/Undock</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="panelStates.settings.rolled = !panelStates.settings.rolled"
      >
        <i v-if="panelStates.settings.rolled" class="fa-solid fa-caret-up"></i>
        <i v-else class="fa-solid fa-caret-down"></i>
        <span class="text">Rollup</span>
      </button>
      <button
        class="icon-button"
        type="button"
        @click="panelStates.settings.visible = false"
      >
        <i class="fa-solid fa-close"></i>
        <span class="text">Close</span>
      </button>
    </div>
    <div class="panel-main" :class="{ rolled: panelStates.settings.rolled }">
      <label for="openIdKey">Open API key</label>
      <input
        id="openIdKey"
        type="text"
        v-model="openAiService.config.value.openApiKey"
      />
    </div>
  </section>
</template>

<script lang="ts" setup>
import { panelStates } from "@/components/EditorApp/panelStates";
import openAiService from "@/components/OpenAi/openAiService";
</script>

<style scoped>
.panel {
  position: absolute;
  left: 100px;
  top: 100px;
  background-color: #e7e7e7;
}

.panel-titlebar {
  background-color: #d0d0d0;
  text-align: right;
  padding: 0.25em;
}

.panel-titlebar .title {
  font-size: 1rem;
  font-weight: normal;
  float: left;
  margin-right: 1em;
  margin-left: 0.5em;
}

.icon-button {
  border-radius: 0;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background-color: #d0d0d0;
}
.icon-button .text {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  top: -10000px;
}

.panel.docked {
  position: initial;
}
.rolled {
  display: none;
}
</style>
