import { RoughCanvas } from "roughjs/bin/canvas";
import { Point } from "roughjs/bin/geometry";

export const loadChickens = async (spritesheet: HTMLImageElement, spriteJSON: any) => {
    let lineSprites: ImageBitmap[] = [];
    let detailSprites: ImageBitmap[] = [];
    let otherDetailSprites: ImageBitmap[] = [];
    let bodySprites: ImageBitmap[] = [];
    
    for (let i = 0; i < 2; i++) {
        lineSprites.push(await createImageBitmap(
            spritesheet, 
            spriteJSON.frames[`chickenlines-${i}.png`]["frame"]["x"], 
            spriteJSON.frames[`chickenlines-${i}.png`]["frame"]["y"], 
            spriteJSON.frames[`chickenlines-${i}.png`]["frame"]["w"],
            spriteJSON.frames[`chickenlines-${i}.png`]["frame"]["h"])
        )
        detailSprites.push(await createImageBitmap(
            spritesheet, 
            spriteJSON.frames[`chickendetail-${i}.png`]["frame"]["x"], 
            spriteJSON.frames[`chickendetail-${i}.png`]["frame"]["y"], 
            spriteJSON.frames[`chickendetail-${i}.png`]["frame"]["w"],
            spriteJSON.frames[`chickendetail-${i}.png`]["frame"]["h"]
        ))

        otherDetailSprites.push(await createImageBitmap(
            spritesheet, 
            spriteJSON.frames[`chickenotherdetail-${i}.png`]["frame"]["x"], 
            spriteJSON.frames[`chickenotherdetail-${i}.png`]["frame"]["y"], 
            spriteJSON.frames[`chickenotherdetail-${i}.png`]["frame"]["w"],
            spriteJSON.frames[`chickenotherdetail-${i}.png`]["frame"]["h"]
        ))

        bodySprites.push(await createImageBitmap(
            spritesheet, 
            spriteJSON.frames[`chickenbody-${i}.png`]["frame"]["x"], 
            spriteJSON.frames[`chickenbody-${i}.png`]["frame"]["y"], 
            spriteJSON.frames[`chickenbody-${i}.png`]["frame"]["w"],
            spriteJSON.frames[`chickenbody-${i}.png`]["frame"]["h"]
        ))
    }

    return {lines: lineSprites, detail: detailSprites, otherdetail: otherDetailSprites, body: bodySprites};
}

interface Sprites {
    lines: ImageBitmap[],
    detail: ImageBitmap[],
    otherdetail: ImageBitmap[],
    body: ImageBitmap[]
}

export function drawChicken(x: number, y: number, w: number, h: number, ctx: CanvasRenderingContext2D, col: number[], col2: number[], sprites: Sprites) {
    let chkn = Math.floor(Math.random()*2);

    //lines and tinted are the same
    let tinted = tint(sprites.lines[chkn], [0, 0, 0]);
    ctx.drawImage(tinted, x, y, w, h);
    tinted = tint(sprites.detail[chkn], col2);
    ctx.drawImage(tinted, x, y, w, h);
    tinted = tint(sprites.otherdetail[chkn], col2);
    ctx.drawImage(tinted, x, y, w, h);
    tinted = tint(sprites.body[chkn], col);
    ctx.drawImage(tinted, x, y, w, h);
}


export function drawRoughCircle(x: number, y: number, size: number, rc: RoughCanvas, col: number[], col2: number[], num: number) {
    rc.circle(x, y, size, {fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "solid", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2}); 
    rc.circle(x, y, size/1.5, {fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "hachure", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2}); 
    rc.circle(x, y, size/3, {fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "cross-hatch", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2}); 
}


