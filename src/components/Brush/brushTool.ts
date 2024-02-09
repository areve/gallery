import { artboardState } from "@/components/ArtboardPanel/artboardState";
import { brushToolState } from "./brushToolState";
import type { Tool } from "@/interfaces/Tool";
import artboardService from "../ArtboardPanel/artboardService";
import { getCanvasPoint } from "@/services/pointerService";
import { color2srgb, colorConverter } from "@/lib/color/color";
import { watchPostEffect } from "vue";
import { dispatch } from "../ArtboardPanel/workerService";

const tool: Tool = {
  toolType: "brush",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useBrushTool = () => tool;

let brushLastPoint: { x: number; y: number } | null = null;
let isPointerDown = false;

watchPostEffect(() => {
  // setBrush(brushToolState.value.color, brushToolState.value.radius);
  // TODO brushService.setBrush(brushToolState.value.color, brushToolState.value.radius);
  // which will either do-it, or get the other worker to do-it
  dispatch({
    name: "brushService.setBrush",
    params: [brushToolState.value.color, brushToolState.value.radius],
  });
});

function pointerUp(_: PointerEvent) {
  brushLastPoint = null;
  isPointerDown = false;
}

function pointerDown(_: PointerEvent) {
  isPointerDown = true;
}

function pointerMove(pointerEvent: PointerEvent) {
  if (!isPointerDown) return;
  if (!artboardService.artboard.value.canvas) return;

  const canvasPoint = getCanvasPoint(artboardService.artboard.value.canvas, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  if (brushLastPoint) {
    let weight = pointerEvent.pressure ?? 0.1;
    weight = weight * weight;

    // brushMoved, allows the brush to be less like an airbrush
    // but tapping doesn't leave a mark
    const brushMoved = brushLastPoint.x != canvasPoint.x || brushLastPoint.y != canvasPoint.y;
    if (brushMoved) {
      const color = colorConverter("srgb", artboardState.value.colorSpace)(color2srgb(brushToolState.value.color));

      dispatch({
        name: "applyBrush",
        params: [brushLastPoint, canvasPoint, weight, color, brushToolState.value.radius],
      });
    }
  }

  brushLastPoint = canvasPoint;
}
