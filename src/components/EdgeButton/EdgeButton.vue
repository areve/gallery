<template>
  <button
    class="edge-button"
    @click="nothing"
    ref="edgeButton"
    :style="{
      top: props.edgeButtonState.topPercent + '%',
      left: leftPercent + '%',
    }"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, watch } from "vue";
import { gestureAnyEvent, type GestureEvent } from "@/lib/GestureEvent";
import { clamp, cloneExtend } from "@/lib/utils";

interface Props {
  edge: "left" | "right";
  edgeButtonState: {
    topPercent: number;
  };
}

const props = defineProps<Props>();
const emit = defineEmits<{
  // TODO I want long press to show me a more in depth menu, (too select my pencils)
  (event: "click", param: MouseEvent): void;
  (event: "contextmenu", param: GestureEvent): void;
  (
    event: "update:edgeButtonState",
    param: {
      topPercent: number;
    },
  ): void;
}>();

function snap(value: number, dist: number, points: number[]) {
  for (var i = 0; i < points.length; i++) {
    if (Math.abs(value - points[i]) < dist) return points[i];
  }
  return value;
}
const edgeButton = ref<HTMLCanvasElement>(undefined!);
const leftPercent = computed(() => (props.edge === "left" ? 0 : 100));
let cancelNextPress = false;
let targetPercent: number | undefined;

watch(gestureAnyEvent, () => {
  if (!gestureAnyEvent.value) return;
  if (gestureAnyEvent.value.firstEvent.target !== edgeButton.value) return;

  if (gestureAnyEvent.value.currentEvent.type === "oncontextmenu") emit("contextmenu", gestureAnyEvent.value);
  if (gestureAnyEvent.value.currentEvent.type === "pointerdown") targetPercent = props.edgeButtonState.topPercent;

  const yDiffFromFirst = gestureAnyEvent.value.firstEvent.screen.y - gestureAnyEvent.value.currentEvent.screen.y;
  if (gestureAnyEvent.value.currentEvent.type === "pointerup" && Math.abs(yDiffFromFirst) < 10) {
    // const timeDiffFromFirst = gestureAnyEvent.value.currentEvent.timeStamp - gestureAnyEvent.value.firstEvent.timeStamp;
    // if (timeDiffFromFirst > 400) emit("contextmenu", gestureAnyEvent.value);
  }

  if (Math.abs(yDiffFromFirst) > 10) {
    if (gestureAnyEvent.value.firstEvent.pointerType === "mouse") cancelNextPress = true;

    if (targetPercent !== undefined) {
      emit(
        "update:edgeButtonState",
        cloneExtend(props.edgeButtonState, {
          topPercent: snap(clamp(targetPercent - (yDiffFromFirst / window.innerHeight) * 100, 0, 100), 2, [0, 25, 50, 75, 100]),
        }),
      );
    }
  }
});

function nothing(event: MouseEvent) {
  if (cancelNextPress) {
    cancelNextPress = false;
    return;
  }
  emit("click", event);
}
</script>

<style scoped>
.edge-button {
  position: fixed;
  transform: translate(-50%, -50%);
}
</style>
