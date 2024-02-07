import { clearCircle } from "@/lib/bitmap/bitmap-draw";
import type { Tool } from "@/interfaces/Tool";
import { getCanvasPoint } from "@/services/pointerService";
import artboardService from "../ArtboardPanel/artboardService";
import { eraserToolState } from "./eraserToolState";

const tool: Tool = {
  toolType: "eraser",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useEraserTool = () => tool;

let isPointerDown = false;

function pointerUp(_: PointerEvent) {
  isPointerDown = false;
}

function pointerDown(pointerEvent: PointerEvent) {
  return;
  if (!artboardService.artboard.value.context) return;
  isPointerDown = true;
  const canvasPoint = getCanvasPoint(artboardService.artboard.value.context, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  clearCircle(artboardService.artboard.value.bitmapLayer, canvasPoint.x, canvasPoint.y, eraserToolState.value.radius);
}

function pointerMove(pointerEvents: PointerEvent) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
