import { ref } from "vue";

export interface AppAction {
    id: number
}

const newAction = (): AppAction => ({
    id: Math.random()
})

export const onSave = ref<AppAction>(newAction())
export const save = () => onSave.value = newAction()

