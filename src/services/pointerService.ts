import type { Coord } from "@/interfaces/Coord";
import { ref } from "vue";

export const pointerUpEvent = ref<PointerEvent | null>(null);
export const pointerDownEvent = ref<PointerEvent | null>(null);
export const pointerMoveEvent = ref<PointerEvent | null>(null);

document.onpointerdown = function (event: PointerEvent) {
  pointerDownEvent.value = event;
};

document.onpointermove = function (event: PointerEvent) {
  pointerMoveEvent.value = event;
};

document.onpointerup = function (event: PointerEvent) {
  pointerUpEvent.value = event;
};

export function getCanvasPoint(context: CanvasRenderingContext2D, eventPoint: Coord): Coord {
  const domRect = context.canvas.getBoundingClientRect();
  return {
    x: ((eventPoint.x - domRect.x) / domRect.width) * context.canvas.width,
    y: ((eventPoint.y - domRect.y) / domRect.height) * context.canvas.height,
  };
}
