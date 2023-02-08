//https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699

import type { HsvColor, RgbColor } from "@/interfaces/RgbaLayer";

export function rgb2hsv([r, g, b]: RgbColor): HsvColor {
  const v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

export function hsv2rgb([h, s, v]: HsvColor): RgbColor {
  function h2c(n: number) {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  }
  return [h2c(5), h2c(3), h2c(1)];
}

// in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
// function rgb2hsl(r: byte, g: byte, b: byte) {
//     let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
//     let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
//     return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
// }

// // input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
// function hsv2rgb(h, s, v) {
//     let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
//     return [f(5), f(3), f(1)];
// }

// let hsl2hsv = (h, s, l, v = s * Math.min(l, 1 - l) + l) => [h, v ? 2 - 2 * l / v : 0, v];

// let hsv2hsl = (h, s, v, l = v - v * s / 2, m = Math.min(l, 1 - l)) => [h, m ? (v - l) / m : 0, l];
