import { ref } from "vue"

export const globalDragOrigin = ref<MouseEvent | null>()

export function mouseDown(mouse: MouseEvent) {
    globalDragOrigin.value = mouse
}

export function mouseUp(mouse: MouseEvent) {
    globalDragOrigin.value = null
}