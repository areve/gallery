import { createTiles, rectsOverlappedByAny, type Rect } from "@/lib/Rect";
import { colorConverter } from "./color/color";

export type ColorSpace = "oklch" | "srgb";

export interface BitmapLayer {
  data: Float32Array;
  width: number;
  height: number;
  channels: number;
  alphaChannel: number;
  space: ColorSpace;
  dirty: Rect[];
  tiles: Rect[];
}

export interface OklchBitmapLayer extends BitmapLayer {
  space: "oklch";
}
export interface SrgbBitmapLayer extends BitmapLayer {
  space: "srgb";
}

let tempImageData: ImageData | null = null;

const colorAttachment: GPURenderPassColorAttachment = {
  view: undefined! as GPUTextureView,
  clearValue: [0, 0.0, 0.5, 0.5],
  loadOp: "clear",
  storeOp: "store",
};

const renderPassDescriptor: GPURenderPassDescriptor = {
  label: "our basic canvas renderPass",
  colorAttachments: [colorAttachment],
};

export function createBitmapLayer(width: number, height: number, space: ColorSpace, tileSize: number = width): BitmapLayer {
  const channels = 4;
  const alphaChannel = 4;
  return {
    space,
    channels,
    alphaChannel,
    height,
    width,
    data: new Float32Array(width * height * channels),
    dirty: [],
    tiles: createTiles(width, height, tileSize),
  };
}

export function convertBitmapLayer(source: BitmapLayer, space: ColorSpace) {
  const width = source.width;
  const height = source.height;
  const dest = createBitmapLayer(width, height, space, source.tiles[0].width);

  const sourceChannels = source.channels;
  const destChannels = dest.channels;
  const last = width * height * sourceChannels;
  const sourceData = source.data;
  const destData = dest.data;

  const colorConvert = colorConverter(source.space, dest.space);
  for (let i = 0; i < last; i += sourceChannels) {
    const sourcePixel = [];
    for (let j = 0; j < sourceChannels; j++) {
      sourcePixel.push(sourceData[i + j]);
    }
    const color = colorConvert(sourcePixel);
    for (let j = 0; j < destChannels; j++) {
      destData[i + j] = color[j];
    }
  }

  dest.dirty.push({
    x: 0,
    y: 0,
    width,
    height,
  });

  return dest;
}

let device: GPUDevice;
let pipeline: GPURenderPipeline;
let texture: GPUTexture;
let bindGroup: GPUBindGroup;

export async function renderBitmapLayer3d(bitmapLayer: BitmapLayer, context: GPUCanvasContext) {
  // TODO always painting the whole rect for simplicity, put it back later perhaps

  if (!device) {
    console.log("setup pipeline");
    const adapter = await navigator.gpu?.requestAdapter();
    device = await adapter?.requestDevice()!;
    if (!device) return console.error("need a browser that supports WebGPU");

    // bgra8unorm
    // const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
    const presentationFormat = "rgba8unorm";
    context.configure({
      device,
      format: presentationFormat,
      alphaMode: "premultiplied",
    });

    texture = device.createTexture({
      size: [bitmapLayer.width, bitmapLayer.height, 1],
      // format: "rgba8unorm", // Use a filterable format
      format: "rgba32float",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
    });

    const module = device.createShaderModule({
      label: "our hardcoded red color shader",
      code: /* wgsl */ `
        const canvasWidth = 609.0;
        const canvasHeight = 1069.0;
        @group(0) @binding(0) var myTexture: texture_2d<f32>;
        @group(0) @binding(1) var mySampler: sampler;

        @vertex fn vs(
          @builtin(vertex_index) vertexIndex : u32
        ) -> @builtin(position) vec4f {
          let pos = array(
            vec2f(-1.0, -1.0),
            vec2f(1.0, 1.0),
            vec2f(-1.0, 1.0) ,
            vec2f(-1.0, -1.0),
            vec2f(1.0, 1.0),
            vec2f(1.0, -1.0) 
          );
   
          return vec4f(pos[vertexIndex], 0.0, 1.0);
        }
 
         // return vec4<f32>(1.0, 0.0, 0.5, 0.5);
         
         
        //  @fragment
        //  fn fs(@builtin(position) coord: vec4<f32>) -> @location(0) vec4f {
        //      let texCoord = coord.xy / vec2<f32>(canvasWidth / 2, canvasHeight);
        //      return textureSample(myTexture, mySampler, texCoord); // This works if the texture format is filterable
        //  }
        @fragment
        fn fs(@builtin(position) coord: vec4<f32>) -> @location(0) vec4f {
          let texCoord = coord.xy / vec2<f32>(canvasWidth, canvasHeight);
          let texel = textureLoad(myTexture, vec2<i32>(texCoord * vec2<f32>(canvasWidth, canvasHeight)), 0); // Level 0 mipmap
          return texel;
        }
        // @fragment
        // fn fs(@builtin(position) coord: vec4<f32>) -> @location(0) vec4f {
        //     let texCoord = coord.xy / vec2<f32>(canvasWidth / 2, canvasHeight);
        //     return textureSample(myTexture, mySampler, texCoord);
        // }

        
      `,
    });

    console.log("presentationFormat", presentationFormat);

    pipeline = device.createRenderPipeline({
      label: "our hardcoded red line pipeline",
      layout: "auto",
      vertex: {
        module,
      },
      fragment: {
        module,
        targets: [
          {
            format: presentationFormat,
            // blend: {
            //   color: {
            //     srcFactor: "src-alpha",
            //     dstFactor: "one-minus-src-alpha",
            //     operation: "add",
            //   },
            //   alpha: {
            //     srcFactor: "one",
            //     dstFactor: "one-minus-src-alpha",
            //     operation: "add",
            //   },
            // },
            // writeMask: GPUColorWrite.ALL,
          },
        ],
      },
    });

    // const dataBuffer = device.createBuffer({
    //   size: bitmapLayer.data.byteLength,
    //   usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    // });

    // bindGroup = device.createBindGroup({
    //   layout: pipeline.getBindGroupLayout(0),
    //   entries: [{ binding: 0, resource: { buffer: dataBuffer } }],
    // });
    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: "linear",
    });

    bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0), // Assuming this is for @group(0)
      entries: [
        {
          binding: 0, // Bind the texture
          resource: texture.createView(),
        },
        // {
        //   binding: 1, // Bind the sampler
        //   resource: sampler,
        // },
      ],
    });
  }

  renderRect3d(bitmapLayer, context, pipeline, {
    x: 0,
    y: 0,
    width: bitmapLayer.width,
    height: bitmapLayer.height,
  });

  bitmapLayer.dirty = [];
}

