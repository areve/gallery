/* eslint-disable no-loss-of-precision */
import { angleLerp } from "@/lib/lerp";
import { lerp } from "@/lib/lerp";
import type { ColorCoord } from "@/interfaces/Color";

export type OklchColorCoord = ColorCoord;

// Converts a color from the Oklch color space to the sRGB color space as fast as I could make it go
export function oklch2srgb(oklch: ColorCoord): ColorCoord {
  // Convert oklch color to oklab color space
  const oklab: ColorCoord = [
    oklch[0],
    oklch[1] * Math.cos((oklch[2] * Math.PI) / 180),
    oklch[1] * Math.sin((oklch[2] * Math.PI) / 180),
  ];

  // Convert oklab color to linear light color in LMS color space
  const lms: ColorCoord = [
    (0.99999999845051981432 * oklab[0] + 0.39633779217376785678 * oklab[1] + 0.21580375806075880339 * oklab[2]) ** 3,
    (1.0000000088817607767 * oklab[0] + -0.1055613423236563494 * oklab[1] + -0.063854174771705903402 * oklab[2]) ** 3,
    (1.0000000546724109177 * oklab[0] + -0.089484182094965759684 * oklab[1] + -1.2914855378640917399 * oklab[2]) ** 3,
  ];

  // Convert linear light color in LMS space to linear light color in XYZ color space
  const xyz: ColorCoord = [
    1.2268798733741557 * lms[0] + -0.5578149965554813 * lms[1] + 0.28139105017721583 * lms[2],
    -0.04057576262431372 * lms[0] + 1.1122868293970594 * lms[1] + -0.07171106666151701 * lms[2],
    -0.07637294974672142 * lms[0] + -0.4214933239627914 * lms[1] + 1.5869240244272418 * lms[2],
  ];

  // Convert linear light color in XYZ space to linear light color in RGB space
  const lrgb: ColorCoord = [
    (12831 / 3959) * xyz[0] + (-329 / 214) * xyz[1] + (-1974 / 3959) * xyz[2],
    (-851781 / 878810) * xyz[0] + (1648619 / 878810) * xyz[1] + (36519 / 878810) * xyz[2],
    (705 / 12673) * xyz[0] + (-2585 / 12673) * xyz[1] + (705 / 667) * xyz[2],
  ];

  // Apply gamma correction to linear light color to get final sRGB color
  const srgb: ColorCoord = [gammaCorrect(lrgb[0]), gammaCorrect(lrgb[1]), gammaCorrect(lrgb[2])];
  return srgb;
}

function gammaCorrect(v: number) {
  return v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
}

function inverseGammaCorrect(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function srgb2oklch(srgb: ColorCoord): ColorCoord {
  const lrgb: ColorCoord = [inverseGammaCorrect(srgb[0]), inverseGammaCorrect(srgb[1]), inverseGammaCorrect(srgb[2])];

  const xyz: ColorCoord = [
    (506752 / 1228815) * lrgb[0] + (87881 / 245763) * lrgb[1] + (12673 / 70218) * lrgb[2],
    (87098 / 409605) * lrgb[0] + (175762 / 245763) * lrgb[1] + (12673 / 175545) * lrgb[2],
    (7918 / 409605) * lrgb[0] + (87881 / 737289) * lrgb[1] + (1001167 / 1053270) * lrgb[2],
  ];

  const lmsCubeRooted = [
    (0.8190224432164319 * xyz[0] + 0.3619062562801221 * xyz[1] + -0.12887378261216414 * xyz[2]) ** (1 / 3),
    (0.0329836671980271 * xyz[0] + 0.9292868468965546 * xyz[1] + 0.03614466816999844 * xyz[2]) ** (1 / 3),
    (0.048177199566046255 * xyz[0] + 0.26423952494422764 * xyz[1] + 0.6335478258136937 * xyz[2]) ** (1 / 3),
  ];

  const oklab = [
    0.2104542553 * lmsCubeRooted[0] + 0.793617785 * lmsCubeRooted[1] + -0.0040720468 * lmsCubeRooted[2],
    1.9779984951 * lmsCubeRooted[0] + -2.428592205 * lmsCubeRooted[1] + 0.4505937099 * lmsCubeRooted[2],
    0.0259040371 * lmsCubeRooted[0] + 0.7827717662 * lmsCubeRooted[1] + -0.808675766 * lmsCubeRooted[2],
  ];

  const hue = (Math.atan2(oklab[2], oklab[1]) * 180) / Math.PI;
  const oklch: ColorCoord = [oklab[0], Math.sqrt(oklab[1] ** 2 + oklab[2] ** 2), hue >= 0 ? hue : hue + 360];
  return oklch;
}

export function lerpOklchColor(color1: OklchColorCoord, color2: OklchColorCoord): OklchColorCoord {
  if (color1[3] === 0) return color2;
  if (color2[3] === 0) return color1;

  const alpha = lerp(color1[3], 1, color2[3]);
  const weight = color2[3] / alpha;
  const lightness = lerp(color1[0], color2[0], weight);
  const chroma = lerp(color1[1], color2[1], weight);
  const hue = angleLerp(isNaN(color1[2]) ? color2[2] : color1[2], isNaN(color2[2]) ? color1[2] : color2[2], weight);

  return [lightness, chroma, hue, alpha];
}
