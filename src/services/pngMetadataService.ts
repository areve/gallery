import png from "png-metadata";
// import fs from "fs";

// // This module allows reading and writing of png metadata
// // common values for keys are (from png docs):

// // * Title: Short (one line) title or caption for image
// // * Author: Name of image's creator
// // * Description: Description of image (possibly long)
// // * Copyright: Copyright notice
// // * Creation Time: Time of original image creation
// // * Software: Software used to create the image
// // * Disclaimer: Legal disclaimer
// // * Warning: Warning of nature of content
// // * Source: Device used to create the image
// // * Comment: Miscellaneous comment; conversion from

// // values can be a string or an array of strings

// // e.g.
// // console.log(setMetadata('./downloads/sd182935.png', {
// //     'Title': ['woo hoo', 'haha'],
// //     'Author': 'Bilbo Baggins!',
// //     'foo': undefined
// // }));

// // e.g.
// // console.log(readMetadata('./downloads/sd182935.png'));
// // {
// //     'Title': ['woo hoo', 'haha'],
// //     'Author': ['Bilbo Baggins!']
// // }

export interface Metadata {
  [name: string]: any[];
}

export function readMetadata(pngBytes: string) {
  const chunks = png.splitChunk(pngBytes);
  const metadataRaw = chunks.filter((x: any) => x.type === "tEXt");
  const metadataList = metadataRaw.map((x: any) => x.data.split("\0"));
  const metadata: Metadata = {};

  metadataList.forEach((item: any) => {
    let value = item[1];
    if (value[0] === "{") {
      value = JSON.parse(value);
    }
    if (!Array.isArray(metadata[item[0]])) {
      metadata[item[0]] = [];
    }
    metadata[item[0]].push(value);
  });
  return metadata;
}

function blobToBinary(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (_e) => resolve(reader.result as string);
    reader.onerror = (_e) => reject(reader.error);
    reader.onabort = (_e) => reject(new Error("Read aborted"));
    reader.readAsBinaryString(blob); // TODO readAsBinaryString deprecated some say
  });
}

function binaryToBlob(binary: string): Blob {
  const len = binary.length;
  const array = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: "image/png" });
}

export async function setMetadata(blob: Blob, metadata: Metadata) {
  //   const savedMetadata = readMetadata(filePath);
  const newMetadata = Object.assign({}, metadata);
  //   if (JSON.stringify(newMetadata) === JSON.stringify(savedMetadata)) return false;

  //   const file = png.readFileSync(filePath);
  const pngBinary = await blobToBinary(blob);
  // console.log(foo);

  const chunks = png.splitChunk(pngBinary);
  // console.log(chunks);
  const newChunks: any[] = [];

  chunks.forEach((chunk: any) => {
    if (chunk.type !== "tEXt" || chunk.data.split("\0").length !== 2) {
      newChunks.push(chunk);
    }
  });

  const iend = newChunks.pop();
  for (const key in newMetadata) {
    if (newMetadata[key]) {
      const values = Array.isArray(newMetadata[key]) ? newMetadata[key] : [newMetadata[key]];
      values.forEach((value) => {
        if (typeof value === "object") {
          const newChunk = png.createChunk("tEXt", `${key}\0${JSON.stringify(value)}`);
          newChunks.push(newChunk);
        } else {
          const newChunk = png.createChunk("tEXt", `${key}\0${value}`);
          newChunks.push(newChunk);
        }
      });
    }
  }
  newChunks.push(iend);

  return binaryToBlob(png.joinChunk(newChunks));
}
