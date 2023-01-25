import { Ref } from "vue";
import { Rect } from "./Rect";


export interface DocumentVueReady {
  documentContext: CanvasRenderingContext2D;
  bounds: Ref<Rect>;
  frame: Ref<Rect>;
  resetFrame: Function; // TODO better type
  mouseUp: Function; // TODO better type
  drawOverlay: Function;
}
