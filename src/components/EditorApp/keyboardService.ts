import type { MenuItem } from "./MenuItem";
import { useKeypress } from "vue3-keypress";

const keyCodes: { [key: string]: number } = {
  "0": 48,
  "1": 49,
  "2": 50,
  "3": 51,
  "4": 52,
  "5": 53,
  "6": 54,
  "7": 55,
  "8": 56,
  "9": 57,
  a: 65,
  b: 66,
  c: 67,
  d: 68,
  e: 69,
  f: 70,
  g: 71,
  h: 72,
  i: 73,
  j: 74,
  k: 75,
  l: 76,
  m: 77,
  n: 78,
  o: 79,
  p: 80,
  q: 81,
  r: 82,
  s: 83,
  t: 84,
  u: 85,
  v: 86,
  w: 87,
  x: 88,
  y: 89,
  z: 90,
  "<": 188,
  ">": 190,
  "/": 191,
};

function keyUpBinds(keyConfigs: any[]) {
  const result: any[] = [];
  keyConfigs.forEach((keyConfig) => {
    result.push({
      keyCode: keyCodes[keyConfig.key],
      modifiers: keyConfig.modifiers,
      success: keyConfig.action,
      preventDefault: true,
    });
  });

  return result;
}

function keyDownBinds(keyConfigs: any[]) {
  const result: any[] = [];
  keyConfigs.forEach((keyConfig) => {
    result.push({
      keyCode: keyCodes[keyConfig.key],
      modifiers: keyConfig.modifiers,
      success: () => null,
      preventDefault: true,
    });
  });

  return result;
}

function getModifiers(key: string) {
  const result: string[] = [];
  if (/Ctrl\+/.test(key)) result.push("ctrlKey");
  if (/Shift\+/.test(key)) result.push("shiftKey");
  return result;
}

function getKey(key: string) {
  let result = key;
  result = result.replace(/Ctrl\+/, "");
  result = result.replace(/Shift\+/, "");
  return result.toLowerCase();
}

export function useKey(menuItem: MenuItem) {
  if (!menuItem.key) return;
  const modifiers = getModifiers(menuItem.key);
  const key = getKey(menuItem.key);
  const keyConfig = {
    key,
    modifiers,
    action: menuItem.action,
  };

  // TODO calling this lots of times is clearly not how it was intededed
  useKeypress({
    keyEvent: "keyup",
    keyBinds: [...keyUpBinds([keyConfig])],
    // onAnyKey: (e: any) => console.log(e.event.keyCode),
  });

  useKeypress({
    keyEvent: "keydown",
    keyBinds: [...keyDownBinds([keyConfig])],
  });
}

export function addKeysForMenuItems(items: MenuItem[]) {
  items.forEach((item) => {
    useKey(item);
    console.log(item.key);
    if (item.items) {
      addKeysForMenuItems(item.items);
    }
  });
}
