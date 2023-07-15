function generateCircle(canvas, x, y, size, layerNum, currCol, prevCol, musicRandomizer, prevX, prevY, strokeThickness, scribble) {
    let currIndex = (x + y * img3.width) * 4    
	let prevIndex = (prevX + prevY * img3.width) * 4
    let prevOgCol = color(img3.pixels[prevIndex + 0], img3.pixels[prevIndex + 1], img3.pixels[prevIndex + 2], img3.pixels[prevIndex + 3]);
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);
    
    let detail1 = (layerNum < 4) ? prevCol : prevOgCol;
    let detail2 = currOgCol 
    let bodyCol = (layerNum < 4) ? currCol : currOgCol;
    let lineCol = 0;
    if (layerNum === 8) lineCol = bodyCol;
    
    size = size * musicRandomizer
	let shapeSize = size/1.5;
	let shapeDetail1 = shapeSize/1.5;
	let shapeDetail2 = shapeSize/3;
	let lineWeight = strokeThickness

    canvas.strokeWeight(lineWeight)
    canvas.stroke(0); 
    canvas.fill(bodyCol);
    scribble.scribbleEllipse(x, y, shapeSize, shapeSize);
    canvas.stroke(lineCol); 
    canvas.fill(detail1);
    scribble.scribbleEllipse(x, y, shapeDetail1, shapeDetail1);
    canvas.fill(detail2);
    scribble.scribbleEllipse(x, y, shapeDetail2, shapeDetail2);

}