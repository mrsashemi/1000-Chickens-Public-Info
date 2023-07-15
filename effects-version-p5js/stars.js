// use the following function to draw the image with stars
function drawScribbleStar(canvas, x, y, radius1, radius2, npoints, bodyCol, roundVol, lineCol, lineWeight, scribble) {
	if (npoints < 2) npoints = 2;
	if (npoints < 5) radius1/1.1;
	if (npoints > 5) radius2 = radius1/1.5;
	let angle = TWO_PI / npoints;
	let halfAngle = angle / 2.0;
	let currX;
	let currY;
	let prevX;
	let prevY;
	let firstX;
	let firstY;
	let xCoords = [];
	let yCoords = [];
	let gap = 3.5*roundVol;
	let fillAngle = npoints;

	for (let a = 0; a < TWO_PI; a += angle) { 
		currX = x + cos(a) * radius2;
		currY = y + sin(a) * radius2;
		xCoords.push(currX);
		yCoords.push(currY);


		prevX = x + cos(a + halfAngle) * radius1;
		prevY = y + sin(a + halfAngle) * radius1;
		xCoords.push(prevX);
		yCoords.push(prevY);
	}

	canvas.strokeWeight(3);
	canvas.stroke(bodyCol);
	scribble.scribbleFilling(xCoords, yCoords , gap, fillAngle);

	for (let a = 0; a < TWO_PI; a += angle) {
		currX = x + cos(a) * radius2;
	  	currY = y + sin(a) * radius2;
		if (a === 0) firstX = currX;
		if (a === 0) firstY = currY;

		canvas.stroke(lineCol);
		canvas.strokeWeight(lineWeight);
		if (a > 0) scribble.scribbleLine(prevX, prevY, currX, currY);
	
	  	prevX = x + cos(a + halfAngle) * radius1;
	  	prevY = y + sin(a + halfAngle) * radius1;

		scribble.scribbleLine(prevX, prevY, currX, currY);
	}

	canvas.stroke(lineCol);
	canvas.strokeWeight(lineWeight);
	scribble.scribbleLine(prevX, prevY, firstX, firstY);

}

function generateStar(canvas, x, y, size, layerNum, currCol, musicRandomizer, sidesRandomizer, strokeThickness, scribble) {
	let currIndex = (x + y * img.width) * 4;
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);
    let bodyCol = (layerNum < 4) ? currCol : currOgCol;
	let lineCol = 0;

	if (layerNum === 8) lineCol = currCol;
	let shapeSize = size/1.5;
	let shapeDetail2 = shapeSize/3;
	let points = round(musicRandomizer*sidesRandomizer)
	let lineWeight = strokeThickness;

	drawScribbleStar(canvas, x, y, shapeSize, shapeDetail2, points, bodyCol, musicRandomizer, lineCol, lineWeight, scribble);
}