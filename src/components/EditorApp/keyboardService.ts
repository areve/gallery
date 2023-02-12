import type { MenuItem } from "./MenuItem";
import { useKeypress } from "vue3-keypress";

import { Key } from "ts-keycode-enum";

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

    if (item.items) {
      addKeysForMenuItems(item.items);
    }
  });
}
