<template>
  <button
    class="edge-button"
    type="button"
    @click="nothing"
    ref="button"
    :style="{
      top: topPercent + '%',
    }"
  ></button>
</template>

<script lang="ts" setup>
import { ref, watchSyncEffect } from "vue";
import { progressMessage } from "../Progress/progressState";
import { gestureAnyEvent } from "@/lib/GestureEvent";
import { clamp } from "lodash";

function snap(value: number, dist: number, points: number[]) {
  for (var i = 0; i < points.length; i++) {
    if (Math.abs(value - points[i]) < dist) return points[i];
  }
  return value;
}
const button = ref<HTMLCanvasElement>(undefined!);
const topPercent = ref<number>(50);
let cancelNextPress = false;
let targetPercent: number | undefined;
watchSyncEffect(() => {
  if (!gestureAnyEvent.value) return;
  if (gestureAnyEvent.value.firstEvent.target !== button.value) return;
  if (gestureAnyEvent.value.currentEvent.type === "pointerdown") {
    targetPercent = topPercent.value;
  }

  const yDiffFromFirst = gestureAnyEvent.value.firstEvent.screen.y - gestureAnyEvent.value.currentEvent.screen.y;
  if (Math.abs(yDiffFromFirst) > 10) {
    // TODO why is this only needed for mouse and can it go into the gestureEvent?
    // it seems that click event is naturally cancelled if a pen or finger moves, but if a mouse moves it just checks that the start and end domNode match
    if (gestureAnyEvent.value.firstEvent.pointerType === "mouse") cancelNextPress = true;
    if (targetPercent !== undefined) topPercent.value = snap(clamp(targetPercent - (yDiffFromFirst / window.innerHeight) * 100, 0, 100), 5, [0, 50, 100]);
  }
  if (gestureAnyEvent.value.currentEvent.type === "pointerup") {
    targetPercent = undefined;
  }
});
function nothing() {
  if (cancelNextPress) {
    cancelNextPress = false;
    return;
  }
  progressMessage("button does nothing yet", 2);
  setTimeout(() => progressMessage("done"), 2000);
}
</script>

<style scoped>
.edge-button {
  border-radius: 3em;
  position: fixed;
  /* left: -3em; */
  /* top: 50%; */
  margin: -3em;
  z-index: 200;
  width: 6em;
  height: 6em;
  box-shadow: 0em 0em 0.5em rgb(0, 0, 0, 0.8);
  opacity: 0.6;
}
</style>
