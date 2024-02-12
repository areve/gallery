import { artboardState } from "@/components/Artboard/artboardState";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/lib/Tool";
import { artboard, messageBus } from "../Artboard/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import type { GestureEvent } from "@/services/GestureEvent";
import type { Coord } from "@/lib/Coord";

const tool: Tool = {
  toolType: "brush",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

let brushLastPoint: Coord | undefined = undefined;
let isPointerDown = false;

watchPostEffect(() => {
  messageBus.publish({
    name: "setBrush",
    params: [brushToolState.value.color, brushToolState.value.radius],
  });
});

function pointerUp(_: GestureEvent) {
  brushLastPoint = undefined;
  isPointerDown = false;
}

function pointerDown(_: GestureEvent) {
  isPointerDown = true;
}

function pointerMove(gestureEvent: GestureEvent) {
  if (!isPointerDown) return;
  if (!artboard.canvas) return;

  if (brushLastPoint) {
    let weight = gestureEvent.pressure ?? 0.1;
    weight = weight * weight;

    // brushMoved, allows the brush to be less like an airbrush
    // but tapping doesn't leave a mark
    // TODO better last point is in the gesture event:)
    // TODO ... but it doesn't have the required relative .at.x & .at.y property
    const brushMoved = brushLastPoint.x != gestureEvent.at?.x || brushLastPoint.y != gestureEvent.at?.y;
    if (brushMoved) {
      const color = colorConverter("srgb", artboardState.value.colorSpace)(color2srgb(brushToolState.value.color));

      messageBus.publish({
        name: "brush:apply",
        params: [brushLastPoint, gestureEvent.at, weight, color, brushToolState.value.radius],
      });
    }
  }

  brushLastPoint = gestureEvent.at;
}
