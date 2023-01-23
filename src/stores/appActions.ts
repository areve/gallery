import type { Tools } from "@/views/EditorView-interfaces";
import { ref } from "vue";

export interface AppAction {
    id: number
}

export type EffectType = 'shotgun'

export interface ApplyEffect extends AppAction {
    type: EffectType
} 
export interface SelectTool extends AppAction {
    tool: Tools
} 

const id = () => Math.random()

export const onSave = ref<AppAction>(undefined!)
export const save = () => onSave.value = { id: id() }

export const onApplyEffect = ref<ApplyEffect>(undefined!)
export const applyEffect = (type: EffectType) => {
    onApplyEffect.value = {
        id: id(),
        type
    }
}
export const onSelectTool = ref<SelectTool>(undefined!)
export const selectTool = (tool: Tools) => {
    onSelectTool.value = {
        id: id(),
        tool
    }
}

