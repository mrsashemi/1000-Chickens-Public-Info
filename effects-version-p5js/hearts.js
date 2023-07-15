// use the following functon to draw the image with hearts
function drawScribbleHeart(canvas, x, y, size, bodyCol, lineWeight, lineCol, roundVol, scribble) {
	noFill();
	let prevX;
	let prevY;
	let xCoords = [];
	let yCoords = [];
	let gap = 3.5*roundVol;
	let angle = size;

	for (let a = 0; a < TWO_PI; a += 0.01) {
		let r = 2 - 2 * sin(a) + sin(a) * (sqrt(abs(cos(a))/(sin(a)+1.4)));
		let currX = x + size*r * cos(a);
		let currY = y + -size*r * sin(a);
		xCoords.push(currX);
		yCoords.push(currY);
	}

	canvas.strokeWeight(3);
	canvas.stroke(bodyCol);
	scribble.scribbleFilling(xCoords, yCoords, gap, angle);

	for (let a = 0; a < TWO_PI; a += 0.01) {
		let r = 2 - 2 * sin(a) + sin(a) * (sqrt(abs(cos(a))/(sin(a)+1.4)));
		let currX = x + size*r * cos(a);
		let currY = y + -size*r * sin(a);
		canvas.stroke(lineCol);
		canvas.strokeWeight(lineWeight);
		if (a > 0) scribble.scribbleLine(prevX, prevY, currX, currY);
		prevX = currX;
		prevY = currY;
	}
}

function generateHeart(canvas, x, y, size, layerNum, currCol, musicRandomizer, strokeThickness, scribble) {
    let currIndex = (x + y * img.width) * 4
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);

    let bodyCol = (layerNum < 4) ? currCol : currOgCol;
    let lineCol = 0;
	if (layerNum === 8) lineCol =  currCol;
	let heartSize = size/4.5;
	let lineWeight = strokeThickness

	drawScribbleHeart(canvas, x, y, heartSize, bodyCol, lineWeight, lineCol, musicRandomizer, scribble);
}