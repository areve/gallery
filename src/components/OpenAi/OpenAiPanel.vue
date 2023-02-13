<template>
  <ToolPanel title="OpenAI" v-model:panelState="panelStates.openAi">
    <button type="button" @click="generateImage()">Generate</button>
    <button type="button" @click="variationImage()">Variation</button>
    <button type="button" @click="outpaintImage()">Outpaint</button>
    <textarea
      type="text"
      id="prompt"
      class="prompt"
      v-model="openAiPanelState.prompt"
    ></textarea>
  </ToolPanel>
</template>

<script lang="ts" setup>
import {
  cloneContext,
  createContextFromImage,
} from "@/lib/canvas/canvas-utils";
import artboardService from "@/components/Artboard/artboardService";
import compositionService, { createLayer } from "@/lib/canvas/composition";
import { panelStates } from "@/components/EditorApp/panelStates";
import galleryApi from "@/components/Gallery/galleryApi";
import openAiService from "@/components/OpenAi/openAiService";
import { clone } from "lodash";
import { openAiPanelState } from "@/components/OpenAi/openAiPanelState";
import ToolPanel from "../ToolPanel/ToolPanel.vue";

async function generateImage() {
  await openAiService.generate({
    prompt: openAiPanelState.value.prompt,
  });
}

async function variationImage() {
  await openAiService.variation({
    image: artboardService.createContextFromFrame(1024, 1024),
    metadata: artboardService.artwork.value.metadata,
  });
}

async function outpaintImage() {
  const outpaintImage_saveBeforeOutpaint = false;
  if (outpaintImage_saveBeforeOutpaint) {
    await compositionService.flatten({
      metadata: artboardService.artwork.value.metadata,
      width: artboardService.artwork.value.context.canvas.width,
      height: artboardService.artwork.value.context.canvas.height,
      layers: [createLayer(artboardService.artwork.value.context)],
    });
  }

  const compositionRequired =
    artboardService.artwork.value.frame.height !== 1024 ||
    artboardService.artwork.value.frame.width !== 1024 ||
    artboardService.artwork.value.frame.width !==
      artboardService.artwork.value.bounds.width ||
    artboardService.artwork.value.frame.height !==
      artboardService.artwork.value.bounds.height;

  const compositionData = compositionRequired
    ? {
        context: cloneContext(artboardService.artwork.value.context),
        frame: clone(artboardService.artwork.value.frame),
      }
    : null;

  const outpaintResult = await openAiService.outpaint({
    prompt: openAiPanelState.value.prompt,
    image: artboardService.createContextFromFrame(1024, 1024),
    metadata: artboardService.artwork.value.metadata,
  });

  if (compositionData && outpaintResult) {
    const artwork = await galleryApi.getGalleryItem(outpaintResult.filename);

    await compositionService.flatten({
      metadata: artwork.metadata,
      width: compositionData.context.canvas.width,
      height: compositionData.context.canvas.height,
      layers: [
        {
          context: createContextFromImage(artwork.image),
          x: compositionData.frame.x,
          y: compositionData.frame.y,
          width: compositionData.frame.width,
          height: compositionData.frame.height,
        },
        createLayer(compositionData.context),
      ],
    });
  }
}
</script>

<style scoped>
.prompt-panel {
  padding: 0.4em;
  grid-area: document;
  overflow: hidden;
  position: relative;
}

.prompt {
  resize: none;
  width: 100%;
  height: 3.2em;
}
</style>
