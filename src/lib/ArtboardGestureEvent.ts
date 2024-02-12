import type { Coord } from "./Coord";
import type { GestureEvent, ScreenEvent } from "./GestureEvent";

export interface ArtboardGestureEvent extends GestureEvent {
  firstEvent: ArtboardEvent;
  currentEvent: ArtboardEvent;
  previousEvent?: ArtboardEvent;
}

export interface ArtboardEvent extends ScreenEvent {
  at: Coord;
}

export function gestureEventToArtboardGestureEvent(canvas: HTMLCanvasElement, gestureEvent: GestureEvent): ArtboardGestureEvent {
  const current = gestureEvent.currentEvent;
  const previous = gestureEvent.previousEvent;
  return {
    firstEvent: { at: getCanvasPoint(canvas, current.page), ...current },
    currentEvent: { at: getCanvasPoint(canvas, current.page), ...current },
    previousEvent: previous ? { at: getCanvasPoint(canvas, previous.page), ...previous } : undefined,
  };
}

function getCanvasPoint(canvas: HTMLCanvasElement, eventPoint: Coord): Coord {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((eventPoint.x - rect.x) / rect.width) * canvas.width,
    y: ((eventPoint.y - rect.y) / rect.height) * canvas.height,
  };
}
