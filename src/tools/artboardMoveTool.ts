import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";
import artboardService from "../services/artboardService";
import { snapSize } from "../services/editorAppState";
import { pointerEventsPreventDefault, type BasePointerEvent } from "../services/pointerService";

const dragOrigin = ref<DragOrigin | null>();

const tool: Tool = {
  toolType: "drag",
  pointerUp,
  pointerDown,
  pointerMove,
}

export const useArtboardMoveTool = () => tool

function pointerDown(pointerEvent: BasePointerEvent) {
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

function pointerUp(pointerEvent: BasePointerEvent) {
  dragOrigin.value = null;
}

function pointerMove(pointerEvent: BasePointerEvent) {
  if (!dragOrigin.value) return;
  pointerEventsPreventDefault([pointerEvent])

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
  artboardService.artwork.value.context.clearRect(
    0,
    0,
    artboardService.artwork.value.bounds.width,
    artboardService.artwork.value.bounds.height
  );
  artboardService.artwork.value.context.putImageData(
    dragOrigin.value.data,
    snapDx,
    snapDy
  );
  artboardService.resetRgbaLayer();
}
