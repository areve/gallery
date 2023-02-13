import type { MenuItem } from "./MenuItem";
import { useKeypress } from "vue3-keypress";

const Key = {
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
  LeftWindowKey: 91,
  Win: 91,
  RightWindowKey: 92,
  Menu: 92,
  SelectKey: 93,
  Select: 93,
  Numpad0: 96,
  Num0: 96,
  Numpad1: 97,
  Num1: 97,
  Numpad2: 98,
  Num2: 98,
  Numpad3: 99,
  Num3: 99,
  Numpad4: 100,
  Num4: 100,
  Numpad5: 101,
  Num5: 101,
  Numpad6: 102,
  Num6: 102,
  Numpad7: 103,
  Num7: 103,
  Numpad8: 104,
  Num8: 104,
  Numpad9: 105,
  Num9: 105,
  Multiply: 106, //?
  Add: 107,
  Subtract: 109,
  DecimalPoint: 110,
  Divide: 111,
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
  NumLock: 144,
  ScrollLock: 145,
  SemiColon: 186,
  ";": 186,
  Equals: 187,
  "=": 187,
  Comma: 188,
  ",": 188,
  Dash: 189,
  "-": 189,
  Period: 190,
  ".": 190,
  PlusSign: 187,
  "+": 187,
  ForwardSlash: 191,
  "/": 191,
  Tilde: 192,
  "#": 192,
  GraveAccent: 192,
  "`": 192,
  OpenBracket: 219,
  "[": 219,
  ClosedBracket: 221,
  "]": 221,
  Quote: 222, //?
};

function getKeyCode(value: string) {
  return Key[
    Object.keys(Key).find((key) => key.toLowerCase() === value.toLowerCase())
  ];
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

export function useKey(menuItem: MenuItem) {
  if (!menuItem.key) return;
  const modifiers = getModifiers(menuItem.key);
  const key = getKey(menuItem.key);
  const keyConfig = {
    key,
    modifiers,
    action: menuItem.action,
  };
  console.log(keyConfig, menuItem);
  if (key === undefined) return;
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

// TODO collect them all and add them at once
export function addKeysForMenuItems(items: MenuItem[]) {
  items.forEach((item) => {
    useKey(item);

    if (item.items) {
      addKeysForMenuItems(item.items);
    }
  });
}
