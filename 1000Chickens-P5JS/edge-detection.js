//Original Edge Detection Algorithm by Crystal Chen & Paolla Bruno Dutra. Algo explanation here: https://idmnyu.github.io/p5.js-image/Edge/index.html
// Edge detection algorithm modified to reduce unnecessary calculations and include other methods such as adding blur and use of scharr operator as opposed to the sobel operator as suggested in the above article.
// The method to preprocessing is as follows...
//// Perform edge detection on the image to create defined edges
//// Set the pixel colors of the edges black on the destination image, but keep all other colors consistent with the original image
function processImage(sourceImg, destinationImg) {
	sourceImg.filter(BLUR, 5); // blur the image to smooth it out

	//scharr operator is much more sensitive to edges than the sobel operator
	let k1 = [
		[-3, 0, 3], 
		[-10, 0, 10], 
		[-3, 0, 3]
	];

	let k2 = [
		[-3, -10, -3], 
		[0, 0, 0], 
		[3, 10, 3]
	];
	
	sourceImg.loadPixels(); 
	destinationImg.loadPixels();
	
	let w = sourceImg.width;
	let h = sourceImg.height;

	for (let y = 0; y < h; y++) {
    	for (let x = 0; x < w; x++) {
			let index = (x + y * w) * 4;
			let r = sourceImg.pixels[index + 0];
			let g = sourceImg.pixels[index + 1];
			let b = sourceImg.pixels[index + 2];

			let xLeft = (x-1+w)%w;
			let xMid = (x+w)%w;
			let xRight = (x+1+w)%w;

			let yUpper = w*((y-1+h)%h);
			let yMiddle = w*((y+h)%h);
			let yLower = w*((y+1+h)%h);

			// gradient index positions
			let upperLeft = (xLeft + yUpper)*4; 
			let upperMid = (xMid + yUpper)*4; 
			let upperRight = (xRight + yUpper)*4; 

			let midLeft = (xLeft + yMiddle)*4; 
			let midCenter = (xMid + yMiddle)*4; 
			let midRight = (xRight + yMiddle)*4; 

			let lowerLeft = (xLeft + yLower)*4; 
			let lowerMid = (xMid + yLower)*4; 
			let lowerRight = (xRight + yLower)*4; 
			
			// green channel only
			// we don't need to calculate the sections of the kernel that are 0 since the value is just results in 0
			// the initial x-kernal is denoted by section and kernel value, ex u_3 => upper -3 and m10 => middle 10 
			let u_3 = sourceImg.pixels[upperLeft+1]*k1[0][0]; 
			let u3 = sourceImg.pixels[upperRight+1]*k1[0][2]; 
			let m_10 = sourceImg.pixels[midLeft+1]*k1[1][0]; 
			let m10 = sourceImg.pixels[midRight+1]*k1[1][2];
			let l_3 = sourceImg.pixels[lowerLeft+1]*k1[2][0]; 
			let l3 = sourceImg.pixels[lowerRight+1]*k1[2][2]; 	
			let gX = u_3+u3+m_10+m10+l_3+l3; 

			u_3 = sourceImg.pixels[upperLeft+1]*k2[0][0]; 
			u3 = sourceImg.pixels[upperMid+1]*k2[0][1]; 
			m_10 = sourceImg.pixels[upperRight+1]*k2[0][2];
			m10 = sourceImg.pixels[lowerLeft+1]*k2[2][0]; 
			l_3 = sourceImg.pixels[lowerMid+1]*k2[2][1]; 
			l3 = sourceImg.pixels[lowerRight+1]*k2[2][2]; 
			let gY = u_3+u3+m_10+m10+l_3+l3;  

			// 0 is the minimum value the sum could result in and 5770 is the maximum for the scharr operator
			let result = map(sqrt(gX*gX+gY*gY), 0, 5770, 0, 255);


			// write pixels into destination image:
			if (result > 2) {
				destinationImg.pixels[midCenter] = result; 
				destinationImg.pixels[midCenter+1] = result; 
				destinationImg.pixels[midCenter+2] = result; 
				destinationImg.pixels[midCenter+3] = 255; 
			} else {
				destinationImg.pixels[midCenter] = r; 
				destinationImg.pixels[midCenter+1] = g; 
				destinationImg.pixels[midCenter+2] = b; 
				destinationImg.pixels[midCenter+3] = 255; 
			}
			
			
		}
	}	
	
	destinationImg.updatePixels(); 
}

