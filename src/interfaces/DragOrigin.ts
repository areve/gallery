import { Rect } from "./Rect";


export interface DragOrigin {
  x: number;
  y: number;
  data: ImageData;
  frame: Rect;
}
