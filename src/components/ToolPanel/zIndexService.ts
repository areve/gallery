interface ZIndexRegister {
  id: string;
  zIndex: number;
  setZIndex: (zIndex: number) => void;
}

let registry: ZIndexRegister[] = [];

export function moveToTop(id: string) {
  const found = registry.find((x) => x.id === id)!;
  const startIndex = 10;
  found.zIndex = registry.length + startIndex + 1;
  sortRegistry();
  for (let i = 0; i < registry.length; i++) {
    registry[i].zIndex = startIndex + i;
    registry[i].setZIndex(registry[i].zIndex);
  }
}

function sortRegistry() {
  registry = registry.sort(
    (a: ZIndexRegister, b: ZIndexRegister) => a.zIndex - b.zIndex
  );
}

export function registerZIndex(
  id: string,
  zIndex: number,
  setZIndex: (zIndex: number) => void
) {
  registry.push({
    id,
    zIndex,
    setZIndex,
  });
}
