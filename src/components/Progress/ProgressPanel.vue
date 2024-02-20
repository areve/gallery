<template>
  <div
    v-if="showProgress"
    class="progress-panel"
    :class="{
      error: isError,
    }"
  >
    <label for="background">{{ progressState.error || progressState.message }}</label>
    <progress id="background" :value="progressState.completedSteps" :max="progressState.totalSteps">{{ progressState.completedSteps }}</progress>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { progressState } from "./progressState";

const showProgress = computed(() => {
  return !!progressState.value.error || progressState.value.totalSteps != progressState.value.completedSteps;
});
const isError = computed(() => {
  return !!progressState.value.error;
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
.progress-panel.error {
  background-color: rgb(255, 0, 0, 0.8);
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
