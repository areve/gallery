import type { Ref } from "vue";
import type { Rect } from "./Rect";

export interface DocumentVueReady {
  documentContext: CanvasRenderingContext2D;
  bounds: Ref<Rect>;
  frame: Ref<Rect>;
  resetFrame: Function; // TODO better type
  mouseUp: Function; // TODO better type
  drawOverlay: Function;
}


