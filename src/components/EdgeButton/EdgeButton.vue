<template>
  <button
    class="edge-button"
    type="button"
    @click="nothing"
    ref="button"
    :style="{
      top: topPercent + 'px',
    }"
  ></button>
</template>

<script lang="ts" setup>
import { ref, watchSyncEffect } from "vue";
import { progressMessage } from "../Progress/progressState";
import { gestureAnyEvent } from "@/lib/GestureEvent";

const button = ref<HTMLCanvasElement>(undefined!);
const topPercent = ref<number>(100);
// let cancelNextPress = false;
watchSyncEffect(() => {
  if (!gestureAnyEvent.value) return;
  if (gestureAnyEvent.value.firstEvent.target !== button.value) return;
  const yDiff = gestureAnyEvent.value.firstEvent.screen.y - gestureAnyEvent.value.currentEvent.screen.y;
  const yDiff2 = gestureAnyEvent.value.previousEvent ? gestureAnyEvent.value.currentEvent.screen.y - gestureAnyEvent.value.previousEvent.screen.y : 0;
  if (Math.abs(yDiff) > 10) {
    // cancelNextPress = true;
    topPercent.value += yDiff2;
    console.log(yDiff, yDiff2);
  }
});
function nothing() {
  // if (cancelNextPress) {
    // cancelNextPress = false;
    // return;
  // }
  progressMessage("button does nothing yet", 2);
  setTimeout(() => progressMessage("done"), 2000);
}
</script>

<style scoped>
.edge-button {
  border-radius: 3em;
  position: fixed;
  left: -3em;
  top: 50%;
  z-index: 200;
  width: 6em;
  height: 6em;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
  opacity: 0.6;
}
</style>
