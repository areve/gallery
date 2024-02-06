let ctx: any;
let canvas: any;
function animate() {
  const p = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < p.data.length; i++) {
    p.data[i] = Math.random() * 255;
  }
  ctx.putImageData(p, 0, 0);

  requestAnimationFrame(animate);
}

onmessage = function (ev) {
  canvas = ev.data.canvas;
  ctx = canvas.getContext("2d");
  animate();
};

export {};
