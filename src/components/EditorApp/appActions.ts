import type { ToolType } from "@/interfaces/Tool";
import { ref } from "vue";

export type AppActionType = "save" | "reset" | "auto-crop";
export interface AppActionBase {
  id: number;
}

export interface AppAction extends AppActionBase {
  action: AppActionType;
}

export type EffectType = "shotgun" | "ryb2rgb" | "rgb2ryb" | "all-white";

export interface ApplyEffect extends AppActionBase {
  type: EffectType;
}
export interface SelectTool extends AppActionBase {
  tool: ToolType;
}

const id = () => Math.random();

export const onAction = ref<AppAction>(undefined!);
export const action = (action: AppActionType) => (onAction.value = { id: id(), action });

export const onApplyEffect = ref<ApplyEffect>(undefined!);
export const applyEffect = (type: EffectType) => {
  onApplyEffect.value = {
    id: id(),
    type,
  };
};
