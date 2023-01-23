import { ref } from "vue";

import { useKeypress } from 'vue3-keypress'
import { applyEffect, save, selectTool } from "./appActions";

const keyCodes = {
  "e": 69,
  "g": 71,
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
        success: () => save(),
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
        success: () => selectTool('pen'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes["2"],
        modifiers: ["ctrlKey"],
        success: () => selectTool('drag'),
        preventDefault: true,
      },
      {
        keyCode: keyCodes["3"],
        modifiers: ["ctrlKey"],
        success: () => selectTool('drag-frame'),
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