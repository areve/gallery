// let context: OffscreenCanvasRenderingContext2D | null = null;
// let imageData: ImageData;
// let i = 0;
// let start = new Date().getTime();

// //    this.boundAnimate = this.animate.bind(this);

// requestAnimationFrame(() => {
//   console.log("requestAnimationFrame");
//   timedCount();
// });

// function timedCount() {
//   if (context) {
//     i++;
//     if (!imageData) imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
//     const data = imageData.data;

//     for (let i = 0; i < data.length; i++) {
//       data[i] = Math.random() * 255;
//     }

//     context.putImageData(imageData, 0, 0);

//     const frameInterval = 100;
//     if (i % frameInterval === 0) {
//       const end = new Date().getTime();
//       const duration = end - start;
//       const fps = Math.round((frameInterval / duration) * 1000);
//       console.log(`${frameInterval} frames took ${duration}ms, ${fps}fps`);
//       start = new Date().getTime();
//     }
//   }

//   //setTimeout(timedCount, 10);
//   requestAnimationFrame(timedCount);
// }

// timedCount();

// self.onmessage = function handleMessageFromMain(msg: MessageEvent) {
//   const canvas: OffscreenCanvas = msg.data.canvas;
//   context = canvas.getContext("2d", {
//     willReadFrequently: true,
//   });
//   console.log(canvas);
// };

// export {};

let context: OffscreenCanvasRenderingContext2D | null = null;
let canvas: OffscreenCanvas; // was it this?
let imageData: ImageData;
let i = 0;
let start = new Date().getTime();

function animate() {
  if (context) {
    // was it this?
    i++;

    //if (!imageData)  //this?
    imageData = context.getImageData(0, 0, context.canvas.width, context.canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 255;
    }

    context.putImageData(imageData, 0, 0);

    const frameInterval = 100;
    if (i % frameInterval === 0) {
      const end = new Date().getTime();
      const duration = end - start;
      const fps = Math.round((frameInterval / duration) * 1000);
      console.log(`${frameInterval} frames took ${duration}ms, ${fps}fps`);
      start = new Date().getTime();
    }
  }
  requestAnimationFrame(animate);
}

onmessage = function (ev: MessageEvent) {
  canvas = ev.data.canvas;
  context = canvas.getContext("2d", {
     willReadFrequently: true, //this?
  });
  animate();
};

export {};
