import type { Coord } from "@/lib/Coord";
import { ref } from "vue";

export interface ScreenEvent {
  pointerType: string;
  isPrimary: boolean;
  timeStamp: number;
  pointerId: number;
  buttons: number;
  width: number;
  height: number;
  tangentialPressure: number;
  pressure: number;
  azimuthAngle: number;
  altitudeAngle: number;
  type: string;
  at?: Coord;
  page: Coord;
  screen: Coord;
}

export interface GestureEvent extends ScreenEvent {
  coalescedEvents: ScreenEvent[];
}

export const gestureUpEvent = ref<GestureEvent | null>(null);
export const gestureDownEvent = ref<GestureEvent | null>(null);
export const gestureMoveEvent = ref<GestureEvent | null>(null);

const pointerScreenEvents: { [k: number]: ScreenEvent[] } = {};

document.onpointerdown = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointerdown", event);
  gestureDownEvent.value = gestureEvent;
};

document.onpointermove = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointermove", event);
  gestureMoveEvent.value = gestureEvent;
};

document.onpointerup = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointerup", event);
  gestureUpEvent.value = gestureEvent;
  delete pointerScreenEvents[event.pointerId];
};

document.onpointercancel = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointercancel", event);
  gestureUpEvent.value = gestureEvent;
  delete pointerScreenEvents[event.pointerId];
};

function pointerEventToGestureEvent(type: string, event: PointerEvent) {
  const screenEvent = pointerEventToScreenEvent(type, event);
  if (screenEvent.buttons !== 0) {
    if (!pointerScreenEvents[screenEvent.pointerId]) pointerScreenEvents[screenEvent.pointerId] = [];
    //TODO keeping all events like this will cause bother eventually
    //TODO soon gathering stats like number of points, distance travelled, ink used etc, and preserve first and previous pointo only
    pointerScreenEvents[screenEvent.pointerId].push(screenEvent);
  }

  const gestureEvent: GestureEvent = Object.assign({}, screenEvent, {
    coalescedEvents: pointerScreenEvents[screenEvent.pointerId],
  });
  return gestureEvent;
}

function pointerEventToScreenEvent(type: string, event: PointerEvent): ScreenEvent {
  const screenEvent: ScreenEvent = {
    type,
    buttons: event.buttons,
    width: event.width,
    height: event.height,
    pressure: event.pressure,
    tangentialPressure: event.tangentialPressure,
    azimuthAngle: (event as any).azimuthAngle,
    altitudeAngle: (event as any).altitudeAngle,
    pointerId: event.pointerId,
    timeStamp: event.timeStamp,
    isPrimary: event.isPrimary,
    pointerType: event.pointerType,
    page: { x: event.pageX, y: event.pageY },
    screen: { x: event.screenX, y: event.screenY },
  };
  return screenEvent;
}

export function stringifyEvent(event: any) {
  return JSON.stringify(
    unpack(event),
    (k, v) => {
      if (v instanceof Node) return `Node(${v.nodeName})`;
      if (v instanceof Window) return "Window";
      if (v instanceof Touch) return unpack(v);
      if (v instanceof TouchEvent) return unpack(v);
      if (v instanceof PointerEvent) return unpack(v);
      if (v instanceof MouseEvent) return unpack(v);
      return v;
    },
    "  "
  );
  function unpack(o: any) {
    const obj = (Array.isArray(o) ? [] : {}) as any;
    for (const k in o) obj[k] = o[k];
    return obj;
  }
}
