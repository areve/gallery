<template>
  <div class="notify-panel" :hidden="!showProgress">
    <div
      class="progress"
      :class="{
        error: isError,
      }"
    >
      <div
        class="progress-bar"
        :style="{
          width: widthPercent,
        }"
      >
        {{ notifyState.error || notifyState.message }}
      </div>
      <div class="progress-label"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { notifyState } from "./notifyState";

const showProgress = computed(() => {
  return !!notifyState.value.error || notifyState.value.totalSteps != notifyState.value.completedSteps;
});
const isError = computed(() => {
  return !!notifyState.value.error;
});

const widthPercent = computed(() => {
  if (!showProgress.value) return "0%";
  return (notifyState.value.completedSteps / notifyState.value.totalSteps) * 100 + "%";
});
</script>

<style scoped>
.notify-panel {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  transition: opacity 0.5s ease-in-out;
  transition: 0.2s ease-in-out;
  transition-property: opacity, left, top;
  opacity: 1;
}

.notify-panel[hidden] {
  opacity: 0;
  display: block !important;
  top: -20px;
}

.progress {
  position: relative;
  padding: 4px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.25),
    0 1px rgba(255, 255, 255, 0.08);
  margin: 2px;
}

.progress-bar {
  height: 16px;
  border-radius: 4px;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));
  transition: 0.8s ease-in;
  transition-property: width, background-color;
  box-shadow:
    0 0 1px 1px rgba(0, 0, 0, 0.25),
    inset 0 1px rgba(255, 255, 255, 0.1);
}

.progress > .progress-bar {
  width: 100%;
  background-color: #27e;

  /* animation-name: example; */
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-direction: alternate-reverse;
  animation-timing-function: ease;
  font-size: 0.8em;
  color: #000;
  text-shadow: 0px 0px 5px rgba(255, 255, 255, 0.5);
  line-height: 1.1;
  text-align: left;
  padding-left: 4px;
  white-space: nowrap;
}

.progress.error > .progress-bar {
  background-color: #e20;
}

@keyframes example {
  0% {
    width: 100%;
  }
  100% {
    width: 0%;
  }
}
</style>
