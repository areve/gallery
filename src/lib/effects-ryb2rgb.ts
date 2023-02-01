import { cloneContext } from "./canvas";


export function rgb2rybEffect(context: CanvasRenderingContext2D) {
    const w = context.canvas.width
    const h = context.canvas.height
    const imageData = context.getImageData(0, 0, w, h)
    const pix = imageData.data;

    const last = w * h * 4
    for (let i = 0; i < last; i += 4) {
        const [r, g, b] = rgb2ryb([pix[i], pix[i + 1], pix[i + 2]])
        pix[i] = r
        pix[i + 1] = g
        pix[i + 2] = b
        pix[i + 3] = 255
    }

    context.putImageData(imageData, 0, 0)
}

export function rgb2rgbEffect(context: CanvasRenderingContext2D) {
    const w = context.canvas.width
    const h = context.canvas.height
    const imageData = context.getImageData(0, 0, w, h)
    const pix = imageData.data;

    const last = w * h * 4
    for (let i = 0; i < last; i += 4) {
        const [r, g, b] = rgb2rgb([pix[i], pix[i + 1], pix[i + 2]])
        pix[i] = r
        pix[i + 1] = g
        pix[i + 2] = b
        pix[i + 3] = 255
    }
    context.putImageData(imageData, 0, 0)
}

export function ryb2rgbEffect(context: CanvasRenderingContext2D) {

    const w = context.canvas.width
    const h = context.canvas.height
    const imageData = context.getImageData(0, 0, w, h)
    const pix = imageData.data;

    const last = w * h * 4
    for (let i = 0; i < last; i += 4) {
        const [r, g, b] = ryb2rgb([pix[i], pix[i + 1], pix[i + 2]])
        pix[i] = r
        pix[i + 1] = g
        pix[i + 2] = b
        pix[i + 3] = 255
    }

    context.putImageData(imageData, 0, 0)
}


function cubicInt(t: number, A: number, B: number) {
    return A + t * (B - A);
}

function ryb2rgb(color: [number, number, number]) {
    var R = color[0] / 255;
    var G = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR2(R, G, B);
    var Y1 = getG2(R, G, B);
    var B1 = getB2(R, G, B);
    var ret = [R1, Y1, B1];
    return ret;
}



function rgb2ryb(color: [number, number, number]) {
    var R = color[0] / 255;
    var G = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR1(R, G, B);
    var Y1 = getG1(R, G, B);
    var B1 = getB1(R, G, B);
    var ret = [R1, Y1, B1];
    return ret;
}

function rgb2rgb(color: [number, number, number]) {
    var R = color[0] / 255;
    var G = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR0(R, G, B);
    var Y1 = getG0(R, G, B);
    var B1 = getB0(R, G, B);
    var ret = [R1, Y1, B1];
    return ret;
}



const main0 = 1.0
const white0 = 1.0
const black0 = 0.0
const mix0 = 1.0
function getR0(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black0, 0.0); // blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish
    var x2 = cubicInt(iB, main0, mix0); // redish - magentaish
    var x3 = cubicInt(iB, mix0, white0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getG0(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black0, 0.0); // blueish
    var x1 = cubicInt(iB, main0, mix0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish
    var x3 = cubicInt(iB, mix0, white0); // yellowish - whiteish
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB0(iR: number, iG: number, iB: number) {
    // var x0 = cubicInt(iB, 0.0, 0.0);
    var x0 = cubicInt(iB, black0, main0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, mix0); // greenish
    var x2 = cubicInt(iB, 0.0, mix0); // redish
    var x3 = cubicInt(iB, 0.0, white0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}


const main1 = 1.0
const white1 = 1.0
const black1 = 0.0
const mix1 = 1.0
function getR1(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black1, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 1.0, 1.0); // redish - magentaish
    var x3 = cubicInt(iB, 1.0, white1); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getG1(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black1, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 0.5); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish - magendaish
    var x3 = cubicInt(iB, 1.0, white1); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB1(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black1, 1.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 1.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 1.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.0, white1); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}


const main2 = 1.0
const white2 = 1.0
const black2 = 0.0
const mix2 = 1.0
function getR2(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black2, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 1.0, 1.0); // redish - magentaish
    var x3 = cubicInt(iB, 1.0, white2); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getG2(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black2, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 1.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.5, white2); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB2(iR: number, iG: number, iB: number) {
    var x0 = cubicInt(iB, black2, 1.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 1.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.0, white2); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}