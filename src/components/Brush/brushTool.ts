import { artboardState } from "@/components/Artboard/artboardState";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/lib/Tool";
import { messageBus } from "../Artboard/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import type { GestureEvent } from "@/lib/GestureEvent";

const tool: Tool = {
  toolType: "brush",
  gesture,
};

export const useBrushTool = () => tool;

watchPostEffect(() => {
  messageBus.publish({
    name: "setBrush",
    params: [brushToolState.value.color, brushToolState.value.radius],
  });
});

function gesture(gestureEvent: GestureEvent) {
  let weight = gestureEvent.currentEvent.pressure ?? 0.1;
  weight = weight * weight;
  const color = colorConverter("srgb", artboardState.value.colorSpace)(color2srgb(brushToolState.value.color));
  messageBus.publish({
    name: "brush:apply",
    params: [gestureEvent.previousEvent?.at, gestureEvent.currentEvent.at, weight, color, brushToolState.value.radius],
  });
}
