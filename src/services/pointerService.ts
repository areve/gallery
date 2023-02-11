import type { Coord } from "@/interfaces/Coord";
import { ref } from "vue";

export const pointerUpEvents = ref<BasePointerEvent[]>([]);
export const pointerDownEvents = ref<BasePointerEvent[]>([]);
export const pointerMoveEvents = ref<BasePointerEvent[]>([]);

export function pointerDown(event: MouseEvent | TouchEvent) {
  pointerUpEvents.value = [];
  pointerDownEvents.value = toPointerEvents(event);
}

export function pointerMove(event: MouseEvent | TouchEvent) {
  pointerMoveEvents.value = toPointerEvents(event);
}

export function pointerUp(event: MouseEvent | TouchEvent) {
  pointerUpEvents.value = toPointerEvents(event);
  pointerDownEvents.value = [];
}

export interface BasePointerEvent {
  readonly page: Coord;
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

export function getCanvasPoint(
  context: CanvasRenderingContext2D,
  eventPoint: Coord
): Coord {
  const domRect = context.canvas.getBoundingClientRect();
  return {
    x: ((eventPoint.x - domRect.x) / domRect.width) * context.canvas.width,
    y: ((eventPoint.y - domRect.y) / domRect.height) * context.canvas.height,
  };
}

function toPointerEvents(event: TouchEvent | MouseEvent) {
  const pointerEvents: BasePointerEvent[] = [];
  if ((event as TouchEvent).touches) {
    const touchEvent = event as TouchEvent;
    for (let i = 0; i < touchEvent.touches.length; i++) {
      const touch = touchEvent.touches[i];
      const x = touch.pageX;
      const y = touch.pageY;
      const pointerEvent: BasePointerEvent = {
        page: {
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
    const x = mouseEvent.pageX;
    const y = mouseEvent.pageY;

    const pointerEvent: BasePointerEvent = {
      page: {
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
