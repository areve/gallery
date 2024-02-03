import type { Rect } from "@/interfaces/Rect";

export function rectsOverlappedByAny(a: Rect[], b: Rect[]) {
  const result: Rect[] = [];

  a.forEach((rect) => {
    if (rectOverlapsAny(rect, b)) result.push(rect);
  });
  return result;
}

export function rectOverlapsAny(rectangle: Rect, rects: Rect[]): boolean {
  for (const rect of rects) {
    if (rectOverlaps(rectangle, rect)) return true;
  }

  return false;
}

export function rectOverlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function createTiles(width: number, height: number, size: number) {
  const tiles: Rect[] = [];
  for (let x = 0; x < width; x += size) {
    for (let y = 0; y < height; y += size) {
      tiles.push({
        x,
        y,
        width: size,
        height: size,
      });
    }
  }
  return tiles;
}