export function renderRect3d(bitmapLayer: BitmapLayer, context: GPUCanvasContext, pipeline: GPURenderPipeline, rect: Rect) {
  // console.log("new renderRect3d", context.constructor.name === "GPUCanvasContext");
  //

  // console.log(bitmapLayer.data.slice(0, 32))
  device.queue.writeTexture(
    { texture: texture }, // Destination texture
    bitmapLayer.data, // Source data
    {
      offset: 0,
      bytesPerRow: bitmapLayer.width * 4 * 4, // 4 channels (RGBA), 4 bytes per float
      rowsPerImage: bitmapLayer.height,
    },
    { width: bitmapLayer.width, height: bitmapLayer.height, depthOrArrayLayers: 1 },
  );

  colorAttachment.view = context.getCurrentTexture().createView();
  const encoder = device.createCommandEncoder({ label: "our encoder" });
  const pass = encoder.beginRenderPass(renderPassDescriptor);
  pass.setPipeline(pipeline);
  pass.setBindGroup(0, bindGroup);
  pass.draw(6);
  pass.end();
  const commandBuffer = encoder.finish();
  device.queue.submit([commandBuffer]);
  return device.queue.onSubmittedWorkDone();
}

export function renderBitmapLayer(bitmapLayer: BitmapLayer, context: OffscreenCanvasRenderingContext2D) {
  const dirtyTiles = rectsOverlappedByAny(bitmapLayer.tiles, bitmapLayer.dirty);
  dirtyTiles.forEach((rect: Rect) => renderRect(bitmapLayer, context, rect));

  bitmapLayer.dirty = [];
}

export function renderRect(bitmapLayer: BitmapLayer, context: OffscreenCanvasRenderingContext2D, rect: Rect) {
  if (!context) return;
  if (!bitmapLayer) return;

  if (!tempImageData || tempImageData.width != rect.width || tempImageData.height != rect.height) {
    console.log("new temp");
    tempImageData = new ImageData(rect.width, rect.height);
  }
  console.log("renderRect");

  // bitmapLayer.data is a float32.data
  const pixelData = tempImageData.data;
  const layerData = bitmapLayer.data;
  const width = bitmapLayer.width;
  const channels = bitmapLayer.channels;
  const convert = colorConverter(bitmapLayer.space, "srgb");
  // TODO instead of all this use webGPU
  for (let y = 0; y < rect.height; y++) {
    for (let x = 0; x < rect.width; x++) {
      const i = ((y + rect.y) * width + x + rect.x) * channels;
      const o = (y * rect.width + x) * channels;
      const rgb = [layerData[i + 0], layerData[i + 1], layerData[i + 2]];
      pixelData[o + 0] = rgb[0] * 255;
      pixelData[o + 1] = rgb[1] * 255;
      pixelData[o + 2] = rgb[2] * 255;
      pixelData[o + 3] = layerData[i + 3] * 255;
    }
  }

  context.putImageData(tempImageData, rect.x, rect.y);
}
