import { artboardState } from "@/components/Artboard/artboardState";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/lib/Tool";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import type { ArtboardGestureEvent } from "@/lib/ArtboardGestureEvent";
import type { MessageBus } from "@/lib/MessageBus";

export const useBrushTool = (messageBus: MessageBus) => {
  const tool: Tool = {
    toolType: "brush",
    gesture,
  };

  watchPostEffect(() => {
    messageBus.publish({
      name: "setBrush",
      params: [brushToolState.value.color, brushToolState.value.radius],
    });
  });

  return tool;

  function gesture(gestureEvent: ArtboardGestureEvent) {
    let weight = gestureEvent.currentEvent.pressure ?? 0.1;
    weight = weight * weight;
    const color = colorConverter("srgb", artboardState.value.colorSpace)(color2srgb(brushToolState.value.color));
    messageBus.publish({
      name: "brush:apply",
      params: [gestureEvent.previousEvent?.at, gestureEvent.currentEvent.at, weight, color, brushToolState.value.radius],
    });
  }
};
