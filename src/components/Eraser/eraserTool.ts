import type { Tool } from "@/interfaces/Tool";
import { clearCircle } from "@/lib/rgba/rgba-draw";
import artboardService from "@/components/Artboard/artboardService";
import { eraserToolState } from "@/components/Eraser/eraserToolState";
import { getCanvasPoint } from "../../services/pointerService";

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
  isPointerDown = true;
  const canvasPoint = getCanvasPoint(artboardService.artwork.value.context, {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
  });

  clearCircle(
    artboardService.artwork.value.rgbaLayer,
    canvasPoint.x,
    canvasPoint.y,
    eraserToolState.value.eraserSize / 2
  );
}

function pointerMove(pointerEvents: PointerEvent) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
