import type { DragOrigin } from "@/interfaces/DragOrigin"
import { ref } from "vue"

export const dragOrigin = ref<DragOrigin | null>()
export function mouseUp(mouse: MouseEvent) {
    dragOrigin.value = null
}
