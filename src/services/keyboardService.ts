import type { MenuItem } from "../components/Menu/MenuItem";
import { useKeypress } from "vue3-keypress";

// The names of the following keys are for my UK laptop, other keyboards will differ
const Key: { [key: string]: number } = {
  Backspace: 8,
  Tab: 9,
  Enter: 13,
  Shift: 16,
  Ctrl: 17,
  Alt: 18,
  PauseBreak: 19,
  CapsLock: 20,
  Escape: 27,
  Esc: 27,
  Space: 32,
  " ": 32,
  PageUp: 33,
  PageDown: 34,
  End: 35,
  Home: 36,
  LeftArrow: 37,
  Left: 37,
  UpArrow: 38,
  Up: 38,
  RightArrow: 39,
  Right: 39,
  DownArrow: 40,
  Down: 40,
  PrintScreen: 44,
  PrintScr: 44,
  Insert: 45,
  Ins: 45,
  Delete: 46,
  Del: 46,
  Zero: 48,
  "0": 48,
  One: 49,
  "1": 49,
  Two: 50,
  "2": 50,
  Three: 51,
  "3": 51,
  Four: 52,
  "4": 52,
  Five: 53,
  "5": 53,
  Six: 54,
  "6": 54,
  Seven: 55,
  "7": 55,
  Eight: 56,
  "8": 56,
  Nine: 57,
  "9": 57,
  A: 65,
  B: 66,
  C: 67,
  D: 68,
  E: 69,
  F: 70,
  G: 71,
  H: 72,
  I: 73,
  J: 74,
  K: 75,
  L: 76,
  M: 77,
  N: 78,
  O: 79,
  P: 80,
  Q: 81,
  R: 82,
  S: 83,
  T: 84,
  U: 85,
  V: 86,
  W: 87,
  X: 88,
  Y: 89,
  Z: 90,
  Win: 91,
  // RightWindowKey: 92,
  // SelectKey: 93,
  Numpad0: 96,
  Numpad1: 97,
  Numpad2: 98,
  Numpad3: 99,
  Numpad4: 100,
  Numpad5: 101,
  Numpad6: 102,
  Numpad7: 103,
  Numpad8: 104,
  Numpad9: 105,
  NumpadMultiply: 106,
  NumpadAdd: 107,
  NumpadSubtract: 109,
  NumpadPoint: 110,
  NumpadDivide: 111,
  F1: 112,
  F2: 113,
  F3: 114,
  F4: 115,
  F5: 116,
  F6: 117,
  F7: 118,
  F8: 119,
  F9: 120,
  F10: 121,
  F11: 122,
  F12: 123,
  // NumLock: 144,
  // ScrollLock: 145,
  SemiColon: 186,
  ";": 186,
  Equals: 187,
  "=": 187,
  Comma: 188,
  ",": 188,
  Minus: 189,
  "-": 189,
  Period: 190,
  ".": 190,
  Plus: 187,
  "+": 187,
  Slash: 191,
  "/": 191,
  BackSlash: 220,
  "\\": 220,
  SingleQuote: 192,
  "'": 192,
  OpenSquareBracket: 219,
  "[": 219,
  ClosedSquareBracket: 221,
  "]": 221,
  Hash: 222,
  BackTick: 223,
};

function getKeyCode(value: string) {
  const key = Object.keys(Key).find(
    (key) => key.toLowerCase() === value.toLowerCase()
  );
  return key ? Key[key] : undefined;
}

function keyUpBinds(keyConfigs: any[]) {
  const result: any[] = [];
  keyConfigs.forEach((keyConfig) => {
    result.push({
      keyCode: keyConfig.key,
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
      keyCode: keyConfig.key,
      modifiers: keyConfig.modifiers,
      success: () => null,
      preventDefault: true,
    });
  });

  return result;
}

function getModifiers(key: string) {
  const result: string[] = [];
  if (/Ctrl\+/i.test(key)) result.push("ctrlKey");
  if (/Shift\+/i.test(key)) result.push("shiftKey");
  return result;
}

function getKey(key: string) {
  let result = key;
  result = result.replace(/Ctrl\+/i, "");
  result = result.replace(/Shift\+/i, "");
  return getKeyCode(result);
}

export function addKeysForMenuItems(items: MenuItem[]) {
  const keyConfigs = getKeyConfigs(items);
  useKeypress({
    keyEvent: "keyup",
    keyBinds: [...keyUpBinds(keyConfigs)],
    //onAnyKey: (e: any) => console.log(e.event.keyCode),
  });

  useKeypress({
    keyEvent: "keydown",
    keyBinds: [...keyDownBinds(keyConfigs)],
  });
}

function getKeyConfigs(items: MenuItem[]) {
  const result: any[] = [];
  items.forEach((item) => {
    if (item.key) {
      const modifiers = getModifiers(item.key);
      const key = getKey(item.key);
      if (key === undefined) console.error("invalid key config", item.key);
      const keyConfig = {
        key,
        modifiers,
        action: item.action,
      };
      result.push(keyConfig);
    }

    if (item.items) {
      result.push(...getKeyConfigs(item.items));
    }
  });

  return result;
}
