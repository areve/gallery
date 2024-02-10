import type { Coord } from "@/lib/Coord";
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

export function getCanvasPoint(canvas: HTMLCanvasElement, eventPoint: Coord): Coord {
  const domRect = canvas.getBoundingClientRect();
  return {
    x: ((eventPoint.x - domRect.x) / domRect.width) * canvas.width,
    y: ((eventPoint.y - domRect.y) / domRect.height) * canvas.height,
  };
}