export function drawRoughCube(cX: number, cY: number, size: number, rc: RoughCanvas, col: number[], col2: number[], num: number) {
    let poly = [];

    for(let a = 0; a < Math.PI*2; a+=Math.PI*2/6) {
        poly.push([cX + size * Math.cos(a), cY + size * Math.sin(a)])        
    }
    poly.push([cX, cY]);

    if (cX%2==0) {
        rc.polygon(([poly[0], poly[1], poly[2], poly[7]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "solid", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[7], poly[2], poly[3], poly[4]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "zigzag", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[0], poly[7], poly[4], poly[5]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "dots", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
    } else {
        rc.polygon(([poly[0], poly[1], poly[7], poly[5]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "dashed", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[7], poly[1], poly[2], poly[3]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "zigzag-line", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[3], poly[7], poly[5], poly[4]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "solid", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
    }
}

export function drawRoughPyramid(cX: number, cY: number, size: number, rc: RoughCanvas, col: number[], col2: number[], num: number) {
    let poly = [];

    for(let a = 0; a < Math.PI*2; a+=Math.PI*2/6) {
        poly.push([cX + size * Math.cos(a), cY + size * Math.sin(a)])        
    }
    poly.push([cX, cY]);

    if (cX%2==0) {
        rc.polygon(([poly[0], poly[2], poly[7]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "solid", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[7], poly[2], poly[4]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "zigzag", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[0], poly[7], poly[4]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "dots", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
    } else {
        rc.polygon(([poly[1], poly[3], poly[7]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "dashed", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[7], poly[3], poly[5]] as Point[]), {
            fill: `rgb(${col2[0]}, ${col2[1]}, ${col2[2]})`, fillStyle: "zigzag-line", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
        rc.polygon(([poly[1], poly[7], poly[5]] as Point[]), {
            fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "solid", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
        })
    }
}

export function drawRoughStar(x: number, y: number, radius1: number, radius2: number, npoints: number, rc: RoughCanvas, col: any, num: any) {
	let angle = (Math.PI*2 )/ npoints;
	let halfAngle = angle / 2.0;
    let star = [];

	for (let a = 0; a < Math.PI*2; a += angle) {
	  let sx = x + Math.cos(a) * radius2;
	  let sy = y + Math.sin(a) * radius2;
	  star.push([sx, sy]);

	  sx = x + Math.cos(a + halfAngle) * radius1;
	  sy = y + Math.sin(a + halfAngle) * radius1;
	  star.push([sx, sy]);
	}

    rc.polygon((star as Point[]), {
        fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "cross-hatch", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
    })

}

export function drawRoughtHeart(x: number, y: number, size: number, rc: RoughCanvas, col: number[], num: number) {
    let heart = [];

    for (let a = 0; a < Math.PI*2; a += 0.01) {
		let r = 2 - 2 * Math.sin(a) + Math.sin(a) * (Math.sqrt(Math.abs(Math.cos(a))/(Math.sin(a)+1.4)));
		let currX = x + size*r * Math.cos(a);
		let currY = y + -size*r * Math.sin(a);
        heart.push([currX, currY]);
	}

    rc.polygon((heart as Point[]), {
        fill: `rgb(${col[0]}, ${col[1]}, ${col[2]})`, fillStyle: "zigzag", strokeWidth: 1, roughness: Math.random() * (num+1), bowing: num+2
    })
}

export function tint(img: HTMLImageElement | ImageBitmap, color: number[]) {
    // Create a buffer element to draw based on the Image img
    let tinted;
    const buffer = document.createElement('canvas');
    buffer.width = img.width;
    buffer.height = img.height;
    const btx: any = buffer.getContext('2d');
        
    // First draw your image to the buffer
    btx.drawImage(img, 0, 0);
        
    // Now we'll multiply a rectangle of your chosen color
    btx.fillStyle = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
    btx.globalCompositeOperation = 'multiply';
    btx.fillRect(0, 0, buffer.width, buffer.height);
        
    // Finally, fix masking issues you'll probably incur and optional globalAlpha
    btx.globalAlpha = 1.0;
    btx.globalCompositeOperation = 'destination-in';
    btx.drawImage(img, 0, 0, img.width, img.height);
    tinted = buffer;
    return tinted;
}

export function getRandomColor(x: number, y: number, w: number, context: Uint8ClampedArray) {
    const index = y * (w*4) + x*4;
    let color = [context[index], context[index+1], context[index+2]];
    let brightness = Math.max(color[0], color[1], color[2]);
    return [color, brightness];
}

export function mapRange (value: number, a: number, b: number, c: number, d: number) {
    value = (value - a) / (b - a);
    return c + value * (d - c);
}

export function distanceRange(x1: number, y1: number, x2: number, y2: number) {
    const a = x1 - x2;
    const b = y1 - y2;
    return Math.sqrt(a*a + b*b); //Math.hypot is more accurate, but slower
}

export function colorDistance(color1: number[], color2: number[]) {
    const dr = color2[0] - color1[0];
    const dg = color2[1] - color1[1];
    const db = color2[2] - color1[2];
    return Math.sqrt(dr * dr + dg * dg + db * db);
}

