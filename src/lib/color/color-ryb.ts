import type { RgbColor, RybColor } from "@/interfaces/RgbaLayer";
import { hsv2rgb, rgb2hsv } from "./color-hsv";

export function rgb2ryb(rgb: RgbColor): RybColor {
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

export function ryb2rgb(ryb: RybColor): RgbColor {
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

// These are faster than mine that use hsv2rgb but the colours aren't quite as good (maybe)
// http://www.deathbysoftware.com/colors/index.html
export function rgb2ryb_found([red, green, blue]: RgbColor) {
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

  return <RybColor>[Math.floor(red), Math.floor(yellow), Math.floor(blue)];
}

export function ryb2rgb_found([red, yellow, blue]: RybColor) {
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

  return <RgbColor>[Math.floor(red), Math.floor(green), Math.floor(blue)];
}
