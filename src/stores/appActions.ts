import { ref } from "vue";

export interface AppAction {
    id: number
}

export type EffectType = 'shotgun'

export interface ApplyEffect extends AppAction {
    type: EffectType
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

