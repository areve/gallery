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
    var weight = t * t * (3 - 2 * t);
    return A + weight * (B - A);
}

function getR(iR: number, iY: number, iB: number) {
    // red
    var x0 = cubicInt(iB, 1.0, 0.163);
    var x1 = cubicInt(iB, 1.0, 0.0);
    var x2 = cubicInt(iB, 1.0, 0.5);
    var x3 = cubicInt(iB, 1.0, 0.2);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getG(iR: number, iY: number, iB: number) {
    // green
    var x0 = cubicInt(iB, 1.0, 0.373);
    var x1 = cubicInt(iB, 1.0, 0.66);
    var x2 = cubicInt(iB, 0.0, 0.0);
    var x3 = cubicInt(iB, 0.5, 0.094);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB(iR: number, iY: number, iB: number) {
    // blue
    var x0 = cubicInt(iB, 1.0, 0.6);
    var x1 = cubicInt(iB, 0.0, 0.2);
    var x2 = cubicInt(iB, 0.0, 0.5);
    var x3 = cubicInt(iB, 0.0, 0.0);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}


function ryb2rgb(color: [number, number, number]) {
    var R = color[0] / 255;
    var G = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR2(R, G, B);
    var Y1 = getY2(R, G, B);
    var B1 = getB2(R, G, B);
    var ret = [R1, Y1, B1];
    return ret;
}



function rgb2ryb(color: [number, number, number]) {
    var R = color[0] / 255;
    var G = color[1] / 255;
    var B = color[2] / 255;
    var R1 = getR1(R, G, B);
    var Y1 = getY1(R, G, B);
    var B1 = getB1(R, G, B);
    var ret = [R1, Y1, B1];
    return ret;
}



function getR0(iR: number, iG: number, iB: number) {
    // TODO red 
    var x0 = cubicInt(iB, 0.0, 0.0); // blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish
    var x2 = cubicInt(iB, 1.0, 1.0); // redish - magentaish
    var x3 = cubicInt(iB, 1.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getY0(iR: number, iG: number, iB: number) {
    // TODO yellow
    var x0 = cubicInt(iB, 0.0, 0.0); // blueish
    var x1 = cubicInt(iB, 1.0, 1.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish
    var x3 = cubicInt(iB, 1.0, 2.0); // yellowish - whiteish
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB0(iR: number, iG: number, iB: number) {
    // TODO blue
    // var x0 = cubicInt(iB, 0.0, 0.0);
    var x0 = cubicInt(iB, 0.0, 1.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, 1.0); // greenish
    var x2 = cubicInt(iB, 0.0, 1.0); // redish
    var x3 = cubicInt(iB, 0.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}


function getR1(iR: number, iG: number, iB: number) {
    // TODO red 
    var x0 = cubicInt(iB, 0.0, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 1.0, 1.0); // redish - magentaish
    var x3 = cubicInt(iB, 0.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getY1(iR: number, iG: number, iB: number) {
    // TODO yellow
    var x0 = cubicInt(iB, 0.0, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.666, 0.333); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish - magendaish
    var x3 = cubicInt(iB, 1.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB1(iR: number, iG: number, iB: number) {
    // TODO blue
    // var x0 = cubicInt(iB, 0.0, 0.0);
    var x0 = cubicInt(iB, 0.0, 1.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.333, 0.666); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 1.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getR2(iR: number, iG: number, iB: number) {
    // TODO red 
    var x0 = cubicInt(iB, 0.0, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 1.0, 1.0); // redish - magentaish
    var x3 = cubicInt(iB, 1.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getY2(iR: number, iG: number, iB: number) {
    // TODO yellow
    var x0 = cubicInt(iB, 0.0, 0.0); // blackish? - blueish
    var x1 = cubicInt(iB, 1.0, 1.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 0.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.5, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB2(iR: number, iG: number, iB: number) {
    // TODO blue
    // var x0 = cubicInt(iB, 0.0, 0.0);
    var x0 = cubicInt(iB, 0.0, 1.0); // blackish? - blueish
    var x1 = cubicInt(iB, 0.0, 0.0); // greenish - cyanish
    var x2 = cubicInt(iB, 0.0, 1.0); // redish - magendaish
    var x3 = cubicInt(iB, 0.0, 2.0); // yellowish - whiteish (2)
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}