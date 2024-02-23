<template>
  <button
    class="edge-button"
    @click="nothing"
    ref="edgeButton"
    :style="{
      top: topPercent + '%',
      left: leftPercent + '%',
    }"
  >
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
import { ref, computed, defineEmits, onMounted, watch } from "vue";
import { gestureAnyEvent, type GestureEvent } from "@/lib/GestureEvent";
import { clamp, cloneExtend } from "@/lib/utils";
import { clone } from "lodash";

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
  (event: "longpress", param: GestureEvent): void;
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
const topPercent = ref<number>(50);
const leftPercent = computed(() => (props.edge === "left" ? 0 : 100));
let cancelNextPress = false;
let targetPercent: number | undefined;

onMounted(() => {
  topPercent.value = 0 + props.edgeButtonState.topPercent;
});

// TODO watchPostEffect was firing twice, perhaps because of inheritance or duplicate usage?
watch(
  () => clone(gestureAnyEvent.value),
  () => {
    if (!gestureAnyEvent.value) return;
    if (gestureAnyEvent.value.firstEvent.target !== edgeButton.value) return;

    if (gestureAnyEvent.value.currentEvent.type === "pointerdown") targetPercent = topPercent.value;

    const yDiffFromFirst = gestureAnyEvent.value.firstEvent.screen.y - gestureAnyEvent.value.currentEvent.screen.y;
    if (gestureAnyEvent.value.currentEvent.type === "pointerup" && Math.abs(yDiffFromFirst) < 10) {
      const timeDiffFromFirst = gestureAnyEvent.value.currentEvent.timeStamp - gestureAnyEvent.value.firstEvent.timeStamp;
      if (timeDiffFromFirst > 500) {
        console.log("foo", timeDiffFromFirst, clone(gestureAnyEvent.value.currentEvent));
        // TODO make longpress a gesture event
        emit("longpress", gestureAnyEvent.value)
        cancelNextPress = true
      }
    }

    if (Math.abs(yDiffFromFirst) > 10) {
      // TODO why is this only needed for mouse and can it go into the gestureEvent?
      // it seems that click event is naturally cancelled if a pen or finger moves, but if a mouse moves it just checks that the start and end domNode match
      if (gestureAnyEvent.value.firstEvent.pointerType === "mouse") cancelNextPress = true;
      if (targetPercent !== undefined)
        topPercent.value = snap(clamp(targetPercent - (yDiffFromFirst / window.innerHeight) * 100, 0, 100), 2, [0, 25, 50, 75, 100]);
    }
    if (gestureAnyEvent.value.currentEvent.type === "pointerup") {
      if (targetPercent !== undefined) {
        emit(
          "update:edgeButtonState",
          cloneExtend(props.edgeButtonState, {
            topPercent: snap(clamp(targetPercent - (yDiffFromFirst / window.innerHeight) * 100, 0, 100), 2, [0, 25, 50, 75, 100]),
          }),
        );
      }
      targetPercent = undefined;
    }
  },
);
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
