<template>
  <div class="notify-panel">
    <div
      class="progress"
      :class="{
        error: notifyState.process.error,
      }"
      :hidden="!notifyState.process.visible"
    >
      <div
        class="progress-bar"
        :style="{
          width: notifyState.process.percent,
        }"
      >
        {{ notifyState.process.message }}
      </div>
    </div>

    <div
      class="toast"
      :class="{
        error: notifyState.toast.error,
      }"
      :hidden="!notifyState.toast.visible"
    >
      <div class="toast-bar">
        {{ notifyState.toast.message }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { notifyState } from "./notifyState";


</script>

<style scoped>
.notify-panel {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
}

.toast,
.progress {
  position: absolute;
  width: calc(100% - 4px);
  top: 0;
  height: 26px;
  overflow: hidden;
  padding: 4px;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 6px;
  box-shadow:
    inset 0 1px 2px rgba(0, 0, 0, 0.25),
    0 1px rgba(255, 255, 255, 0.08);
  transition:
    width 0.8s ease-in-out,
    opacity 0.6s ease-in-out,
    top 0.4s ease-in-out;
  opacity: 1;
  margin: 2px;
}

.toast[hidden],
.progress[hidden] {
  opacity: 0.3;
  display: block !important;
  /* height: 0px; */
  top: -26px;
}

.toast-bar,
.progress-bar {
  height: 16px;
  border-radius: 4px;
  background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.05));

  transition:
    background-color 0.2s ease-in,
    width 0.8s ease-in;
  box-shadow:
    0 0 1px 1px rgba(0, 0, 0, 0.25),
    inset 0 1px rgba(255, 255, 255, 0.1);

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

.toast.error > .toast-bar,
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
