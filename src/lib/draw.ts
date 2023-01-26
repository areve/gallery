import { cloneContext } from "./canvas";

export function clearCircle(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
  context.beginPath();
  context.arc(x, y, radius, 0, 2 * Math.PI, false);
  context.save();
  context.clip();
  context.clearRect(x - radius, y - radius, radius * 2, radius * 2)
  context.restore();
}

export async function scaleImage(context: CanvasRenderingContext2D, by: number) {
    const clone = cloneContext(context)
    context.clearRect(0, 0, context.canvas.width, context.canvas.height)
  
    context.drawImage(
      clone.canvas,
      (context.canvas.width - clone.canvas.width * by) / 2,
      (context.canvas.height - clone.canvas.height * by) / 2,
      clone.canvas.width * by,
      clone.canvas.height * by)
  }
  
  