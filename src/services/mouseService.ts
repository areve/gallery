import { ref } from "vue";

export const globalDragOrigin = ref<MouseEvent | TouchEvent | null>();

export function mouseDown(event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = event;
}

export function mouseUp(_event: MouseEvent | TouchEvent) {
  globalDragOrigin.value = null;
}
