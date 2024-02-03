export function lerp(a: number, b: number, weight: number) {
  return a + weight * (b - a);
}

export function angleDiff(a: number, b: number) {
  let diff = (b - a) % 360;
  if (diff > 180) diff = -360 + diff;
  else if (diff < -180) diff = 360 + diff;
  return diff;
}

export function angleLerp(a: number, b: number, weight: number) {
  return a + weight * angleDiff(a, b);
}
