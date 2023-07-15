function generateChicken(canvas, x, y, size, layerNum, currCol, prevCol, prevX, prevY) {
    let currIndex = (x + y * img.width) * 4
	let prevIndex = (prevX + prevY * img.width) * 4
	let prevOgCol = color(img3.pixels[prevIndex + 0], img3.pixels[prevIndex + 1], img3.pixels[prevIndex + 2], img3.pixels[prevIndex + 3]);
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);
    
    let detail1 = (layerNum < 4) ? prevCol : prevOgCol;
    let detail2 = currOgCol 
    let bodyCol = (layerNum < 4) ? currCol : currOgCol;
    let lineCol = 0;
    if (layerNum === 8) size = size*1.65;

    let chkn = Math.floor(Math.random()*81);

    
    canvas.tint(lineCol); 
    canvas.image(chickenlines[chkn], x, y, size, size)
    canvas.tint(detail1);
    canvas.image(chickendetail[chkn], x, y, size, size)
    canvas.tint(detail2);
    canvas.image(chickenotherdetail[chkn], x, y, size, size)
    canvas.tint(bodyCol)
    canvas.image(chickenbody[chkn], x, y, size, size)
}
