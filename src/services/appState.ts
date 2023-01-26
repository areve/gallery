import type { Tool } from "@/interfaces/Tool";
import { ref } from "vue";

export const panel = ref({
    settings: {
        visible: false
    }
});

export const toolSelected = ref<Tool>('drag')
export const penSize = ref<number>(300)
export const snapSize = ref<number>(128)
