function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r2 - r1;
  const dg = g2 - g1;
  const db = b2 - b1;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function drawLayer(canvas, lowerLimit, upperLimit, distance, minSize, maxSize, layerNum, strokeThickness, generate, scribble) {
	canvas.beginShape();
	//returns an object with values for size randomization and points randomization for polygons and stars
	let randomValues = createRandomValues(layerNum, `layer-${layerNum}`); 

	// check x,y coordinates randomly and make reference to the previous x,y coordinates analyzed
	let currX = round(random(img.width));
	let currY = round(random(img.height));
	let prevX = currX;
	let prevY = currY;
	let face = false;
	let prevFace = face;

	//amount to loop over
	loopAmount = (w > h) ? w : h;
	if (generate === "lines" || generate === "particle") loopAmount = loopAmount * 10;

	// use to adjust distance from previous coordinate based on what is being generated
	let distanceScale = 1;
	if (generate !== "lines" && generate !== "particle") distanceScale = 3;

	for (let i = 0; i < loopAmount; i++) {

		face = false;
		if (prevFace && generate === "lines") {
			// speed up lines being generated in the face by specifically pulling points from the bounding box
			let box = predictions[0].boundingBox;
			currX = round(random(box.topLeft[0][0], box.bottomRight[0][0]));
			currY = round(random(box.topLeft[0][1], box.bottomRight[0][1]));
		} else {
			currX = round(random(img.width)); 
			currY = round(random(img.height));
		}

		// get image colors for both the posterized and original images to provide some variation in how the chicken image is tinted
		let currIndex = (currX + currY * img2.width) * 4
		let prevIndex = (prevX + prevY * img2.width) * 4
		let currColor = [img2.pixels[currIndex + 0], img2.pixels[currIndex + 1], img2.pixels[currIndex + 2], img2.pixels[currIndex + 3]]
		let prevColor = [img2.pixels[prevIndex + 0], img2.pixels[prevIndex + 1], img2.pixels[prevIndex + 2], img2.pixels[prevIndex + 3]]

		// Checking the euclidean distance between two RGB colors tells us how similar they are
		const colorThreshold = 25; 
		const cDistance = colorDistance(currColor[0], currColor[1], currColor[2], prevColor[0], prevColor[1], prevColor[2]);
		if (currColor[3] === 255 && cDistance < colorThreshold) { 
			// get the brightness values 
			let currB = brightness(currColor);
			let prevB = brightness(prevColor);


			currColor = color(img3.pixels[prevIndex + 0], img3.pixels[prevIndex + 1], img3.pixels[prevIndex + 2], img3.pixels[prevIndex + 3]);
			prevColor = color(img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]);

			// get the size of the object
			let size = (generate === "lines") ? map(currB, 0, 255, 45, 350) : map(currB, 0, 255, minSize, maxSize);	
			size = size * randomValues.sizeScale

			// find the amount of points to be thinned based on the size and the layer number
			let thinningScale = layerNum+2;

			// Check if inside a detected face and return faceData object
			let faceData;

			if (predictions.length > 0) {
				faceData = pointInFace([currX, currY], size);
				face = faceData.inside;
			} 

			if (face && prevFace) {
				size = size/(faceData.divisor);
				thinningScale = thinningScale*2;

				if (generate === "lines" || generate === "particle") {
					distanceScale = 1.5/faceData.divisor;

					// adjust scale differently for brighter layers
					if (layerNum < 4) thinningScale = 2;
					else thinningScale = 3;
				}
			} else if (!face) {
				size = size * 1.35;

				//Generate the background differently than the detected faces (currently: posterized background)
				//currColor = [img4.pixels[currIndex + 0], img4.pixels[currIndex + 1], img4.pixels[currIndex + 2], img4.pixels[currIndex + 3]]
				//prevColor = [img4.pixels[prevIndex + 0], img4.pixels[prevIndex + 1], img4.pixels[prevIndex + 2], img4.pixels[prevIndex + 3]]
			} 

			let facePlaceholder = face;
			let scaledDistance = distance * distanceScale;

			// bypass brightness checks for every effect except lines and particles if inside detected face
			if (generate === "lines" || generate === "particle") face = false;

			// Check if the current (x,y) and previous coordinates have a brightness value within the specified range of brightness
			if ((currB <= upperLimit && currB >= lowerLimit) && (prevB <= upperLimit && prevB >= lowerLimit) || face && prevFace) { 
				// Check if the current and previous coordinates are within a specified distance from each other
				if ((dist(currX, currY, prevX, prevY) < scaledDistance) || face && prevFace) { 

					// Query the coordinate data from the QuadTree
					let thinAmount = size/thinningScale;
					let range = new Rectangle(currX, currY, thinAmount, thinAmount);
					let points = qtree.queryWithoutZ(range)

					// Use the quad tree to to check if there are any coordinates near the one about to be placed
					if (!points.length) { 
						let m = new Point(currX, currY, "empty"); 
						qtree.insert(m);
						let linesInsideFace = (faceData.closestDistance && (scaledDistance > faceData.closestDistance)) ? true : false;

						// place object
						if (generate === "chickens") generateChicken(canvas, currX, currY, size, layerNum, currColor, prevColor, prevX, prevY)
						else if (generate === "cubes") generateCube(canvas, currX, currY, size, layerNum, currColor, prevColor, randomValues.sizeScale, prevX, prevY, strokeThickness, scribble)
						else if (generate === "lines") generateLines(canvas, currX, currY, randomValues.sizeScale, linesInsideFace, faceData.closestPoint, layerNum, faceData.closestDistance)
						else if (generate === "hexagons") generatePolygon(canvas, currX, currY, size, layerNum, currColor, prevColor, randomValues.sizeScale, randomValues.numSides, prevX, prevY, strokeThickness, scribble)
						else if (generate === "circles") generateCircle(canvas, currX, currY, size, layerNum, currColor, prevColor, randomValues.sizeScale, prevX, prevY, strokeThickness, scribble)
						else if (generate === "stars") generateStar(canvas, currX, currY, size, layerNum, currColor, randomValues.sizeScale, randomValues.numSides, strokeThickness, scribble)
						else if (generate === "hearts") generateHeart(canvas, currX, currY, size, layerNum, currColor, randomValues.sizeScale, strokeThickness, scribble)
						else if (generate === "particle") generateParticles(canvas, currX, currY, size, randomValues.sizeScale, prevX, prevY, layerNum);
						
						prevX = currX;
						prevY = currY;
						prevFace = facePlaceholder;
					}
				}
			} 
		}
	}
	canvas.endShape();
}
