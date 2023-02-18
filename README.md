# 1000-Chickens Introduction
1000 Chickens is an artistic image processing algorithm for drawing imported images with personally hand drawn chicken doodles stored as indexed png files and other effects such as coded geometry or paint/sketch simulations. 

**NOTE:** *This repo does not actually hold the codebase for the algorithm and is instead meant to be a public facing introduction to the process of creating the algorithm that generated the pictures below. The codebase currently exists in a private repo, but if any potential employers, generative artists, etc are interested in seeing the code and learning more about my process, please shoot me a message! I have a gitfront link that can provide view access and I am more than happy to discuss my work around this.*

I have included examples of resulting output images and input images used, including the directory where I have indexed the chicken file pngs. I have also included a javascript file showing the quadtree class used to optimize the algorithm. The rest of this README will include journal entries detailing some of my process creating and optimizing this algorithm, plans for the algorithm, and credits to other developers/generative artists that helped inspire the different directions this project took. 

![image-gen](generation-test.png)<br />

*Scroll down to see other examples (taken from output images folder)*

## Summary, Current Status, and Plans (2/16/2023)
The current algorithm is optimized and quite powerful. I've recently introduced facial detection using libraries from ML5js for havng greater control over how faces are drawn. 

At this point, I am looking to host the project on a personal site along with other work I've created as an artist (including physical work, photography, and digital/generative work). I've recently been prototyping smaller apps that will eventually be merged together to create my artists site, so I will have a live version of the algorithm as soon as possible. 

I've otherwise been looking at ways to further optimize my algorithm. There may be more I can clean up with the algorithm or something I'm missing, but I'm at a point where I believe I'm approaching the limit of how powerful this algorithm can get with p5js/javascript in particular. I'll detail below how the algorithm runs, but it is essentially drawing these images in layers according to a pixels brightness value. With the quadtree, I've currently optimized it to the extent that I can have each layer running in its own graphical buffer and generate the image all at once. Thats about 8-10 graphical buffers running the algorithm simultaneously, and this includes some fairly heavy effects such as a flocking algorithm that simulates spray paint. 

For reference, before the quadtree I was querying millions of coordinates using a 2D array, and each layer was being drawn one at a time using a mouse click to switch between layers taking 30 or more minutes to generate an image. The 2D array was using around 400mb of memory. With the quadtree and including the added stress I've added to the system with the graphical buffers and complicated effects, the algorithm only uses about 20-40mb of memory, and can generate within 5-10minutes. 

At this point, one option for further optimization is migrating the algorithm to processing (java), which is much quicker at pixel manipulations as a lower level language. However, I wouldn't be able to host the algorithm without using a compiler that converts the code to javascript anyways. Though, I am still considering it as an option to have a more powerful version purely for generating art and creating videos.

The other option, and the one im currently exploring, is creating a new iteration using GLSL shaders. Shaders would allow me to code directly to the GPU. They are essentially how video games are made, and are very challenging as it's pure matrix math. The logic flips everything I know about programming on its head. Basically, shaders are capable of manipulating the entire matrix of pixels all at once, and that's what makes them so difficult but also so powerful. In javascript, for example, things happen sequentially. I can grab a pixel, do something to it, and move on. With a shader, however, I don't get a pixel...I am all the pixels. With a shader I wouldn't need any fancy data structures. Instead, I can pass previous and current pixel information by capturing the entire state as as buffer and passing it into the shader, this creates a pattern where a shader is essentially being passed into itself. I'm still wrapping my head around how they work, and how I can work all my chickens into them, but I have began playing around with the kinds of effects I can make with them. Essentially, I can use WEBGL mode in p5js to display the shaders. I may not be able to get the exact same effect as the current algorithm, but I should be able to create an extremely powerful version that is hostable and even more interesting with interactable effects. For example, I'm currently testing a watercolor effect in p5 and glsl that has the chicken png files generating as though they are water droplets and the mouse is able to move the pixels around like ink/water. I've included a sample of my current work with them below but I'll dive more into my progress with them another time... 

## Process (Past Journal Entries)
I've added below some past journal entries I wrote on building and optimizing the algorthim. <br />

### 10/24/22

Below is pseudocode for my drawing algorithm & other thoughts on my process.<br />

#### Preprocess image:
The first step of my algorithm is to preprocess the image with posterization & an edge detection algorithm. 

