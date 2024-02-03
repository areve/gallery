import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Tool } from "@/interfaces/Tool";
import { dragToolState } from "@/components/Artboard/dragToolState";
import { ref } from "vue";
import artboardService from "./artboardService";

const dragOrigin = ref<DragOrigin | null>();

const tool: Tool = {
  toolType: "drag",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useArtboardMoveTool = () => tool;

function pointerDown(pointerEvent: PointerEvent) {
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

function pointerMove(pointerEvents: PointerEvent) {
  if (!dragOrigin.value) return;
  const pointerEvent = pointerEvents;

  const dx =
    ((pointerEvent.pageX - dragOrigin.value.x) / artboardService.artwork.value.context.canvas.offsetWidth) * artboardService.artwork.value.context.canvas.width;
  const dy =
    ((pointerEvent.pageY - dragOrigin.value.y) / artboardService.artwork.value.context.canvas.offsetHeight) *
    artboardService.artwork.value.context.canvas.height;
  const snapDx = Math.floor(dx / dragToolState.value.snapSize) * dragToolState.value.snapSize;
  const snapDy = Math.floor(dy / dragToolState.value.snapSize) * dragToolState.value.snapSize;
  artboardService.artwork.value.context.clearRect(0, 0, artboardService.artwork.value.bounds.width, artboardService.artwork.value.bounds.height);
  artboardService.artwork.value.context.putImageData(dragOrigin.value.data, snapDx, snapDy);
  artboardService.resetRgbaLayer();
}
