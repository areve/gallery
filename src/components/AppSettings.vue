<template>
    <section class="tool-panel"  v-if="panel.settings.visible">
        <h3>App Settings</h3>
        <button type="button" @click="panel.settings.visible = false">Close Settings</button>
        <input type="text" v-model="openAiService.openApiKey.value" />
    </section>

</template>

<script  lang="ts" setup>

import openAiService from '@/services/openAiService';
import { panel } from '@/services/panelState';
import { watch } from 'vue';

watch(panel.value, () => {
  console.log(panel.value.settings.visible)
  if (!panel.value.settings.visible) {
    console.log('save', openAiService.openApiKey.value)
    window.localStorage.setItem('openApiKey', openAiService.openApiKey.value)
  }
})

</script>

<style scoped>
</style>