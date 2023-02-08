import type { DragOrigin } from "@/interfaces/DragOrigin";
import type { RgbaLayer } from "@/interfaces/RgbaLayer";
import { ref } from "vue";
import artboardService from "./artboardService";
import { snapSize } from "./editorAppState";
import type { CanvasPointerEvent } from "./mouseService";


const dragOrigin = ref<DragOrigin | null>();

export function canvasDragStart(pointerEvent: CanvasPointerEvent) {
    dragOrigin.value = {
        x: pointerEvent.point.x,
        y: pointerEvent.point.y,
        data: artboardService.artwork.value.context.getImageData(
            0,
            0,
            artboardService.artwork.value.bounds.width,
            artboardService.artwork.value.bounds.height
        ),
        frame: { ...artboardService.artwork.value.frame },
    };
}

export function canvasDragEnd() {
    dragOrigin.value = null;
}

export function canvasDrag(
    pointerEvent: CanvasPointerEvent
) {
    if (!dragOrigin.value) return
    const dx =
        ((pointerEvent.point.x - dragOrigin.value.x) /
            artboardService.artwork.value.context.canvas.offsetWidth) *
        artboardService.artwork.value.context.canvas.width;
    const dy =
        ((pointerEvent.point.y - dragOrigin.value.y) /
            artboardService.artwork.value.context.canvas.offsetHeight) *
        artboardService.artwork.value.context.canvas.height;
    const snapDx = Math.floor(dx / snapSize.value) * snapSize.value;
    const snapDy = Math.floor(dy / snapSize.value) * snapSize.value;
    artboardService.artwork.value.context.clearRect(
        0,
        0,
        artboardService.artwork.value.bounds.width,
        artboardService.artwork.value.bounds.height
    );
    artboardService.artwork.value.context.putImageData(
        dragOrigin.value.data,
        snapDx,
        snapDy
    );
    artboardService.resetRgbaLayer();

}