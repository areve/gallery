import { type Artwork } from "./Artwork";
import { ref } from "vue";
export interface GalleryState {
  artworks: Artwork[];
}
export const galleryState = ref<GalleryState>({
  artworks: [],
});
