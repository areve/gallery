import { type Artwork } from "./Artwork";
import { ref } from "vue";

export const galleryState = ref({
  artworks: [] as Artwork[],
});
