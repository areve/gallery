import type { Tools } from "@/interfaces/EditorView-interfaces";
import { ref } from "vue";

export const panel = ref({
    settings: {
        visible: false
    }
});

export const toolSelected = ref<Tools>('drag')
export const penSize = ref<number>(300)
export const snapSize = ref<number>(128)
