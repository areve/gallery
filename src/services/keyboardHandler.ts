import { useKeypress } from 'vue3-keypress'
import { action, applyEffect } from "./appActions";
import { toolSelected } from "./appState";

const keyCodes = {
  "e": 69,
  "g": 71,
  "r": 82,
  "s": 83,
  "1": 49,
  "2": 50,
  "3": 51,
}

export function useKeyboardHandler() {
  useKeypress({
    keyEvent: "keyup",
    keyBinds: [
      {
        keyCode: keyCodes.s,
        modifiers: ["ctrlKey"],
        success: () => action('save'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes.r,
        modifiers: ["ctrlKey"],
        success: () => action('reset'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes.e,
        modifiers: ["ctrlKey"],
        success: () => applyEffect('shotgun'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes.g,
        modifiers: ["ctrlKey"],
        success: () => applyEffect('shotgun'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes["1"],
        modifiers: ["ctrlKey"],
        success: () => toolSelected.value = 'pen',
        preventDefault: true,
      },
      {
        keyCode: keyCodes["2"],
        modifiers: ["ctrlKey"],
        success: () => toolSelected.value = 'drag',
        preventDefault: true,
      },
      {
        keyCode: keyCodes["3"],
        modifiers: ["ctrlKey"],
        success: () => toolSelected.value = 'drag-frame',
        preventDefault: true,
      },
    ],
    onAnyKey: (e: any) => console.log(e.event.keyCode)
  })

  useKeypress({
    keyEvent: "keydown",
    keyBinds: [
      {
        keyCode: keyCodes.s, // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes.r, // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes.e, // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes.g, // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes["1"], // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes["2"], // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
      {
        keyCode: keyCodes["3"], // disable default behaviour
        modifiers: ["ctrlKey"],
        success: () => null,
        preventDefault: true,
      },
    ],
  })
}