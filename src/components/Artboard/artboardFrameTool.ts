import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";
import { dragToolState } from "@/components/Artboard/dragToolState";
import artboardService from "./artboardService";

const dragOrigin = ref<DragOrigin | null>();

const tool: Tool = {
  toolType: "drag-frame",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useArtboardFrameTool = () => tool;

function pointerDown(pointerEvents: PointerEvent) {
  const pointerEvent = pointerEvents;

  dragOrigin.value = {
    x: pointerEvent.pageX,
    y: pointerEvent.pageY,
    data: artboardService.artwork.value.context.getImageData(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height),
    frame: { ...artboardService.artwork.value.frame },
  };
}

function pointerUp(_: PointerEvent) {
  dragOrigin.value = null;
}

function pointerMove(pointerEvent: PointerEvent) {
  if (!dragOrigin.value) return;

  const dx =
    ((pointerEvent.pageX - dragOrigin.value.x) / artboardService.artwork.value.context.canvas.offsetWidth) * artboardService.artwork.value.context.canvas.width;
  const dy =
    ((pointerEvent.pageY - dragOrigin.value.y) / artboardService.artwork.value.context.canvas.offsetHeight) *
    artboardService.artwork.value.context.canvas.height;
  const snapDx = Math.floor(dx / dragToolState.value.snapSize) * dragToolState.value.snapSize;
  const snapDy = Math.floor(dy / dragToolState.value.snapSize) * dragToolState.value.snapSize;
  artboardService.artwork.value.frame.x = dragOrigin.value.frame.x + snapDx;
  artboardService.artwork.value.frame.y = dragOrigin.value.frame.y + snapDy;
}
