import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";

export const panel = ref({
    settings: {
        visible: false
    }
});

export const toolSelected = ref<Tool>('pencil')
export const eraserSize = ref<number>(300)
export const snapSize = ref<number>(128)
export const pencilColor = ref<string>('#00ff00')