Essentially, what I’m doing is creating a handful of brightness thresholds going from 255 to 0. I want to draw the image in layers according to each range of brightness and also according to the distance from the previous pixel. By preprocessing the image, I can better prepare it for brightness analysis. First, I posterize the image to limit the channel of colors to create fewer tones, essentially creating sections of color. Then I perform edge detection using an algorithm by Crystal Chen & Paolla Dutra of NYU.<br />
<br />
The basic idea of edge detection is to approximate the change in light intensity in an image. This is done by comparing the values of pixels on the right and left side (x-direction) and also on the upper and lower side (y-direction). This is done using two 3x3 kernels for each x and y direction. The change in light intensity is the gradient magnitude of the edge computed by the following:<br />
<br />
|G| = sqrt((Gx*Gx) + (Gy*Gy))<br />
Gx = Gradient x-direction<br />
Gy = Gradient y-direction<br />
<br />
This isn’t my area of expertise, so I won’t dive to deep into it, but more information on edge detection can be found here:<br />
https://idmnyu.github.io/p5.js-image/Edge/index.html

The idea behind posterizing and then detecting the edges, however, is to create sections of color in the image. So it not only detects edges on the objects in the image, but also somewhat separates the regions of color, making it easier to draw.<br />

*Here is a sample of what the preprocessed image would look like before being fed into the algorithm for analysis. You might notice a lot of black around the edges detected in the posterization. I actually deal with that by setting the colors of the final layer drawn, the layer that captures the darkest colors, to the colors of the original imported image instead of the colors of the posterized image.*<br />
![image-edge-posterize](/output%20images/posterizewithedgedetection.png)<br />



#### Draw Image:
Once we set up the canvas and preprocess the image, I am ready to begin drawing. As mentioned, the basic idea is to draw the image in layers according to the brightness values. This specifically allows me to not only control the shape, size, & density of the points, but makes it easier to use more complicated effects like curve lines resembling a sketch using curveVertex in p5js. <br />
<br />
I’ve set up the following arrays to analyze brightness:<br />
Brightness Ranges = [255, 180, 120, 90, 60, 30, 0]<br />
Upper limit = Brightness Range[ Count ], ex. 255<br />
Lower limit = Brightness Range[ Count + 1 ] ex. 180<br />
<br />
Distance Threshold = [Array of values that can change based on size of image, ex. 100, 200..]<br />
→ This more specifically is for drawing curves or for a paint simulation. I don’t want a line being drawn all the way across the image if two unrelated regions of the image have the same brightness values.<br />
<br />
Thin Amount = [Array of values]<br />
→ I’d like to control the density of the image, so I’m not placing it at every pixel coordinate using a thinning algorithm. This ensures lines/curves are drawn properly and also reduces load on the algorithm. There are other performance issues with this, however, involving the storage of pixel coordinates that I will get into later in this journal.<br />
<br />
So now that I have my values set up for analyzing the image, what I then do is pull a random coordinate to find the color of that pixel and its brightness, then I map the brightness to a size value using the thin amounts, and then check it against the arrays I have set up.<br />
→ Does it fall in the right brightness range?<br />
→ Is the brightness of the current and previous pixel within the brightness threshold? <br />
→ Is the distance between the current & previous pixel within the threshold?<br />
→ Have I used this coordinate before? (Check it against the thinning algorithm)<br />
<br />
If the coordinate passes all these checks, the coordinate is marked complete in the thinning algorithm and I place a shape, line, chicken, or other effect. Finally, I set the current X,Y coordinate to the previous X,Y before the loop continues.

##### How different effects are drawn:
If you take a look at some of my sample images, you'll notice a variety of different effects beyond just the chickens, and even with the chickens you may be wondering how I can get so detailed by filling the different parts of the chicken with different colors.<br />

As for the chickens, each one is actually 4 different png files. I've been extracting these chicken doodles from my physical work as an artist into photoshop, and chopping each one into 4 different pieces:<br />
The outline<br />
The main body<br />
Detail 1<br />
Detail 2<br />

Each of these files is imported into the algorithm as a white image and then tinted to the color of the pixel. I can get extra color detail onto each chicken by tinting certain parts the color of the previous pixel or the color of the image before preprocessing, but I tend to tint the outline color black. Currently, I have about 80 chickens indexed which equates to about 320 tiny png files. I have A LOT of chickens I've drawn over the years that I intend on eventually indexing into this algorithm, I'm anticipating that number will eventually be 1000. <br />

As for the other effects...<br />

The shapes are coded geometry using common algorithms for different shapes I found online. Some of the shapes like the polygon and starts have algorithms that can take in a number and spit out a shape with a different number of sides or points, so I've baked some randomness into the algorithm that can switch up how many sides or points a shape has. In addition, I'm using a library called p5.scribble that can give objects created on the p5 canvas a handrawn look. This is helpful in that it helps produce an even look between the shapes and chicken images. However, I did have to adjust the shape algorithms to be able to work with p5.scribble as the way p5.scribble creates shapes and vertices is different than how I initially found the algorithms. <br />

