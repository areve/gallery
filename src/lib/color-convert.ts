//https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699

export type byte = number;
export type degrees = number;
export type fraction = number;

// in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
// function rgb2hsl(r: byte, g: byte, b: byte) {
//     let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
//     let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
//     return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
// }

export function rgb2hsv([r, g, b]: [byte, byte, byte]): [
  degrees,
  fraction,
  byte
] {
  const v = Math.max(r, g, b),
    c = v - Math.min(r, g, b);
  const h =
    c && (v == r ? (g - b) / c : v == g ? 2 + (b - r) / c : 4 + (r - g) / c);
  return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

export function hsv2rgb([h, s, v]: [degrees, fraction, byte]): [
  byte,
  byte,
  byte
] {
  function fff(n: number) {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  }
  return [fff(5), fff(3), fff(1)];
}
// // input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
// function hsv2rgb(h, s, v) {
//     let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
//     return [f(5), f(3), f(1)];
// }

// let hsl2hsv = (h, s, l, v = s * Math.min(l, 1 - l) + l) => [h, v ? 2 - 2 * l / v : 0, v];

// let hsv2hsl = (h, s, v, l = v - v * s / 2, m = Math.min(l, 1 - l)) => [h, m ? (v - l) / m : 0, l];

export function rgb2ryb(
  rgb: [number, number, number]
): [number, number, number] {
  let [h, s, v] = rgb2hsv(rgb);

  if (h > 0 && h < 60) {
    h = h * 2;
  } else if (h >= 60 && h < 120) {
    h = h + 60;
  } else if (h >= 120 && h < 240) {
    h = (h - 120) / 2 - 180;
  }
  return hsv2rgb([h, s, v]);
}

export function ryb2rgb(
  ryb: [number, number, number]
): [number, number, number] {
  let [h, s, v] = rgb2hsv(ryb);

  if (h >= 0 && h < 120) {
    h = h / 2;
  } else if (h >= 120 && h < 180) {
    h = h - 60;
  } else if (h >= 180 && h < 240) {
    h = (h - 180) * 2 + 120;
  }

  return hsv2rgb([h, s, v]);
}

// These are faster than mine but the colours aren't quite as good (maybe)
// http://www.deathbysoftware.com/colors/index.html
export function rgb2ryb_found([red, green, blue]: [number, number, number]) {
  const white = Math.min(red, green, blue);

  red -= white;
  green -= white;
  blue -= white;

  const maxGreen = Math.max(red, green, blue);
  let yellow = Math.min(red, green);

  red -= yellow;
  green -= yellow;

  if (blue > 0 && green > 0) {
    blue /= 2;
    green /= 2;
  }

  yellow += green;
  blue += green;

  const maxYellow = Math.max(red, yellow, blue);

  if (maxYellow > 0) {
    const n = maxGreen / maxYellow;
    red *= n;
    yellow *= n;
    blue *= n;
  }

  red += white;
  yellow += white;
  blue += white;

  return [Math.floor(red), Math.floor(yellow), Math.floor(blue)];
}

export function ryb2rgb_found([red, yellow, blue]: [number, number, number]) {
  const white = Math.min(red, yellow, blue);

  red -= white;
  yellow -= white;
  blue -= white;

  const maxYellow = Math.max(red, yellow, blue);
  let green = Math.min(yellow, blue);

  yellow -= green;
  blue -= green;

  if (blue > 0 && green > 0) {
    blue *= 2.0;
    green *= 2.0;
  }

  red += yellow;
  green += yellow;

  const maxGreen = Math.max(red, green, blue);

  if (maxGreen > 0) {
    const n = maxYellow / maxGreen;
    red *= n;
    green *= n;
    blue *= n;
  }

  red += white;
  green += white;
  blue += white;

  return [Math.floor(red), Math.floor(green), Math.floor(blue)];
}
