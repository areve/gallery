import { artboardState } from "@/components/Artboard/artboardState";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/lib/Tool";
import { artboard, messageBus } from "../Artboard/Artboard";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import type { Coord } from "@/lib/Coord";
import type { GestureEvent } from "@/lib/GestureEvent";

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


// TODO I only need these to track pointer up down state, gesture should alredy be  doing this
function pointerUp(_: GestureEvent) {
  brushLastPoint = undefined;
  isPointerDown = false;
}

function pointerDown(_: GestureEvent) {
  console.log("brush down")
  isPointerDown = true;
}

function pointerMove(gestureEvent: GestureEvent) {
  if (!isPointerDown) return;
  if (!artboard.canvas) return;

  if (brushLastPoint) {
    let weight = gestureEvent.currentEvent.pressure ?? 0.1;
    weight = weight * weight;
    console.log("brush move")

    // brushMoved, allows the brush to be less like an airbrush
    // but tapping doesn't leave a mark
    // TODO better last point is in the gesture event:)
    // TODO ... but it doesn't have the required relative .at.x & .at.y property
    const brushMoved = brushLastPoint.x != gestureEvent.currentEvent.at?.x || brushLastPoint.y != gestureEvent.currentEvent.at?.y;
    if (brushMoved) {
      const color = colorConverter("srgb", artboardState.value.colorSpace)(color2srgb(brushToolState.value.color));

      messageBus.publish({
        name: "brush:apply",
        params: [brushLastPoint, gestureEvent.currentEvent.at, weight, color, brushToolState.value.radius],
      });
    }
  }

  brushLastPoint = gestureEvent.currentEvent.at;
}
