// implementation of the flocking algorithm by the Coding Train
// use for particles
let particles = [[], [], [], [], [], [], [], [], []]
let boid = [0, 0, 0, 0, 0, 0, 0, 0, 0]
let lerpAmt = [0, 0, 0, 0, 0, 0, 0, 0, 0]

class Particle {
	constructor(canvas, x, y, size, randomize, prevCol, prevX, prevY, ogCol, lerpAmt) {
		this.x = x;
		this.y = y;
		this.prevX = prevX;
		this.prevY = prevY;
		this.ogX = x;
		this.ogY = y;

		this.size = size;
		this.randomize = randomize;

		this.position = createVector(x, y);
		this.velocity = p5.Vector.random2D();
		this.velocity.setMag(random(2, 4));
		this.accelaration = createVector();
		this.maxForce = 0.2;
		this.maxSpeed = 8;
		this.fillCol2 = lerpColor(
			color(prevCol[0], prevCol[1], prevCol[2], 50), 
			color(ogCol[0], ogCol[1], ogCol[2], 50), 
			lerpAmt);
		this.canvas = canvas;
	}

	edges() {
		if (this.position.x > this.x + this.size) {
			this.position.x = this.x - this.size
		} else if (this.position.x < this.x - this.size) {
			this.position.x = this.x+this.size
		}

		if (this.position.y > this.y + this.size) {
			this.position.y = this.y - this.size
		} else if (this.position.y < this.y - this.size) {
			this.position.y = this.y+this.size
		}
	}

	align() {
		let perceptionRad = Math.round(this.size/8);
		let avg = createVector();
		let total = 0;
		let range = new Rectangle(this.position.x, this.position.y, perceptionRad, perceptionRad);
		let points = qtree.query(range)
		if (points) {
			for (let other of points) {
				let d = dist(this.position.x, this.position.y, other.x, other.y);
				if (other != this && d < perceptionRad) {
					avg.add(createVector(other.x, other.y));
					total++;
				}
			}
		}
		if (total) {
			avg.div(total);
			avg.setMag(this.maxSpeed);
			avg.sub(this.velocity);
			avg.limit(this.maxForce);
		}

		return avg;
	}

	cohesion() {
		let perceptionRad = Math.round(this.size-1/8);
		let avg = createVector();
		let total = 0;
		let range = new Rectangle(this.position.x, this.position.y, perceptionRad, perceptionRad);
		let points = qtree.query(range)

		if (points) {
			for (let other of points) {
				let d = dist(this.position.x, this.position.y, other.x, other.y);
				if (other != this && d < perceptionRad) {
					avg.add(createVector(other.x, other.y));
					total++;
				}
			}
		}
		
		if (total) {
			avg.div(total);
			avg.sub(this.position);
			avg.setMag(this.maxSpeed);
			avg.sub(this.velocity);
			avg.limit(this.maxForce);
		}

		return avg;
	}

	separation() {
		let perceptionRad = Math.round(this.size/4);
		let avg = createVector();
		let total = 0;
		let range = new Rectangle(this.position.x, this.position.y, perceptionRad, perceptionRad);
		let points = qtree.query(range)
		if (points) {
			for (let other of points) {
				let d = dist(this.position.x, this.position.y, other.x, other.y);
				if (other != this && d < perceptionRad) {
					let diff = p5.Vector.sub(this.position, createVector(other.x, other.y));
					if (d > 0) diff.div(d);
					avg.add(diff);
					total++;
				}
			}
		}

		if (total) {
			avg.div(total);
			avg.setMag(this.maxSpeed);
			avg.sub(this.velocity);
			avg.limit(this.maxForce);
		}

		return avg;
	}


	flock() {
		let alignment = this.align();
		let cohesion = this.cohesion();
		let separation = this.separation();
		this.accelaration.add(separation);
		this.accelaration.add(alignment);
		this.accelaration.add(cohesion);
	}

	update() {
		this.position.add(this.velocity);
		this.velocity.add(this.accelaration);
		this.velocity.limit(this.maxSpeed);
		this.accelaration.mult(0);
	};

	show = function () {
		this.canvas.stroke(this.fillCol2);
		this.canvas.strokeWeight(this.size/3);
		this.canvas.point(this.position.x, this.position.y);
	};
}

function generateParticles(canvas, x, y, size, randomizer, prevX, prevY, layerNum) {
	let currIndex = (x + y * img.width) * 4
	let prevIndex = (prevX + prevY * img.width) * 4
	let ogCol = [img3.pixels[currIndex + 0], img3.pixels[currIndex + 1], img3.pixels[currIndex + 2], img3.pixels[currIndex + 3]];
	let prevC = [img3.pixels[prevIndex + 0], img3.pixels[prevIndex + 1], img3.pixels[prevIndex + 2], img3.pixels[prevIndex + 3]];

	moveParticles(particles[layerNum], boid[layerNum], canvas, x, y, size, randomizer, prevC, prevX, prevY, ogCol, layerNum);
}

function moveParticles(particleArray, particleNum, canvas, x, y, size, randomizer, prevCol, prevX, prevY, ogCol, layerNum) {
	lerpAmt[layerNum] += 0.02;
	if (lerpAmt[layerNum] === 1) lerpAmt[layerNum] = 0;

	if (particleArray.length < 200) {
		particleArray.push(new Particle(canvas, x, y, size, randomizer, prevCol, prevX, prevY, ogCol, lerpAmt[layerNum]))
	} else if (particleArray.length === 200) {
		particleArray[particleNum].x = x;
		particleArray[particleNum].y = y;
		particleArray[particleNum].size = size;
		particleArray[particleNum].randomize = randomizer;
		particleArray[particleNum].prevCol = prevCol;
		particleArray[particleNum].prevX = prevX;
		particleArray[particleNum].prevY = prevY;
		particleArray[particleNum].ogCol = ogCol;
		particleArray[particleNum].fillCol2 = lerpColor(
			color(prevCol[0], prevCol[1], prevCol[2], 50), 
			color(ogCol[0], ogCol[1], ogCol[2], 50), 
			lerpAmt[layerNum]);

		particleNum++
		if (particleNum === 199) particleNum = 0;
	}


	for (let i = 0; i < particleArray.length; i++) {
		particleArray[i].edges();
		particleArray[i].flock();
		particleArray[i].update();
		particleArray[i].show();
	}
}