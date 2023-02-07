import { rgb2ryb, ryb2rgb } from "../color-convert";

export function rgb2rybEffect(context: CanvasRenderingContext2D) {
  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  const last = w * h * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = rgb2ryb([pix[i], pix[i + 1], pix[i + 2]]);
    pix[i] = r;
    pix[i + 1] = g;
    pix[i + 2] = b;
    pix[i + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
}

export function rgb2rgbEffect(context: CanvasRenderingContext2D) {
  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  const last = w * h * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = [pix[i], pix[i + 1], pix[i + 2]];
    pix[i] = r;
    pix[i + 1] = g;
    pix[i + 2] = b;
    pix[i + 3] = 255;
  }
  context.putImageData(imageData, 0, 0);
}

export function ryb2rgbEffect(context: CanvasRenderingContext2D) {
  const w = context.canvas.width;
  const h = context.canvas.height;
  const imageData = context.getImageData(0, 0, w, h);
  const pix = imageData.data;

  const last = w * h * 4;
  for (let i = 0; i < last; i += 4) {
    const [r, g, b] = ryb2rgb([pix[i], pix[i + 1], pix[i + 2]]);
    pix[i] = r;
    pix[i + 1] = g;
    pix[i + 2] = b;
    pix[i + 3] = 255;
  }

  context.putImageData(imageData, 0, 0);
}
