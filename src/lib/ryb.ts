


// RYB   000     100     010     110     001     101     011     111
// white     red  yellow  orange    blue  purple   green   black
// R       1       1       1       1   0.163     0.5       0       0
// G       1       0       1     0.5   0.373       0    0.66       0
// B       1       0       0       0     0.6     0.5     0.2       0
// RGB to RYB

// RGB   000     100     010     110     001     101     011     111
// black     red   green  yellow    blue magenta turquoi.  white
// R       1       1       0       0       0   0.309       0       0
// Y       1       0       1       1       0       0   0.053       0
// B       1       0   0.483       0       1   0.469   0.210       0

var ORGINAL_MAGIC_COLORS = [
    [0.0, 0.0, 0.0],
    [1, 1, 0],
    [1, 0, 0],
    [1, 0.5, 0],
    [0.163, 0.373, 0.6],
    [0.0, 0.66, 0.2],
    [0.5, 0.0, 0.5],
    [1, 1, 1],
];

// https://forum.electromage.com/t/ryb-colors-act-like-paint/1450/2
var LED_MAGIC_COLORS = [
    [0, 0, 0],  // black
    [1, 1, 0], // yellow
    [1, 0, 0], // red
    [1, 0.5, 0], // orange
    [0, 0, 1], // blue
    [0, 1, 0], // green
    [.5, 0, .5], // purple
    [1, 1, 1], // white
];

var W3SCHOOLS_MAGIC_COLORS = [ // https://www.w3schools.com/colors/colors_wheels.asp
    [0.0, 0.0, 0.0], // black
    [254/255, 254/255, 51/255], // yellow #FEFE33	rgb(254, 254, 51)
    [254/255, 39/255, 18/255], // red #FE2712 rgb(254, 39, 18)
    [251/255, 153/255, 2/255], // orange #FB9902	rgb(251, 153, 2)
    [2/255, 71/255, 254/255],// blue  // #0247FE rgb(2, 71, 254)
    [102/255, 176/255, 50/255], // green #66B032	rgb(102, 176, 50)
    [134/255, 1/255, 175/255],// purple #8601AF	 rgb(134, 1, 175)
    [1, 1, 1],// white
];


var MY_MAGIC_COLORS = [
    [0, 0, 0],  // black
    [1, 1, 0], // yellow
    [0.8, 0, 0], // red
    [0.8, 0.6, 0], // orange
    [0.1, 0.2, 0.9], // blue
    [0, 0.8, 0], // green
    [0.5, 0, 0.5], // purple
    [1, 1, 1], // white
];

var BRIGHT_MAGIC_COLORS = [
    [0, 0, 0],  // black
    [1, 1, 0], // yellow
    [1, 0, 0], // red
    [1, 0.5, 0], // orange
    [0, 0, 1], // blue
    [0, 1, 0], // green
    [1, 0, 1], // purple
    [1, 1, 1], // white
];

var NULL_MAGIC_COLORS = [
    [0, 0, 0], // black
    [0, 1, 0], // green
    [1, 0, 0], // red
    [1, 1, 0], // yellow
    [0, 0, 1], // blue
    [0, 1, 1], // cyan
    [1, 0, 1], // magenta
    [1, 1, 1], // white
];

var ANOTHER_MAGIC_COLORS = [
    [0, 0, 0], // black
    [1, 1, 0], // green -> yellow
    [1, 0, 0], // red
    [1, 0.5, 0], // yellow -> orange
    [0, 0, 0.8], // blue
    [0, 0.8, 0], // cyan -> green
    [0.5, 0, 0.5], // magenta
    [1, 1, 1], // white
];

var MAGIC_COLORS = ANOTHER_MAGIC_COLORS
type Magic = typeof MAGIC_COLORS

// see http://threekings.tk/mirror/ryb_TR.pdf
function cubicInt(t: number, A: number, B: number) {
    // var weight = t * t * (3 - 2 * t);
    var weight = t
    return A + weight * (B - A);
}

function getR(iR: number, iY: number, iB: number, magic: Magic) {
    magic = magic || MAGIC_COLORS;
    // red
    var x0 = cubicInt(iB, magic[0][0], magic[4][0]);
    var x1 = cubicInt(iB, magic[1][0], magic[5][0]);
    var x2 = cubicInt(iB, magic[2][0], magic[6][0]);
    var x3 = cubicInt(iB, magic[3][0], magic[7][0]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

function getG(iR: number, iY: number, iB: number, magic: Magic) {
    magic = magic || MAGIC_COLORS;
    // green
    var x0 = cubicInt(iB, magic[0][1], magic[4][1]);
    var x1 = cubicInt(iB, magic[1][1], magic[5][1]);
    var x2 = cubicInt(iB, magic[2][1], magic[6][1]);
    var x3 = cubicInt(iB, magic[3][1], magic[7][1]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

function getB(iR: number, iY: number, iB: number, magic: Magic) {
    magic = magic || MAGIC_COLORS;
    // blue
    var x0 = cubicInt(iB, magic[0][2], magic[4][2]);
    var x1 = cubicInt(iB, magic[1][2], magic[5][2]);
    var x2 = cubicInt(iB, magic[2][2], magic[6][2]);
    var x3 = cubicInt(iB, magic[3][2], magic[7][2]);
    var y0 = cubicInt(iY, x0, x1);
    var y1 = cubicInt(iY, x2, x3);
    return cubicInt(iR, y0, y1);
}

export function ryb2rgb_magic(color: [number, number, number]) {
    const limit = 255;
    const magic = MAGIC_COLORS;
    var R = color[0] / limit;
    var Y = color[1] / limit;
    var B = color[2] / limit;
    var R1 = getR(R, Y, B, magic);
    var G1 = getG(R, Y, B, magic);
    var B1 = getB(R, Y, B, magic);
    return [
        Math.ceil(R1 * limit),
        Math.ceil(G1 * limit),
        Math.ceil(B1 * limit)
    ];
}
