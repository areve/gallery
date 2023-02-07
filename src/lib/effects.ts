export function shotgunEffect(context: CanvasRenderingContext2D) {
  for (let i = 0; i < 5000; i++) {
    const x = Math.random() * context.canvas.width;
    const y = Math.random() * context.canvas.height;
    context.beginPath();

    const radius = 8;
    context.arc(x, y, radius / 2, 0, 2 * Math.PI, false);
    context.save();
    context.clip();
    context.clearRect(x - radius / 2, y - radius / 2, radius, radius);
    context.restore();
  }
}