The curvey line effect was acheived using the curveVertex() function in p5js. It plots a handful of points and draws a curve through them. I actually initially was interested in designing this algorithm to work with this method. As a more complicated effect, I can't just plot a point at every pixel coordinate or else I'd end up with the entire image being a line, so I had to implement a thinning algorithm to spread out the coordinates (discussed below). This thinning algorithm helped with acheiving a higher level of detail in the output image when plotting just shapes as well.<br />

The painted effect is a flocking algorithm I found online following the Coding Train. I'm not exactly a physics expert so I won't go into detail on how it works but it is simulating how birds/bees flock in the air, and adds a nice motion on the image when generating that reminds me somewhat of spray paint.<br />
#### Thinning algorithm:
The thinning algorithm is simple but also leads to a lot of memory issues. However, without it, certain effects wouldn’t work and the speed at which effects are placed can cause too heavy a load due to all the checks the algorithm needs to do, also resulting in performance issues. <br />
Essentially, the thinning algorithm takes the current coordinate and checks the coordinates around it spanning a distance related to the thin amount. If none of the coordinates are marked completed, then all those points are marked as completed.<br />
<br />
Initially, I stored coordinate information in a 2D array of X,Y values. 0 for unused, 1 for used. However, this would lead to a massive array with millions of elements that was very memory intensive. The 2D array was leading to about 400-500mb of memory usage. Optimizing this took a while to figure out but I came up with 2 improvements. 

#### Cache Coherency:
This is the first optimization I discovered when seeking to improve the performance of my algorithm. When iterating over x,y values, it is best practice to iterate according to principles of Cache Coherency.<br />
<br />
To understand cache coherence, it's best to first have a review of computer memory:<br />
→ Non-volatile Memory: Like a hard disk drive, uses 5400 - 7200 rev/sec. Speed is slow, 80-150 mbs, so even though the CPU can accept memory faster, the hard drive can only give it so fast.<br />
→ Random Access Memory (RAM): Faster than HDD, but still slower than CPU. Provides memory at 400-800 MHz but CPU has clock speed of 1 GHz - 9 GHz (Hertz is number of cycles per second or the clock speed of a computer). Newer RAM is much faster at 1600 MHz - 2400 MHz.<br />
<br />
Side Note: Modern Day processors are not single core, they are multicore, so if all cores are asking for data at the same time, faster RAMs still can’t deliver data to all the cores at the same-time<br />
Old Days: [ CPU 1 ]<br />
Nowadays: CPU [ 1 2 3 4 ]<br />
<br />
→ Cache Memory: Fastest among all memories. It is also a RAM but a special kind in that it is Static RAM. Size can range from KB to MB. Data requested by CPU can be supplied by cache, and there are also different levels of Cache. <br />
L1 cache is integrated into the CPU itself, and each core has its own, so they can operate at the same speed as the CPU. L1 is the fastest. <br />
L2 cache can be inside or outside CPU and can be shared with all cores of the CPU. If L2 is outside, then it is connected with a very high speed bus speed (256kb to 572kb).<br />
L3 cache, not all CPUs have it but if they do then it is outside the CPU and is shared with all cores.<br />
<br />
The following shows the flow of the CPU when looking for data:<br />
CPU → L1 → L2 → L3 → RAM → HDD<br />
First the CPU checks the cache (caching data), then if data is unavailable it checks the ram, and then finally the HDD.<br />
Cache is specifically much smaller than RAM and HDD because it is much costlier than other memory types. <br />
<br />
Cache coherence refers to the problem of ensuring that multiple cache copies of the same data in a computer system are kept consistent. In a multi-core or multi-processor system, each core or processor may have its own cache, which stores copies of frequently accessed data. If multiple cores or processors are accessing the same data, there is a possibility that the data in one core's cache may become out of date, leading to inconsistencies in the system. To ensure cache coherence, various mechanisms are used to ensure that all copies of a given piece of data are kept up to date. These mechanisms may include the use of special hardware or software protocols to coordinate updates to the data across all of the caches in the system. In essence, cache coherence ensures that all processors or cores in a system are working with the same, up-to-date data, even when that data is stored in multiple different caches.<br />
<br />
→ Essentially there is one instruction copy in main memory & one in each cache. If one copy is changed, the other copies must also be changed. <br />
CPU1|Cache 1-------CPU2|Cache2-------CPU3|Cache3-------SHARED MEMORY<br />

So what does this have to do with our drawing algorithm?<br />
<br />
Essentially, I was creating a 2D array in the following order [x][y]. This means I was scanning the image vertically. By changing to horizontal scanning, the data is stored closer together in memory, so there are less cache misses between different levels of cache and thus performance is faster, so it is better to scan pixels in the index they are stored. Every processor also has a very fast increment instruction for integers. It’s typically not as fast for “Increment by some amount and multiply by the second amount”. By scanning the 2D array [y][x], I optimized for cache coherency and this led to about 15% increase in efficiency. From 400-500mb to 300-400mb. In addition, I noticed visually the image was filling in much better than before. While this was a great improvement, the next optimization was significantly better. 

