import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { Tool } from "@/interfaces/Tool";
import { dragToolState } from "@/components/Artboard/dragToolState";
import { ref } from "vue";
import {
  pointerEventsPreventDefault,
  type BasePointerEvent,
} from "../../services/pointerService";
import artboardService from "./artboardService";

const dragOrigin = ref<DragOrigin | null>();

const tool: Tool = {
  toolType: "drag",
  pointerUp,
  pointerDown,
  pointerMove,
};

export const useArtboardMoveTool = () => tool;

function pointerDown(pointerEvents: BasePointerEvent[]) {
  const pointerEvent = pointerEvents[0];

  dragOrigin.value = {
    x: pointerEvent.page.x,
    y: pointerEvent.page.y,
    data: artboardService.artwork.value.context.getImageData(
      0,
      0,
      artboardService.artwork.value.bounds.width,
      artboardService.artwork.value.bounds.height
    ),
    frame: { ...artboardService.artwork.value.frame },
  };
}

function pointerUp(_: BasePointerEvent[]) {
  dragOrigin.value = null;
}

function pointerMove(pointerEvents: BasePointerEvent[]) {
  if (!dragOrigin.value) return;
  const pointerEvent = pointerEvents[0];
  pointerEventsPreventDefault(pointerEvents);

  const dx =
    ((pointerEvent.page.x - dragOrigin.value.x) /
      artboardService.artwork.value.context.canvas.offsetWidth) *
    artboardService.artwork.value.context.canvas.width;
  const dy =
    ((pointerEvent.page.y - dragOrigin.value.y) /
      artboardService.artwork.value.context.canvas.offsetHeight) *
    artboardService.artwork.value.context.canvas.height;
  const snapDx = Math.floor(dx / dragToolState.value.snapSize) * dragToolState.value.snapSize;
  const snapDy = Math.floor(dy / dragToolState.value.snapSize) * dragToolState.value.snapSize;
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
