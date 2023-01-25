import type { Tools } from "@/interfaces/Tools";
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
    tool: Tools
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

// TODO this could just be a state rather than an event
export const onSelectTool = ref<SelectTool>(undefined!)
export const selectTool = (tool: Tools) => {
    onSelectTool.value = {
        id: id(),
        tool
    }
}

