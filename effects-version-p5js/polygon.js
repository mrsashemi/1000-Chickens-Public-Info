// use the following functions to draw the image with hexagons
function drawScribbleHexagon(canvas, cX, cY, r, nsides, fillCol, roundVol, lineCol, lineWeight, scribble) {
	if (nsides < 3 /*|| !soundtrack.isPlaying()*/) nsides = 6;
	let currX;
	let currY;
	let prevX;
	let prevY;
	let firstX;
	let firstY;
	let xCoords = [];
	let yCoords = [];
	let gap = 3.5*roundVol;
	let angle = r;

	for(let a = 0; a < TAU; a+=TAU/nsides){
		currX = cX + r * cos(a);
		currY = cY + r * sin(a);
		xCoords.push(currX);
		yCoords.push(currY);
	}

	canvas.strokeWeight(3);
	canvas.stroke(fillCol);
	scribble.scribbleFilling(xCoords, yCoords , gap, angle);

	for(let a = 0; a < TAU; a+=TAU/nsides){
		currX = cX + r * cos(a);
		currY = cY + r * sin(a);
		if (a === 0) firstX = currX;
		if (a === 0) firstY = currY;
		
		canvas.strokeWeight(lineWeight);
		canvas.stroke(lineCol);
		if (a > 0) scribble.scribbleLine(prevX, prevY, currX, currY);

		prevX = currX;
		prevY = currY;
	}

	canvas.strokeWeight(lineWeight);
	canvas.stroke(lineCol);
	scribble.scribbleLine(prevX, prevY, firstX, firstY);
}
  
function generatePolygon(canvas, x, y, size, layerNum, currCol, prevCol, musicRandomizer, sidesRandomizer, prevX, prevY, strokeThickness, scribble) {
	let currIndex = (x + y * img.width) * 4;
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
	let sides = round(musicRandomizer*sidesRandomizer)
	let lineWeight = strokeThickness

	drawScribbleHexagon(canvas, x, y, shapeSize, sides, bodyCol, musicRandomizer, 0, lineWeight, scribble);
	drawScribbleHexagon(canvas, x, y, shapeDetail1, sides, detail1, musicRandomizer, lineCol, lineWeight, scribble);
	drawScribbleHexagon(canvas, x, y, shapeDetail2, sides, detail2, musicRandomizer, lineCol, lineWeight, scribble);
}