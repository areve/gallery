// export function clearCircle(
//   context: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   radius: number
// ) {
//   context.beginPath();
//   context.arc(x, y, radius, 0, 2 * Math.PI, false);
//   context.save();
//   context.clip();
//   context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
//   context.restore();
// }

// export async function drawCircle(
//   context: CanvasRenderingContext2D,
//   x: number,
//   y: number,
//   radius: number,
//   color: string,
//   from: { x: number; y: number } | null
// ) {
//   const ctx = context;
//   ctx.lineWidth = radius * 2;
//   ctx.strokeStyle = color;
//   ctx.lineCap = "round";

//   ctx.beginPath();
//   ctx.moveTo(from?.x || x, from?.y || y);
//   ctx.lineTo(x, y);
//   ctx.stroke();
// }
