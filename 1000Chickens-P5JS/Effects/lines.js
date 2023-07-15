function generateLines(canvas, x, y, musicRandomizer, inside, face, layerNum, faceData) {
    let currIndex = (x + y * img.width) * 4;    
    let tightness = map(faceData, 1.5, 2.5, -5, 5);
	let currOgCol = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], 255-(layerNum*5));
    if (musicRandomizer < 1) musicRandomizer = 0.5;
    let bodyBr = brightness(currOgCol);
    let w = map(bodyBr, 0, 255, 5, 15);
    let totalWeight = w * musicRandomizer
    
    if (inside) curveTightness(tightness)
    canvas.strokeWeight(totalWeight);
    canvas.stroke(currOgCol)
    canvas.noFill();
    canvas.curveVertex(x, y);
    if (inside) canvas.curveVertex(face[0], face[1]);
}