### 11/13/22

#### The QuadTree: 
This optimization led to a 10x performance improvement and dropped memory usage down from 300-400mb to 10-30mb as it allowed me to not need the 2D array at all, which was taking up the bulk of memory. A QuadTree is a tree-like data structure in which each node has exactly 0 or 4 children. They are used for partitioning two dimensional space. Common uses are image compression algorithms or for querying geolocation data. Uber, for example, uses a quadtree server to match drivers and riders using Google S2.<br />

#### Visual Representation:
![plot](quadtree-visual.png)

There are a few prerequisites for the quad tree:<br />
→ A point class denoting the x,y coordinates on a plane<br />
→ A rectangle class for constructing a rectangle, functions for checking what points the rectangle contains and also for checking the intersection with another shape placed on top of the quadtree (intersection isn’t 100% necessary as another shape can be used).<br />

Essentially, what the quadtree does is let you know which points are near a specified coordinate without needing to check every coordinate on a plane. Since I need to know which pixels are near a selected coordinate when drawing the image in order to thin out the number of points placed, the quadtree allows me to do this very quickly. As opposed to using a massive 2D array, I can use the quadtree to query coordinate data where the effect being placed intersects with the tree.<br />

The quadtree constructor itself takes a rectangle boundary formed by our rectangle class, a max capacity of coordinates per rectangle before a rectangle subdivides, an array to hold the points, and a boolean for whether or not the boundary is divided (set to false at first). It will then recursively subdivide until all points on a plane are plotted. A subdivision happens once a rectangle's array hits the max capacity, at which point the division boolean will be set to true. <br />

#### There are two functions that are required for the recursion:
Subdivide() → creates 4 rectangles<br />
Insert(point) → Adds a point to the rectangles points array, if the points are at the max capacity then it subdivides.<br />

##### Finally, there are a handful of other important functions:
Show() → displays the quadtree<br />
Query() → This takes a range (in my case a rectangle) and checks the intersection of the rectangle with the quadtree and pushes any found points into a new found array, if the range contains divided regions, it recursively checks those regions as well. The resulting found array is the data around the current coordinate I am plotting. <br />

## Additional Examples

*Sketch Only: My initial goal before this algorithm involved my doodles was having the algorithm create sketches. The algorithm could still use fine tuning for sketches specifically, however, since I've moved on to focusing on different effects, it hasn't been my main focus.* <br />
![image-sketch](/output%20images/murakami-sketch-gen.png)

*This version incorporates facial recognition. This version uses facemesh api from ML5/Tensorflow. I use an algorithm to check whether a point exists inisde of the mesh, and from there I check to see which point on the facemesh is closest to the current pixel I am on. I map the z-value of the closest point to a value that will scale the size of the effect down on the face. Making it more detailed and capturing some of the contours* <br />
![image-gen](/output%20images/facemesh-adeeb.png)

*This a sample gif of an image being generated. This is sped up and is using the original version of the algorithm where I generate the layers one at a time. The current iteration can have the layers generate all at once* <br />
![video-gen](/output%20images/sample-gen.gif)

*This is a sneak peek into what kind of effects I can acheive with shaders.* <br />
![video-shader](/output%20images/shader-sample.gif)



## Credits and Concluding Info
This algorithm was developed via a combination of methods inspired by other creative developers as well as personal experimentation <br />
<br />
This algorithm draws a given image with chickens via a database of hand-doodled chickens by yours truly (Hasib Hashemi of @WizardsRobbingKids) <br />
<br />
Although the primary goal was to generate murakami style images with my own work, the algorithm can also do a good job drawing the image with lines, cubes, and other shapes. Please view the output images to see some examples of what this algorithm can produce. <br />
<br />
This algorithm is also able to be controlled via inputs using the keyboard or on screen sliders, size of effects can be adjusted, randomness, or even set to add additional randomness by drawing to imported music according to the sound level of the track being played. <br />

#### Credits to the following developers for inspiring the following methods used:
→ Original Edge Detection Algorithm by Crystal Chen & Paolla Bruno Dutra of NYU. Algo explanation here: https://idmnyu.github.io/p5.js-image/Edge/index.html <br />
→ Jason Stirman inspired the drawing algorithm by providing high level details of his own drawing algo/thinning algo on Processing forums and his website. See here: https://discourse.processing.org/t/curve-density-over-an-image/3210 <br />
→ The Coding Train for inpiring both the flocking algorithm and improvements to the thinning algorith via the use of a quadtree as opposed to a 2D array: https://thecodingtrain.com/challenges/98-quadtree. <br />



 


