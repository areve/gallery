import type { Coord } from "@/interfaces/Coord";
import type { Rect } from "@/interfaces/Rect";
import { ref } from "vue";

type SwipeEdge = "right" | "left";

export interface SwipeEdgeEvent {
  start: Coord;
  end: Coord;
  edge: SwipeEdge;
}

export const swipeEdgeEvent = ref<SwipeEdgeEvent | null>(null);

const swipeState = {
  edgeSize: 10,
  start: null as Coord | null,
  edge: null as SwipeEdge | null,
};

document.addEventListener("touchstart", function (event: TouchEvent) {
  if (event.touches.length !== 1) return;
  const screenSize: Rect = {
    x: 0,
    y: 0,
    width: window.screen.width,
    height: window.screen.height,
  };
  const touchCoord: Coord = {
    x: window.screenX + event.touches[0].screenX,
    y: window.screenY + event.touches[0].screenX,
  };

  if (touchCoord.x > screenSize.width - swipeState.edgeSize) {
    swipeState.start = touchCoord;
    swipeState.edge = "right";
  }

  if (touchCoord.x < swipeState.edgeSize) {
    swipeState.start = touchCoord;
    swipeState.edge = "left";
  }
});

document.addEventListener("touchmove", function (event: TouchEvent) {
  if (!swipeState.start) return;

  const touchCoord: Coord = {
    x: window.screenX + event.touches[0].screenX,
    y: window.screenY + event.touches[0].screenX,
  };

  if (swipeState.edge == "right" && touchCoord.x < swipeState.start.x) {
    swipeEdgeEvent.value = {
      start: swipeState.start,
      end: touchCoord,
      edge: "right",
    };
  }

  if (swipeState.edge == "left" && touchCoord.x > swipeState.start.x) {
    swipeEdgeEvent.value = {
      start: swipeState.start,
      end: touchCoord,
      edge: "left",
    };
  }

  swipeState.start = null;
  swipeState.edge = null;
  swipeEdgeEvent.value = null;
});

document.addEventListener("touchend", function (_: TouchEvent) {
  swipeState.start = null;
  swipeState.edge = null;
  swipeEdgeEvent.value = null;
});

document.addEventListener("touchcancel", function (_: TouchEvent) {
  swipeState.start = null;
  swipeState.edge = null;
  swipeEdgeEvent.value = null;
});
