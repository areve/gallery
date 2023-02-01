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
    return A + t * (B - A);
    // return A + (t * t * (3 - 2 * t)) * (B - A);

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


function ryb2rgbZZ([red, yellow, blue]: [number, number, number]) {
    const white = Math.min(red, yellow, blue);

    red -= white;
    yellow -= white;
    blue -= white;

    const maxYellow = Math.max(red, yellow, blue);
    let green = Math.min(yellow, blue);

    yellow -= green;
    blue -= green;

    if (blue > 0 && green > 0) {
        blue *= 2.0;
        green *= 2.0;
    }

    red += yellow;
    green += yellow;

    const maxGreen = Math.max(red, green, blue);

    if (maxGreen > 0) {
        const n = maxYellow / maxGreen;
        red *= n;
        green *= n;
        blue *= n;
    }

    red += white;
    green += white;
    blue += white;

    return [Math.floor(red), Math.floor(green), Math.floor(blue)];
}

function rgb2rybZZ2([red, green, blue]: [number, number, number]) {
    const white = Math.min(red, green, blue);

    red -= white;
    green -= white;
    blue -= white;

    const maxGreen = Math.max(red, green, blue);
    let yellow = Math.min(red, green);

    red -= yellow;
    green -= yellow;

    if (blue > 0 && green > 0) {
        blue /= 2;
        green /= 2;
    }

    yellow += green;
    blue += green;

    const maxYellow = Math.max(red, yellow, blue);

    if (maxYellow > 0) {
        const n = maxGreen / maxYellow;
        red *= n;
        yellow *= n;
        blue *= n;
    }

    red += white;
    yellow += white;
    blue += white;

    return [Math.floor(red), Math.floor(yellow), Math.floor(blue)];
}

console.log('red', rgb2rybZZ([255, 0, 0]))
console.log('dark-green', rgb2rybZZ([27, 127, 20]))
const zzz = rgb2rybZZ([27, 127, 20]) 
console.log('dark-green', hsv2rgb(zzz))

function rgb2rybZZ([red, green, blue]: [number, number, number]): [number, number, number] {
    let v = Math.max(red, green, blue)
    let delta = v - Math.min(red, green, blue)

    let h
    if (delta === 0) {
        h = 0
    } else if (v === red) {
        h = ((green - blue) / delta + 6) / 6 * 360 % 360
    } else if (v === green) {
        h = ((blue - red) / delta + 8) / 6 * 360 % 360
    } else { // v == blue
        h = ((red - green) / delta + 10) / 6 * 360 % 360
    }
    const s = v && delta / v
    
    if (h > 0 && h < 120) {
        h = h / 2
        return hsv2rgb([h, s, v ])
    }
    if (h >= 120 && h < 180) {
        h = h - 60
        return hsv2rgb([h, s, v ])
    }
    if (h >= 180 && h < 240) {
        h = (h - 180) * 2 + 120
        return hsv2rgb([h, s, v ])
    }
    return hsv2rgb([h, s, v ])
throw ""
    // http://www.deathbysoftware.com/colors/index.html
    // red [255, 0, 0] => [255, 0, 0]
    // dark-green [27,127,20] => [20, 127, 120]
    //return hsv

    if (true) {
        let v = Math.max(red, green, blue)
        let min = Math.min(red, green, blue)
        let delta = v - min

        if (delta === 0) {
            return [red, green, blue]
        } else if (v === red) {
            //h = ((blue - red) / delta + 8) / 6 % 1
            return [0, 0, 0]
        } else if (v === green) {
            const hue = (green - blue) / delta

            const yellow = 255
            //const yellowside = (red - green) / delta
            // const yellow = 
            //h = ((green - blue) / delta + 6) / 6 % 1
            //let yellow = Math.min(blue, green);
            //let r = red -yellow

            //     h = ((green - blue) / delta + 6) / 6 % 1
            // } else if (v === green) {
            //     h = ((blue - red) / delta + 8) / 6 % 1
            // } else { // v == blue
            //     h = ((red - green) / delta + 10) / 6 % 1

            return [0, 0, 0]
        } else { // v == blue
            const hue = (red - green)
            if (hue >= 0) {
                return [red, green, blue]
            }
            // let r = red -yellow

            return [0, 0, 0]
        }

    } else {
        const white = Math.min(red, green, blue);
        red -= white;
        green -= white;
        blue -= white;

        // rgb are now shorter, one is zero
        const maxBar = Math.max(red, green, blue);
        let yellow = Math.min(red, green);
        red -= yellow;
        green -= yellow;
        // r & g are now shorter, by yellow

        // only when both green & blue are > 0, i.e. red was shortest
        if (blue > 0 && green > 0) {
            blue /= 2;
            green /= 2;
        }

        yellow += green;
        blue += green;

        const maxYellow = Math.max(red, yellow, blue);

        if (maxYellow > 0) {
            const n = maxBar / maxYellow;
            red *= n;
            yellow *= n;
            blue *= n;
        }

        red += white;
        yellow += white;
        blue += white;

        return [Math.floor(red), Math.floor(yellow), Math.floor(blue)];
    }
}


//https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699

type byte = number

// in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
function rgb2hsl(r: byte, g: byte, b: byte) {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
}

// input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
function rgb2hsv(r: byte, g: byte, b: byte) {
    let v = Math.max(r, g, b), c = v - Math.min(r, g, b);
    let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
    return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
}

function hsv2rgb([h, s, v]: [number, number, number]): [number, number, number]{
    function fff(n: number, k = (n + h / 60) % 6) {
        return v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    };
    return [fff(5), fff(3), fff(1)];
}
// // input: h in [0,360] and s,v in [0,1] - output: r,g,b in [0,1]
// function hsv2rgb(h, s, v) {
//     let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
//     return [f(5), f(3), f(1)];
// }



// let hsl2hsv = (h, s, l, v = s * Math.min(l, 1 - l) + l) => [h, v ? 2 - 2 * l / v : 0, v];

// let hsv2hsl = (h, s, v, l = v - v * s / 2, m = Math.min(l, 1 - l)) => [h, m ? (v - l) / m : 0, l];