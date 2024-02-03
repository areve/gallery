import type { Coord } from "@/interfaces/Coord";
import type { Rect } from "@/interfaces/Rect";
import { ref } from "vue";

export const pointerUpEvent = ref<PointerEvent | null>(null);
export const pointerDownEvent = ref<PointerEvent | null>(null);
export const pointerMoveEvent = ref<PointerEvent | null>(null);

const swipeState = {
  swipeEdgeSize: 10,
  swipeStart: null as Coord | null,
};
document.addEventListener("touchstart", function (event: TouchEvent) {
  if (event.touches.length !== 1) return;
  const screenSize: Rect = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
  };
  const touchStart: Coord = {
    x: window.screenX + event.touches[0].screenX,
    y: window.screenY + event.touches[0].screenX,
  };

  if (touchStart.x > screenSize.width - swipeState.swipeEdgeSize) {
    swipeState.swipeStart = touchStart;
    console.log("swipe-edge-left-maybe");
  }

  //  console.log("touchstart", touchStart, screenSize);
});

document.addEventListener("touchmove", function (event: TouchEvent) {
  if (!swipeState.swipeStart) return;

  const touchStart: Coord = {
    x: window.screenX + event.touches[0].screenX,
    y: window.screenY + event.touches[0].screenX,
  };

  if (touchStart.x < swipeState.swipeStart.x) {
    console.log("swipe-edge-left");
    alert("swipe-edge-left");
  } else {
    console.log("swipe-edge-left-cancel");
  }
  swipeState.swipeStart = null;

  // console.log("touchmove", event);
});

document.addEventListener("touchend", function (event: TouchEvent) {
  // console.log("touchend", event);
});

document.addEventListener("touchcancel", function (event: TouchEvent) {
  // console.log("touchcancel", event);
});

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
