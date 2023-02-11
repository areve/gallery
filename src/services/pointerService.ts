import type { Coord } from "@/interfaces/Coord";
import { ref } from "vue";

// export const globalDragOrigin = ref<MouseEvent | TouchEvent | null>();
export const pointerUpEvent = ref<MouseEvent | TouchEvent | null>(null);

export function pointerDown(event: MouseEvent | TouchEvent) {

}
export function pointerMove(event: MouseEvent | TouchEvent) {

}

export function pointerUp(event: MouseEvent | TouchEvent) {
  pointerUpEvent.value = event;
}

export interface BasePointerEvent {
  readonly point: Coord;
  readonly index?: number;
  readonly sourceEvent: TouchEvent | MouseEvent;
  readonly force?: number;
  readonly radiusX?: number;
  readonly radiusY?: number;
}

export interface CanvasPointerEvent extends BasePointerEvent {
  readonly canvasPoint: Coord;
}

export function pointerEventsPreventDefault(pointerEvents: BasePointerEvent[]) {
  pointerEvents.forEach((pointerEvent) => {
    pointerEvent.sourceEvent.preventDefault();
  });
}

export function getCanvasPoint(context: CanvasRenderingContext2D, eventPoint: Coord): Coord {
  return {
    x: (eventPoint.x / context.canvas.offsetWidth) * context.canvas.width,
    y: (eventPoint.y / context.canvas.offsetHeight) * context.canvas.height,
  }
}

export function toPointerEvents(event: TouchEvent | MouseEvent) {
  const pointerEvents: BasePointerEvent[] = [];
  if ((event as TouchEvent).touches) {
    const touchEvent = event as TouchEvent;
    for (let i = 0; i < touchEvent.touches.length; i++) {
      const touch = touchEvent.touches[i];
      const rect = (touch.target as any).getBoundingClientRect();
      const x = touch.clientX - window.pageXOffset - rect.left;
      const y = touch.clientY - window.pageYOffset - rect.top;

      const pointerEvent: BasePointerEvent = {
        point: {
          x,
          y,
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

    const pointerEvent: BasePointerEvent = {
      point: {
        x,
        y,
      },
      index: 0,
      sourceEvent: event,
    };
    pointerEvents.push(pointerEvent);
  }
  return pointerEvents;
}
