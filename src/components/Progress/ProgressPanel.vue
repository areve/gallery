<template>
  <div v-if="showProgress" class="progress-panel">
    <label for="background">{{ progressState.error || progressState.message }}</label>
    <progress id="background" :value="progressState.value" :max="progressState.max">{{ progressState.value }}</progress>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { progressState } from "./progressState";

const showProgress = computed(() => {
  return !!progressState.value.error || progressState.value.max != progressState.value.value;
});
</script>

<style scoped>
.progress-panel {
  position: fixed;
  top: 0;
  width: 100%;
  background-color: rgb(0, 0, 0, 0.5);
  z-index: 100;
  user-select: none;
  display: flex;
  flex-direction: column-reverse;
  opacity: 1;
}
progress {
  appearance: none;
  width: 100%;
  color: #9f9;
  opacity: 0.5;
  height: 0.5em;
  margin: 0;
  padding: 0;
  border-width: 0;
  border-radius: 0;
}

label {
  font-size: 0.8em;
  line-height: 1em;
  text-align: center;
  padding: 0.2em;
  margin: 0;
  min-height: 0;
}
</style>
