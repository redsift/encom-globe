import { Render as CONST, Labels as Labels } from './Defaults'

/* from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb */
const SHORTHANG_REGEX = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
const GROUP_REGEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

export function hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    hex = hex.replace(SHORTHANG_REGEX, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    const result = GROUP_REGEX.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function nearestPow2(aSize) {
    var res = Math.pow( 2, Math.round( Math.log( aSize ) / Math.log( 2 ) ) ); 
    if (res < aSize) return nearestPow2(aSize + 12);
    return res;
}

export function mapPoint(lat, lng, scale) {
    if(!scale){
        scale = 500;
    }
    var phi = (90 - lat) * Math.PI / 180;
    var theta = (180 - lng) * Math.PI / 180;
    var x = scale * Math.sin(phi) * Math.cos(theta);
    var y = scale * Math.cos(phi);
    var z = scale * Math.sin(phi) * Math.sin(theta);
    return {x: x, y: y, z:z};
}


export function renderToCanvas(width, height, renderFunction) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = width * CONST.PixelRatio; 
    canvas.height = height * CONST.PixelRatio; 
   
    context.scale(CONST.PixelRatio, CONST.PixelRatio);

    renderFunction(context);

    return canvas;
}

export function createLabel(text, font, underline, background) {
    font = font || {};
    font.font = font.font || Labels.TextFont;
    font.size = font.size || Labels.TextSize;
    font.color = font.color || Labels.TextColor;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = `${font.size}pt ${font.font}`;

    const textWidth = context.measureText(text).width;

    let canvasWidth = Math.max(textWidth + Labels.TextPaddingX, 2); // for the case where text is empty
    let canvasHeight = font.size + 2 * Labels.TextPaddingY;

    if (underline) {
        underline.width = underline.width || Labels.UnderlineWidth;
        underline.color = underline.color || Labels.UnderlineColor;
        underline.offset = underline.offset || Labels.UnderlineOffset;
        underline.cap = underline.cap || Labels.UnderlineCap;

        canvasHeight += underline.width;
    }

    if (background) {
        background.fill = background.fill || Labels.BackgroundFillStyle;
    }

    const pow2Width = nearestPow2(canvasWidth);
    const pow2Height = nearestPow2(canvasHeight);
    const offset = (pow2Width - canvasWidth) / 2;

    canvas.width = pow2Width * CONST.PixelRatio;
    canvas.height = pow2Height * CONST.PixelRatio;
    
    context.scale(CONST.PixelRatio, CONST.PixelRatio);
    
    if (background) {
        context.fillStyle = background.fill;
        context.fillRect(offset - Labels.TextPaddingX, 0, canvasWidth + 2*Labels.TextPaddingX, pow2Height);
    }

    context.font = `${font.size}pt ${font.font}`;

    context.textAlign = 'center';
    context.textBaseline = 'middle';

    context.strokeStyle = Labels.TextStrokeStyle;

    context.miterLimit = 2;
    context.lineJoin = 'circle';
    context.lineWidth = Labels.TextStrokeWidth;

    context.strokeText(text, pow2Width / 2, pow2Height / 2);

    context.lineWidth = 0;

    context.fillStyle = font.color;
    context.fillText(text, pow2Width / 2, pow2Height / 2);

    if (underline) {
        context.strokeStyle = underline.color;
        context.lineWidth = underline.width;
        context.lineCap = underline.cap;

        context.beginPath();
        context.moveTo(offset, canvasHeight + underline.offset);
        context.lineTo(offset + canvasWidth - 1, canvasHeight + underline.offset);
        context.stroke();
    }

    return canvas;
}
