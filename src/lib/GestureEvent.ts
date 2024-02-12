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
  at?: Coord; //TODO temporary, it's never set in this file
  page: Coord;
  screen: Coord;
}

export interface GestureEvent {
  currentEvent: ScreenEvent;
  previousEvent?: ScreenEvent;
}
// TODO saving this file breaks vue hot reload, don't know why
export const gestureAnyEvent = ref<GestureEvent | undefined>(undefined);

const pointerScreenEvents: { [k: number]: GestureEvent } = {};

document.onpointerdown = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointerdown", event);
  gestureAnyEvent.value = gestureEvent;
};

document.onpointermove = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointermove", event);
  gestureAnyEvent.value = gestureEvent;
};

document.onpointerup = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointerup", event);
  gestureAnyEvent.value = gestureEvent;
  delete pointerScreenEvents[event.pointerId];
};

document.onpointercancel = function (event: PointerEvent) {
  const gestureEvent = pointerEventToGestureEvent("pointercancel", event);
  gestureAnyEvent.value = gestureEvent;
  delete pointerScreenEvents[event.pointerId];
};

function pointerEventToGestureEvent(type: string, event: PointerEvent) {
  const screenEvent = pointerEventToScreenEvent(type, event);
  const prevGestureEvent = pointerScreenEvents[screenEvent.pointerId] as GestureEvent | undefined;
  if (screenEvent.type === "pointermove") {
    if (screenEvent.buttons === 0) return;
    if (
      prevGestureEvent &&
      prevGestureEvent.currentEvent.screen.x === screenEvent.screen.x &&
      prevGestureEvent.currentEvent.screen.y === screenEvent.screen.y
    ) {
      return;
    }
  }

  const currentGestureEvent: GestureEvent = {
    currentEvent: screenEvent,
    previousEvent: prevGestureEvent ? prevGestureEvent.currentEvent : undefined,
  };
  pointerScreenEvents[screenEvent.pointerId] = currentGestureEvent;

  return currentGestureEvent;
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
