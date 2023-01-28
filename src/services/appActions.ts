import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";


export type AppActionType = 'save'| 'reset'| 'auto-crop' | 'show-settings'
export interface AppActionBase {
    id: number
}

export interface AppAction extends AppActionBase {
    action: AppActionType
}

export type EffectType = 'shotgun'

export interface ApplyEffect extends AppActionBase {
    type: EffectType
} 
export interface SelectTool extends AppActionBase {
    tool: Tool
} 

const id = () => Math.random()

export const onAction = ref<AppAction>(undefined!)
export const action = (action: AppActionType) => onAction.value = { id: id(), action }


export const onApplyEffect = ref<ApplyEffect>(undefined!)
export const applyEffect = (type: EffectType) => {
    onApplyEffect.value = {
        id: id(),
        type
    }
}


