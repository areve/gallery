let context: OffscreenCanvasRenderingContext2D | null = null;
let canvas: OffscreenCanvas;
let imageData: ImageData | null = null;
let i = 0;
let start = new Date().getTime();

function animate() {
  if (context) {
    i++;

    if (!imageData) imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 255;
    }

    context.putImageData(imageData, 0, 0);

    const frameInterval = 100;
    if (i % frameInterval === 0) {
      const end = new Date().getTime();
      const duration = end - start;
      const fps = Math.round((frameInterval / duration) * 1000);
      console.log(`${frameInterval} frames took ${duration}ms, ${fps}fps`);
      start = new Date().getTime();
    }
  }
  requestAnimationFrame(animate);
}

onmessage = function (ev: MessageEvent) {
  canvas = ev.data.canvas;
  context = canvas.getContext("2d");
  animate();
};

export {};
