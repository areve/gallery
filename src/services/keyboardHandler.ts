import { useKeypress } from 'vue3-keypress'
import { action, applyEffect } from "./appActions";
import { galleryPanelVisible, menuVisible, toolSelected } from "./editorAppState";

const keyPressConfigs: any[] = [
  {
    key: "m",
    modifiers: ["ctrlKey"],
    action: () => menuVisible.value = !menuVisible.value
  },
  {
    key: "s",
    modifiers: ["ctrlKey"],
    action: () => action('save'),
  },
  {
    key: "r",
    modifiers: ["ctrlKey"],
    action: () => action('reset'),
  },
  {
    key: "g",
    modifiers: ["ctrlKey", "shiftKey"],
    action: () => applyEffect('shotgun'),
  },
  {
    key: "g",
    modifiers: ["ctrlKey"],
    action: () => galleryPanelVisible.value = !galleryPanelVisible.value,
  },
  {
    key: "1",
    modifiers: ["ctrlKey"],
    action: () => toolSelected.value = 'eraser',
  },
  {
    key: "2",
    modifiers: ["ctrlKey"],
    action: () => toolSelected.value = 'drag',
  },
  {
    key: "3",
    modifiers: ["ctrlKey"],
    action: () => toolSelected.value = 'drag-frame',
  },
  {
    key: "4",
    modifiers: ["ctrlKey"],
    action: () => toolSelected.value = 'pencil',
  },
]

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
  "a": 65,
  "b": 66,
  "c": 67,
  "d": 68,
  "e": 69,
  "f": 70,
  "g": 71,
  "h": 72,
  "i": 73,
  "j": 74,
  "k": 75,
  "l": 76,
  "m": 77,
  "n": 78,
  "o": 79,
  "p": 80,
  "q": 81,
  "r": 82,
  "s": 83,
  "t": 84,
  "u": 85,
  "v": 86,
  "w": 87,
  "x": 88,
  "y": 89,
  "z": 90,
}

function keyUpBinds(keyConfigs: any[]) {
  const result: any[] = []
  keyConfigs.forEach(keyConfig => {
    result.push({
      keyCode: keyCodes[keyConfig.key],
      modifiers: keyConfig.modifiers,
      success: keyConfig.action,
      preventDefault: true,
    })
  });

  return result
}

function keyDownBinds(keyConfigs: any[]) {
  const result: any[] = []
  keyConfigs.forEach(keyConfig => {
    result.push({
      keyCode: keyCodes[keyConfig.key],
      modifiers: keyConfig.modifiers,
      success: () => null,
      preventDefault: true,
    })
  });

  return result
}


export function useKeyboardHandler() {
  useKeypress({
    keyEvent: "keyup",
    keyBinds: [...keyUpBinds(keyPressConfigs),

    ],
    onAnyKey: (e: any) => console.log(e.event.keyCode)
  })

  useKeypress({
    keyEvent: "keydown",
    keyBinds: [...keyDownBinds(keyPressConfigs)]
  })
}