import { ref } from "vue";

export const globalDragOrigin = ref<MouseEvent | TouchEvent | null>();

export function mouseDown(event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = event;
}

export function mouseUp(_event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = null;
}

interface PointerEvent {
  readonly x: number;
  readonly y: number;
  readonly index?: number;
  readonly sourceEvent: TouchEvent | MouseEvent;
  readonly force?: number;
  readonly radiusX?: number;
  readonly radiusY?: number;
}

export function toPointerEvents(event: TouchEvent | MouseEvent) {
  const pointerEvents: PointerEvent[] = [];
  if ((event as TouchEvent).touches) {
    const touchEvent = event as TouchEvent;
    for (let i = 0; i < touchEvent.touches.length; i++) {
      const touch = touchEvent.touches[i];
      const rect = (touch.target as any).getBoundingClientRect();
      const pointerEvent: PointerEvent = {
        x: touch.clientX - window.pageXOffset - rect.left,
        y: touch.clientY - window.pageYOffset - rect.top,
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
    const pointerEvent: PointerEvent = {
      x: mouseEvent.offsetX,
      y: mouseEvent.offsetY,
      index: 0,
      sourceEvent: event,
    };
    pointerEvents.push(pointerEvent);
  }
  return pointerEvents;
}
