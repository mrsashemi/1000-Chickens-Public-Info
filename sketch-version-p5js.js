// The following code is a custom artistic algorithm called "1000 chickens"
//// This algorithm was developed via a combination of methods inspired by other creative developers as well as personal experimentation 
//// This algorithm draws a given image with chickens via a database of hand-doodled chickens by yours truly (Hasib Hashemi of WizardsRobbingKids)
//// Although the primary goal was to generate murakami style images with my own work, the algorithm can also do a good job drawing the image with lines, cubes, and other shapes. 
//// This algorithm is also able to draw and visualize music according to the sound level

// Credits to the following developers for inspiring the following methods used
//// Original Edge Detection Algorithm by Crystal Chen & Paolla Bruno Dutra of NYU. Algo explanation here: https://idmnyu.github.io/p5.js-image/Edge/index.html
//// Jason Stirman inspired the drawing algorithm by providing high level details of his own drawing algo on Processing forums and his website. See here: https://discourse.processing.org/t/curve-density-over-an-image/3210
//// The Coding Train for inpiring both the flocking algorithm and improvements to the thinning algorith via the use of a quadtree as opposed to a 2D array.

// This is the 2nd version of "1000 Chickens"
//// This version is able to draw all the layers simultaneously using graphical buffers
//// Additional controls available to control the individual layers if desired


// for facial recognition 
let predictions = [];
let readyToGenerate = false;

// import p5.scribble
let scribble;
let scribble0;
let scribble1;
let scribble2;
let scribble3;
let scribble4;
let scribble5;
let scribble6;
let scribble7;
let scribble8;

//createGraphics
let canvas;
let canvas0;
let canvas1;
let canvas2;
let canvas3;
let canvas4;
let canvas5;
let canvas6;
let canvas7;
let canvas8;

// Control randomness and size when generating to music
let slider;
let sizeSlider;
let randomizeSize = true;
let randomizeMusic = true;

// Arrays holding the chicken image files. Each chicken is 4 different files that will be layered.
let chickenbody = [];
let chickenlines = [];
let chickendetail = [];
let chickenotherdetail = [];

// Variable declaration
let randomInGeneral = true;
let img;
let img2;
let img3;
let img4;
let soundtrack;
let qtree;
// let w = 3427/3;
// let h = 3648/3;
let w = 3637;
let h = 2432;

//3637 × 2432
let spriteData;
let spriteSheet;

// initial generate value for each layer
let gen =  ["lines", "particle", "chickens", "hearts", "cubes", "stars", "circles", "hexagons", "chickens"]

// manually select what object each layer is generating
let layer = [false, false, false, false, false, false, false, false, false]

// manually select if a layer is generating
let drawing = [false, false, false, false, true, true, true, true, true]

// drawing settings for analysis
let brightnessLimits = [255, 221, 187, 155, 123, 94, 66, 40, 14, 0]; // according to denman ross nine step values (color theory)


// preload the images
function preload() {
	// initizialize the image to be drawn
	img = loadImage("images/hasibwide-nobg.png");
	img2 = createImage(img.width, img.height);
	img3 = loadImage("images/hasibwide-nobg.png");
	img4 = loadImage("images/hasibwide-nobg.png");

	// initialize sound
	//soundtrack = loadSound('sounds/yamhigh.mp3');

	spriteData = loadJSON('images/spritesheet.json');
	spriteSheet = loadImage('images/spritesheet.png');
	

	// initialize the chicken part images
	for (let i = 0; i < 81; i++) {
		chickenbody[i] = loadImage(`images/chickens/chickenbody-${i}.png`);
		chickenlines[i] = loadImage(`images/chickens/chickenlines-${i}.png`);
		chickendetail[i] = loadImage(`images/chickens/chickendetail-${i}.png`);
		chickenotherdetail[i] = loadImage(`images/chickens/chickenotherdetail-${i}.png`);
	}

}


	
// Prepare the canvas and images
function setup() {
	// Canvas and Graphics Buffers
	createCanvas(w, h); 	
    canvas0 = createGraphics(w, h);
    canvas1 = createGraphics(w, h);
    canvas2 = createGraphics(w, h);
    canvas3 = createGraphics(w, h);
    canvas4 = createGraphics(w, h);
    canvas5 = createGraphics(w, h);
    canvas6 = createGraphics(w, h);
    canvas7 = createGraphics(w, h);
    canvas8 = createGraphics(w, h);
	canvas = [canvas0, canvas1, canvas2, canvas3, canvas4, canvas5, canvas6, canvas7, canvas8];

	// Scribble library for each graphical buffer
	scribble0 = new Scribble(canvas0);
	scribble1 = new Scribble(canvas1);
	scribble2 = new Scribble(canvas2);
	scribble3 = new Scribble(canvas3);
	scribble4 = new Scribble(canvas4);
	scribble5 = new Scribble(canvas5);
	scribble6 = new Scribble(canvas6);
	scribble7 = new Scribble(canvas7);
	scribble8 = new Scribble(canvas8);
	scribble = [scribble0, scribble1, scribble2, scribble3, scribble4, scribble5, scribble6, scribble7, scribble8];

	// Prepare and preprocess image for sketching
	pixelDensity(1);
	img.resize(width, height); 
	img2.resize(width, height); 
	img3.resize(width, height);
	img4.resize(width, height);
	img3.loadPixels();
	img4.loadPixels();
	img4.filter(POSTERIZE, 4)
	loadPixels();
	processImage(img, img2);

	// loop sound
	//soundtrack.loop();
	//soundtrack.stop();

	// create the quadtree for the thinning algorithm
	let boundry = new Rectangle(img.width/2, img.height/2, img.width/2, img.height/2)
	qtree = new QuadTree(boundry, 4, 0);

	// music visualizer
	// analyzer = new p5.Amplitude();
	// analyzer.setInput(soundtrack);

	//randomize slider
	///slider = createSlider(0, 8, 2.25, 0.25);
	//slider.style("width", "50em");

	//size slider
	//sizeSlider = createSlider(0, 2, 1, 0.2)
	//sizeSlider.style("width", "20em")

	//facial recognition
	if (!readyToGenerate) imageReady();
}

// draw the provided image
function draw() {
	background(0);
	//image(img2, 0, 0);

	if (readyToGenerate) {
		let strokeThickness = 6;
		let distanceRange = 130;

		// for object size and amount to thin
		//let thinMax = 350; //starting at i = 0
		//let thinMin = 310; 
		let thinMax = 190; //starting at i = 4
		let thinMin = 150; 

		for (let i = 3; i < 9; i++) {
			if (drawing[i]) {
				let minSize = (i > 6) ? 45 : thinMin;
				let maxSize = (i > 6) ? 70 : thinMax;

				drawLayer(
					canvas[i], 
					brightnessLimits[i + 1], 
					brightnessLimits[i], 
					distanceRange/3, 
					minSize/3, 
					maxSize/3, 
					i, 
					strokeThickness/3, 
					gen[i], 
					scribble[i]
				);
			}

			strokeThickness -= 1.5;
			thinMax -= 40;
			thinMin -= 40;
			if (i === 2 || i === 5) distanceRange += 10;
		}

	}
  
	///qtree.show()
	for (let i = 4; i < 9; i++) {
	  image(canvas[i], 0, 0);
	}
  }
  

