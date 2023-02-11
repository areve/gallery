import type { Coord } from "@/interfaces/Coord";
import { ref } from "vue";

export const globalDragOrigin = ref<MouseEvent | TouchEvent | null>();
export const pointerUpEvent = ref<MouseEvent | TouchEvent | null>(null);

export function mouseDown(event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = event;
}

export function mouseUp(event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = null;
  pointerUpEvent.value = event;
}

export interface CanvasPointerEvent {
  readonly point: Coord;
  readonly canvasPoint: Coord;
  readonly index?: number;
  readonly sourceEvent: TouchEvent | MouseEvent;
  readonly force?: number;
  readonly radiusX?: number;
  readonly radiusY?: number;
}

export function toPointerEvents(
  event: TouchEvent | MouseEvent,
  context: CanvasRenderingContext2D
) {
  const pointerEvents: CanvasPointerEvent[] = [];
  if ((event as TouchEvent).touches) {
    const touchEvent = event as TouchEvent;
    for (let i = 0; i < touchEvent.touches.length; i++) {
      const touch = touchEvent.touches[i];
      const rect = (touch.target as any).getBoundingClientRect();
      const x = touch.clientX - window.pageXOffset - rect.left;
      const y = touch.clientY - window.pageYOffset - rect.top;

      const pointerEvent: CanvasPointerEvent = {
        point: {
          x,
          y,
        },
        canvasPoint: {
          x: (x / context.canvas.offsetWidth) * context.canvas.width,
          y: (y / context.canvas.offsetHeight) * context.canvas.height,
        },
        index: i,
        sourceEvent: event,
        force: touch.force,
        radiusX: touch.radiusX,
        radiusY: touch.radiusY,
      };
      pointerEvents.push(pointerEvent);
    }
  } else {
    const mouseEvent: MouseEvent = event as MouseEvent;
    const x = mouseEvent.offsetX;
    const y = mouseEvent.offsetY;

    const pointerEvent: CanvasPointerEvent = {
      point: {
        x,
        y,
      },
      canvasPoint: {
        x: (x / context.canvas.offsetWidth) * context.canvas.width,
        y: (y / context.canvas.offsetHeight) * context.canvas.height,
      },
      index: 0,
      sourceEvent: event,
    };
    pointerEvents.push(pointerEvent);
  }
  return pointerEvents;
}
