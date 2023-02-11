import type { Tool } from "@/interfaces/Tool";
import { clearCircle } from "@/lib/rgba/rgba-draw";
import artboardService from "@/services/artboardService";
import { eraserToolState } from "@/states/eraserToolState";
import {
  getCanvasPoint,
  type BasePointerEvent,
} from "../services/pointerService";

const tool: Tool = {
  toolType: "eraser",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useEraserTool = () => tool;

let isPointerDown = false;

function pointerUp(_: BasePointerEvent[]) {
  isPointerDown = false;
}

function pointerDown(pointerEvents: BasePointerEvent[]) {
  isPointerDown = true;
  const canvasPoint = getCanvasPoint(
    artboardService.artwork.value.context,
    pointerEvents[0].page
  );

  clearCircle(
    artboardService.artwork.value.rgbaLayer,
    canvasPoint.x,
    canvasPoint.y,
    eraserToolState.value.eraserSize / 2
  );
}

function pointerMove(pointerEvents: BasePointerEvent[]) {
  if (!isPointerDown) return;
  pointerDown(pointerEvents);
}
