import { cloneContext } from "./canvas";


export function rgb2rybEffect(context: CanvasRenderingContext2D) {
    const w = context.canvas.width
    const h = context.canvas.height
    const imageData = context.getImageData(0, 0, w, h)
    const pix = imageData.data;

    const last = w * h * 4
    for (let i = 0; i < last; i += 4) {
        const [r, g, b] = rgb2rybZZ([pix[i], pix[i + 1], pix[i + 2]])
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
        const [r, g, b] = ryb2rgbZZ([pix[i], pix[i + 1], pix[i + 2]])
        pix[i] = r
        pix[i + 1] = g
        pix[i + 2] = b
        pix[i + 3] = 255
    }

    context.putImageData(imageData, 0, 0)
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
// function getR(iR: number, iY: number, iB: number) {
//     // red
//     var x0 = cubicInt(iB, 1.0, 0.163);
//     var x1 = cubicInt(iB, 1.0, 0.0);
//     var x2 = cubicInt(iB, 1.0, 0.5);
//     var x3 = cubicInt(iB, 1.0, 0.2);
//     var y0 = cubicInt(iY, x0, x1);
//     var y1 = cubicInt(iY, x2, x3);
//     return Math.ceil(255 * cubicInt(iR, y0, y1));
// }

// function getG(iR: number, iY: number, iB: number) {
//     // green
//     var x0 = cubicInt(iB, 1.0, 0.373);
//     var x1 = cubicInt(iB, 1.0, 0.66);
//     var x2 = cubicInt(iB, 0.0, 0.0);
//     var x3 = cubicInt(iB, 0.5, 0.094);
//     var y0 = cubicInt(iY, x0, x1);
//     var y1 = cubicInt(iY, x2, x3);
//     return Math.ceil(255 * cubicInt(iR, y0, y1));
// }

// function getB(iR: number, iY: number, iB: number) {
//     // blue
//     var x0 = cubicInt(iB, 1.0, 0.6);
//     var x1 = cubicInt(iB, 0.0, 0.2);
//     var x2 = cubicInt(iB, 0.0, 0.5);
//     var x3 = cubicInt(iB, 0.0, 0.0);
//     var y0 = cubicInt(iY, x0, x1);
//     var y1 = cubicInt(iY, x2, x3);
//     return Math.ceil(255 * cubicInt(iR, y0, y1));
// }


// https://math.stackexchange.com/questions/305395/ryb-and-rgb-color-space-conversion

// RYB to RGB modified from Gosset et al

// RYB   000     100     010     110     001     101     011     111
//     white     red  yellow  orange    blue  purple   green   black
// R       1       1       1       1   0.163     0.5       0       0
// G       1       0       1     0.5   0.373       0    0.66       0
// B       1       0       0       0     0.6     0.5     0.2       0
// RGB to RYB

// and https://forum.electromage.com/t/ryb-colors-act-like-paint/1450/2
let magic = [
    [0, 0, 0], // black
    [1, 1, 0], // yellow
    [1, 0, 0], // red
    [1, 0.5, 0], // orange
    [0.163, 0.373, 0.6], // blue
    [0, 0.66, 0.2], // green
    [0.5, 0, 0.5], // purple
    [1, 1, 1], // white
]

magic = [
    [0, 0, 0],  // black
    [1, 1, 0], // yellow
    [1, 0, 0], // red
    [1, 0.5, 0], // orange
    [0, 0, 1], // blue
    [0, 1, 0], // green
    [1, 0, 1], // purple
    [1, 1, 1], // white
]

// http://www.deathbysoftware.com/colors/index.html
function cubicInt(t: number, A: number, B: number) {
    //return A + t * (B - A);
    return A + (t * t * (3 - 2 * t)) * (B - A);

}

// RGB   000     100     010     110     001     101     011     111
//     black     red   green  yellow    blue magenta turquoi.  white
// R       1       1       0       0       0   0.309       0       0
// Y       1       0       1       1       0       0   0.053       0
// B       1       0   0.483       0       1   0.469   0.210       0

// const black1 = [1, 1, 1]
// const red1 = [1, 0, 0]
// const green1 = [0, 1, 0.483]
// const yellow1 = [0, 1, 0]
// const blue1 = [0, 0, 1]
// const magenta1 = [0.309, 0, 0.469]
// const turquoise1 = [0, 0.053, 0.210]
// const white1 = [0, 0, 0]
function getR1(iR: number, iG: number, iB: number) {
    const c = 0
    var x0 = cubicInt(iB, magic[0][c], magic[4][c]);
    var x1 = cubicInt(iB, magic[1][c], magic[5][c]);
    var x2 = cubicInt(iB, magic[2][c], magic[6][c]);
    var x3 = cubicInt(iB, magic[3][c], magic[7][c]);
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getG1(iR: number, iG: number, iB: number) {
    const c = 1
    var x0 = cubicInt(iB, magic[0][c], magic[4][c]);
    var x1 = cubicInt(iB, magic[1][c], magic[5][c]);
    var x2 = cubicInt(iB, magic[2][c], magic[6][c]);
    var x3 = cubicInt(iB, magic[3][c], magic[7][c]);
    var y0 = cubicInt(iG, x0, x1);
    var y1 = cubicInt(iG, x2, x3);
    return Math.ceil(255 * cubicInt(iR, y0, y1));
}

function getB1(iR: number, iG: number, iB: number) {
    const c = 2
    var x0 = cubicInt(iB, magic[0][c], magic[4][c]);
    var x1 = cubicInt(iB, magic[1][c], magic[5][c]);
    var x2 = cubicInt(iB, magic[2][c], magic[6][c]);
    var x3 = cubicInt(iB, magic[3][c], magic[7][c]);
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


function ryb2rgbZZ([iRed, iYellow, iBlue]: [number, number, number]) {
    //-----------------------------------------------------------------------------------------

    // Remove the whiteness from the color.
    var iWhite = Math.min(iRed, iYellow, iBlue);

    iRed -= iWhite;
    iYellow -= iWhite;
    iBlue -= iWhite;

    var iMaxYellow = Math.max(iRed, iYellow, iBlue);

    // Get the green out of the yellow and blue
    var iGreen = Math.min(iYellow, iBlue);

    iYellow -= iGreen;
    iBlue -= iGreen;

    if (iBlue > 0 && iGreen > 0) {
        iBlue *= 2.0;
        iGreen *= 2.0;
    }

    // Redistribute the remaining yellow.
    iRed += iYellow;
    iGreen += iYellow;

    // Normalize to values.
    var iMaxGreen = Math.max(iRed, iGreen, iBlue);

    if (iMaxGreen > 0) {
        var iN = iMaxYellow / iMaxGreen;

        iRed *= iN;
        iGreen *= iN;
        iBlue *= iN;
    }

    // Add the white back in.
    iRed += iWhite;
    iGreen += iWhite;
    iBlue += iWhite;

    // Save the RGB
    return [Math.floor(iRed), Math.floor(iGreen), Math.floor(iBlue)];
}

function rgb2rybZZ([iRed, iGreen, iBlue]: [number, number, number]) {
    //-----------------------------------------------------------------------------------------
    // Validate the arguments.

    //-----------------------------------------------------------------------------------------
    // Save the RGB

    // Remove the white from the color
    var iWhite = Math.min(iRed, iGreen, iBlue);

    iRed -= iWhite;
    iGreen -= iWhite;
    iBlue -= iWhite;

    var iMaxGreen = Math.max(iRed, iGreen, iBlue);

    // Get the yellow out of the red+green

    var iYellow = Math.min(iRed, iGreen);

    iRed -= iYellow;
    iGreen -= iYellow;

    // If this unfortunate conversion combines blue and green, then cut each in half to
    // preserve the value's maximum range.
    if (iBlue > 0 && iGreen > 0) {
        iBlue /= 2;
        iGreen /= 2;
    }

    // Redistribute the remaining green.
    iYellow += iGreen;
    iBlue += iGreen;

    // Normalize to values.
    var iMaxYellow = Math.max(iRed, iYellow, iBlue);

    if (iMaxYellow > 0) {
        var iN = iMaxGreen / iMaxYellow;

        iRed *= iN;
        iYellow *= iN;
        iBlue *= iN;
    }

    // Add the white back in.
    iRed += iWhite;
    iYellow += iWhite;
    iBlue += iWhite;

    return [Math.floor(iRed), Math.floor(iYellow), Math.floor(iBlue)];
}