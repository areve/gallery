<template>
    <section class="tool-panel"  v-if="panel.settings.visible">
        <h3>App Settings</h3>
        <button type="button" @click="panel.settings.visible = false">Close Settings</button>
        <input type="text" v-model="openAiService.openApiKey.value" />
    </section>

</template>

<script  lang="ts" setup>

import openAiService from '@/services/openAiService';
import { panel } from '@/services/editorAppState';
import { watch } from 'vue';

watch(panel.value, () => {
  if (!panel.value.settings.visible) {
    window.localStorage.setItem('openApiKey', openAiService.openApiKey.value)
  }
})

</script>

<style scoped>

.tool-panel {
  margin: 0.4em;
}

.tool-panel h3 {
  display: none;
}
</style>