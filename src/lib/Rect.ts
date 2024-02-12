export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function rectsOverlappedByAny(a: Rect[], b: Rect[]) {
  return a.filter((rect) => rectOverlapsAny(rect, b));
}

export function rectOverlapsAny(rectangle: Rect, rects: Rect[]): boolean {
  return !!rects.find((rect) => rectOverlaps(rectangle, rect));
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
