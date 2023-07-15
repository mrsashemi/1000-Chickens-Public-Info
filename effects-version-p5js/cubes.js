// use the following functions to draw the image with cubes
function drawScribbleCube(canvas, cX, cY, r, bodyCol, lineWeight, lineCol, roundVol, middle, inner, scribble) {
	let skip = 1;
	let currX;
	let currY;
	let prevX;
	let prevY;
	let xCoords = [];
	let yCoords = [];
	let gap = 3.5*roundVol;
	let angle = r;
	for(let a = 0; a < TAU; a+=TAU/6){
		currX = cX + r * cos(a);
		currY = cY + r * sin(a);
		xCoords.push(currX);
		yCoords.push(currY);
	}

	canvas.strokeWeight(3);
	canvas.stroke(bodyCol);
	if (middle || inner) gap = 2;
	scribble.scribbleFilling(xCoords, yCoords , gap, angle);

	for(let a = 0; a < TAU; a+=TAU/6){
		currX = cX + r * cos(a);
		currY = cY + r * sin(a);

		if (a > 0) {
			canvas.strokeWeight(lineWeight);
			canvas.stroke(lineCol)
			scribble.scribbleLine(prevX, prevY, currX, currY);
		}
		prevX = currX;
		prevY = currY;
	}

	if (middle) {
		for(let a = 0; a < TAU; a+=TAU/6){
			skip++;
			if (skip%2 === 1) {
			  canvas.stroke(lineCol)
			  canvas.strokeWeight(lineWeight)
			  scribble.scribbleLine(cX + r * cos(a), cY + r * sin(a),cX, cY)
			}
	  	}
	} else {
		for(let a = 0; a < TAU; a+=TAU/6){
			skip++;
			if (skip%2 === 0) {
			canvas.stroke(lineCol)
			canvas.strokeWeight(lineWeight)
			scribble.scribbleLine(cX + r * cos(a), cY + r * sin(a),cX, cY)
			}
		}
	}
}

function generateCube(canvas, x, y, size, layerNum, currCol, prevCol, musicRandomizer, prevX, prevY, strokeThickness, scribble) {
	let currIndex = (x + y * img.width) * 4
	let prevIndex = (prevX + prevY * img.width) * 4
	let prevOgCol = color(img3.pixels[prevIndex + 0], img3.pixels[prevIndex + 1], img3.pixels[prevIndex + 2], img3.pixels[prevIndex + 3]);
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);
	
    let detail1 = (layerNum < 4) ? prevCol : prevOgCol;
    let detail2 = currOgCol 
    let bodyCol = (layerNum < 4) ? currCol : currOgCol;
    let lineCol = 0;
	if (layerNum === 8) lineCol = currCol;
	let shapeSize = size/1.5;
	let shapeDetail1 = shapeSize/1.5;
	let shapeDetail2 = shapeSize/3;
	let lineWeight = strokeThickness

	drawScribbleCube(canvas, x, y, shapeSize, bodyCol, lineWeight, 0, musicRandomizer, false, false, scribble);
	if (musicRandomizer >= 1) drawScribbleCube(canvas, x, y, shapeDetail1, detail1, lineWeight, lineCol, musicRandomizer, true, false, scribble);
	if (musicRandomizer >= 1) drawScribbleCube(canvas, x, y, shapeDetail2, detail2, lineWeight, lineCol, musicRandomizer, false, true, scribble);
}