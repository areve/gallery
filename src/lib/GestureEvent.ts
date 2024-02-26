import type { Coord } from "@/lib/Coord";
import { ref } from "vue";

export interface ScreenEvent {
  pointerType: "mouse" | "pen" | "touch";
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
  page: Coord;
  screen: Coord;
  target: EventTarget | null;
}

export interface GestureEvent {
  firstEvent: ScreenEvent;
  currentEvent: ScreenEvent;
  previousEvent?: ScreenEvent;
}

export const gestureAnyEvent = ref<GestureEvent | undefined>(undefined);

const pointerScreenEvents: { [k: number]: GestureEvent } = {};

document.oncontextmenu = (event: MouseEvent) => {
  const gestureEvent = mouseEventToGestureEvent("oncontextmenu", event);
  alert(stringifyEvent(gestureEvent))
  gestureAnyEvent.value = gestureEvent;
  return false;
};

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

function mouseEventToGestureEvent(type: string, event: MouseEvent) {
  const screenEvent = mouseEventToScreenEvent(type, event);
  const prevGestureEvent = pointerScreenEvents[screenEvent.pointerId] as GestureEvent | undefined;

  const currentGestureEvent: GestureEvent = {
    firstEvent: prevGestureEvent ? prevGestureEvent.firstEvent : screenEvent,
    currentEvent: screenEvent,
    previousEvent: prevGestureEvent ? prevGestureEvent.currentEvent : undefined,
  };
  pointerScreenEvents[screenEvent.pointerId] = currentGestureEvent;

  return currentGestureEvent;
}

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
    firstEvent: prevGestureEvent ? prevGestureEvent.firstEvent : screenEvent,
    currentEvent: screenEvent,
    previousEvent: prevGestureEvent ? prevGestureEvent.currentEvent : undefined,
  };
  pointerScreenEvents[screenEvent.pointerId] = currentGestureEvent;

  return currentGestureEvent;
}

function mouseEventToScreenEvent(type: string, event: MouseEvent): ScreenEvent {
  const screenEvent: ScreenEvent = {
    type,
    buttons: event.buttons,
    target: event.target,
    width: 1,
    height: 1,
    pressure: 1,
    tangentialPressure: Math.PI / 2,
    azimuthAngle: (event as any).azimuthAngle,
    altitudeAngle: (event as any).altitudeAngle,
    pointerId: 1,
    timeStamp: event.timeStamp,
    isPrimary: true,
    pointerType: "mouse",
    page: { x: event.pageX, y: event.pageY },
    screen: { x: event.screenX, y: event.screenY },
  };
  return screenEvent;
}

function pointerEventToScreenEvent(type: string, event: PointerEvent): ScreenEvent {
  const screenEvent: ScreenEvent = {
    type,
    buttons: event.buttons,
    target: event.target,
    width: event.width,
    height: event.height,
    pressure: event.pressure,
    tangentialPressure: event.tangentialPressure,
    azimuthAngle: (event as any).azimuthAngle,
    altitudeAngle: (event as any).altitudeAngle,
    pointerId: event.pointerId,
    timeStamp: event.timeStamp,
    isPrimary: event.isPrimary,
    pointerType: event.pointerType as any,
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
    "  ",
  );
  function unpack(o: any) {
    const obj = (Array.isArray(o) ? [] : {}) as any;
    for (const k in o) obj[k] = o[k];
    return obj;
  }
}
