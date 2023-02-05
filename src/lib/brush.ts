import type { Brush } from "@/interfaces/Brush";

export function makeBrush(radius: number) {
  const width = radius * 2;
  const height = width;
  const channels = 4

  const rgbaData = new Float32Array(width * height * channels)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const rN = (y * width + x) * 4;
      const gN = rN + 1;
      const bN = rN + 2;
      const aN = rN + 3;

      const dx = x - radius;
      const dy = y - radius;
      const d = Math.sqrt(dy * dy + dx * dx);
      const val = 1 - d / radius;
      rgbaData[rN] = 1;
      rgbaData[gN] = 1;
      rgbaData[bN] = 1;
      rgbaData[aN] = val;
    }
  }

  return <Brush>{
    data: rgbaData,
    width,
    height
  }
}
