import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";
import artboardService from "../services/artboardService";
import { snapSize } from "../services/editorAppState";
import type { CanvasPointerEvent } from "../services/mouseService";

const dragOrigin = ref<DragOrigin | null>();

const tool: Tool = {
  toolType: "drag-frame",
  pointerUp,
  pointerDown,
  pointerMove,
}

export const useArtboardFrameTool = () => tool

function pointerDown(pointerEvent: CanvasPointerEvent) {
  dragOrigin.value = {
    x: pointerEvent.point.x,
    y: pointerEvent.point.y,
    data: artboardService.artwork.value.context.getImageData(
      0,
      0,
      artboardService.artwork.value.bounds.width,
      artboardService.artwork.value.bounds.height
    ),
    frame: { ...artboardService.artwork.value.frame },
  };
}

function pointerUp(pointerEvent: CanvasPointerEvent) {
  dragOrigin.value = null;
}

function pointerMove(pointerEvent: CanvasPointerEvent) {
  if (!dragOrigin.value) return;
  const dx =
    ((pointerEvent.point.x - dragOrigin.value.x) /
      artboardService.artwork.value.context.canvas.offsetWidth) *
    artboardService.artwork.value.context.canvas.width;
  const dy =
    ((pointerEvent.point.y - dragOrigin.value.y) /
      artboardService.artwork.value.context.canvas.offsetHeight) *
    artboardService.artwork.value.context.canvas.height;
  const snapDx = Math.floor(dx / snapSize.value) * snapSize.value;
  const snapDy = Math.floor(dy / snapSize.value) * snapSize.value;
  artboardService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx;
  artboardService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy;
}