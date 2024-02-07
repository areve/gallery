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
  if (!artboardService.artboard.value.canvas) return;

  isPointerDown = true;

  const canvasPoint = getCanvasPoint(artboardService.artboard.value.canvas, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  artboardService.clearCircle(canvasPoint, eraserToolState.value.radius);
}

function pointerMove(pointerEvents: PointerEvent) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
