import type { Coord } from "@/interfaces/Coord";
import { ref } from "vue";

export const pointerUpEvent = ref<PointerEvent | null>(null);
export const pointerDownEvent = ref<PointerEvent | null>(null);
export const pointerMoveEvent = ref<PointerEvent | null>(null);

document.onpointerdown = function (event: PointerEvent) {
  pointerDownEvent.value = event; //toPointerEvents();
};
// export function pointerDown(event: MouseEvent | TouchEvent) {
//   // export function pointerDown(event: MouseEvent | TouchEvent)
//   // event.preventDefault();
// }
// document.onmousemove = function() {
//   console.log('ss')
// }
// document.ontouchstart = function (event) {
// if (event.touches.length > 1) {
//If there is more than one touch
// event.preventDefault();
// }
// };

// document.addEventListener(
//   "touchmove",
//   (event) => {
//     // if (weShouldStopDefaultScrollAndZoom) {
//     event.preventDefault();
//     event.stopImmediatePropagation();
//     // };
//   },
//   { passive: false }
// );
// window.ontouchmove = function (evt: TouchEvent) {
//   evt.preventDefault();
//   evt.stopImmediatePropagation()
//   pointerMove(evt);
// };
document.onpointermove = function (event: PointerEvent) {
  // console.log("pp", event);
  pointerMoveEvent.value = event; //toPointerEvents(event);
};

document.onpointerup = function (event: PointerEvent) {
  // console.log("pp", event);
  pointerUpEvent.value = event; //toPointerEvents(event);
};

// export function pointerMove(event: MouseEvent | TouchEvent) {
//   event.preventDefault();
//   // pointerMoveEvents.value = toPointerEvents(event);
// }

// export function pointerUp(event: MouseEvent | TouchEvent) {
//   // pointerUpEvents.value = toPointerEvents(event);
// }

// export interface BasePointerEvent {
//   readonly page: Coord;
//   readonly index?: number;
//   readonly sourceEvent: TouchEvent | MouseEvent;
//   readonly force?: number;
//   readonly radiusX?: number;
//   readonly radiusY?: number;
// }

// export interface CanvasPointerEvent extends BasePointerEvent {
//   readonly canvasPoint: Coord;
// }

// export function pointerEventsPreventDefault(pointerEvents: PointerEvent) {
//   // pointerEvents.forEach((pointerEvent) => {
//   pointerEvents.preventDefault();
//   // });
// }

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

// function toPointerEvents(event: TouchEvent | MouseEvent | PointerEvent) {
//   const pointerEvents: BasePointerEvent[] = [];
//   if ((event as TouchEvent).touches) {
//     const touchEvent = event as TouchEvent;
//     for (let i = 0; i < touchEvent.touches.length; i++) {
//       const touch = touchEvent.touches[i];
//       const x = touch.pageX;
//       const y = touch.pageY;
//       const pointerEvent: BasePointerEvent = {
//         page: {
//           x,
//           y,
//         },
//         index: i,
//         sourceEvent: event,
//         force: touch.force,
//         radiusX: touch.radiusX,
//         radiusY: touch.radiusY,
//       };
//       pointerEvents.push(pointerEvent);
//     }
//   } else {
//     const mouseEvent: MouseEvent = event as MouseEvent;
//     const x = mouseEvent.pageX;
//     const y = mouseEvent.pageY;

//     const pointerEvent: BasePointerEvent = {
//       page: {
//         x,
//         y,
//       },
//       index: 0,
//       sourceEvent: event,
//     };
//     pointerEvents.push(pointerEvent);
//   }
//   return pointerEvents;
// }
