# 1000-Chickens Introduction
1000 Chickens is an artistic image processing algorithm for drawing imported images with personally hand drawn chicken doodles stored as indexed png files and other effects such as coded geometry or paint/sketch simulations. 

**NOTE:** *This repo has recently been updated to include the codebase for my algorithm, but is not quite hosted yet. If any potential employers, generative artists, etc are interested in seeing the code in action and learning more about my process, please shoot me a message!*

I have included examples of resulting output images and input images used, including the directory where I have indexed the chicken file pngs. The rest of this README will include journal entries detailing some of my process creating and optimizing this algorithm, plans for the algorithm, and credits to other developers/generative artists that helped inspire the different directions this project took. 

![image-gen](generation-test.png)<br />

![image-gen](/output%20images/nobg-hasib.PNG)<br />

*Scroll down to see other examples (taken from output images folder)*

## Core Build Process

**Tech Used:** The original algorithm was created in P5JS, but has recently been refactored into vanillaJS and React/Next for use without the need for creative framework. I also have included a different, but related version using GLSL Fragment Shaders.

This project was my introduction to image processing, and the original goal was to write an algorithm that can simply sketch an image. Over time, however, the project evolved into accomodating a variety of different effects the more I experimented. When beginning this journey, I found that resources on generative art were quite sparse. Generative artists tend to be more secretive of their code, so finding resources to guide my process was quite difficult. Creative IDE's had a few examples, but at the time I didn't quite understand the logic. The Coding Train and the community behind P5JS/Processing provided resources that were very helpful in generally understanding pixel manipulation, and later in learning optimization strategies. Ultimately, however, I felt fairly on my own during the build process.

Initially, I started by figuring out how to access the pixels of an image and use them to create a tiled effect. Below is a simple example of what that might look like in P5JS:

code(
    for (let x = 0; x < img.width; x++) {
        for (let y = 0; y < img.height; y++) {
            let index = (x + y * img.width) * 4

            let r = img.pixels[randIndex + 0];
            let g = img.pixels[randIndex + 1];
            let b = img.pixels[randIndex + 2];
            let b = img.pixels[randIndex + 3];

            let col = color(r,g,b);
            let bright = brightness(col);

            let w = map(bright, 0, 255, Lower Threshold Value, Upper Threshold Value) //maps the brightness, which is on a scale of 0-255, to a new value between two numbers of our choice.

            circle(x, y, w)
        }
    }
)

This code iterates over the pixels of an image and uses a specific formula to find the index of the pixel we are currently on. Since each pixel is actually 4 values for RGBA, the index on its own only represents the red value, so we can simply increment up to 3 to find the rest of the color values. P5JS abstracts away a lot of the complexity behind the canvas and makes it easy to simply start coloring and drawing. Using the color of the current value, we can find it's brightness and then map that brightness to a size value. As an example, we can finish by drawing a circle at the current (X,Y) coordinate with the new size value we calculated. This code would result in a white circle with black outlines being drawn at different sizes at every pixel. The darker areas of the image would be smaller, whereas the brighter areas would have larger circles. 

This was essentially the starting point for my own algorithm. As an artist, I quickly saw a lot of directions I could take this using different shapes or potentially even importing my own drawings. While this was a great starting point, it didn't necessarily get me closer to my goal of actually drawing lines. I had read about few strategies for lines for thinning out the points, but I didn't immediately understand how to implement that. Still, I thought it would be useful to experiment with different strategies of doing that with shapes. I tried incrementing the X and Y for loops by larget amounts (x+=10, y+=10) to decrease the amount of coordinates I was plotting at. I found that image not only generated faster, but reducing the density produced a nicer looking image. At this point, I put a pause on trying to generate lines and focused more on other effects. Specifically, I started experimenting with colors and also importing my own doodles to sketch an image. It was quite easy to alternate between specific effects, and if i imported my doodles as white pngs, I could tint them to the colors of the image. 

Time went by, and I mostly used this as a starting point to get accustomed to creating different effects. The images were reminding me a lot of some of my favorite artists like Takashi Murakami. However, the algorithm still wasn't close to my original goal of sketch like lines. The next thing I began expirementing with is isolating where the effects were being drawn. I tried only drawing to darkers of the image:


code(
    draw() {
        beginShape()
        for (let x = 0; x < img.width; x+SkipValue) {
            for (let y = 0; y < img.height; y+SkipValue) {
                let index = (x + y * img.width) * 4

                let r = img.pixels[randIndex + 0];
                let g = img.pixels[randIndex + 1];
                let b = img.pixels[randIndex + 2];
                let b = img.pixels[randIndex + 3];

                let col = color(r,g,b);
                let bright = brightness(col);

                if (bright < Brightness Threshold) {
                    let w = map(bright, 0, 255, Lower Threshold Value, Upper Threshold Value) //maps the brightness, which is on a scale of 0-255, to a new value between two numbers of our choice.

                    circle(x, y, w)
                    //curveVertex(x,y)
                }
            }
        }
        endShape()
    }
)

The images procuded when adding the new conditional were a little closer to what I was looking for when using black and white shapes, but not quite with lines yet. P5JS has a function for drawing a curved line through a series of plotted points. The draw function in P5JS loops infinitely, so for each iteration it would loop through the image, plot a number of points, and then draw a line through the points. With this algorithm, however, there was no way to control when to stop plotting lines. There was also no way to isolate the lines in the correct areas. Even though selectng the brightness was more specific in isolating effects, if parts of image on opposite sides of an image had a similar brightness value, then its possible a line could be drawn across the page. 

Although this next step took a lot of experimenting and time to figure out, I essentially needed a way to thin out the points and to more specifically isolate the areas that are being drawn. I also realized this would not only enable the algorithm to draw lines, but would also provie a much nicer and controlled effect when drawing other effects like shapes or my doodles. A thinning algorithm would require me to record where I've already been when plotting, and I could further isolate where the effects are being drawn by accounting for how far the current pixel is from the previous pixel. I began recording the previous pixel each iteration, and checking it against a distance threshold using the dist() function in P5JS. 

For the thinning algorithm, I started by storing pixel information using a 2D array of X,Y values. For each iteration I would check to see if the current pixel and each pixel surrounding it up to a certain thinning threshold were stored in the array. If the pixel passed the check (returned false for the 2d array containing the point), then I would draw/plot the point and store the pixel in the 2D array. Otherwise, I would skip the iteration and move onto the next:


code(
    draw() {
        beginShape()
        for (let x = 0; x < img.width; x+SkipValue) {
            for (let y = 0; y < img.height; y+SkipValue) {
                let index = (x + y * img.width) * 4

                let r = img.pixels[randIndex + 0];
                let g = img.pixels[randIndex + 1];
                let b = img.pixels[randIndex + 2];
                let b = img.pixels[randIndex + 3];

                let col = color(r,g,b);
                let bright = brightness(col);
                let distance = dist(x,y,prevX,prevY);

                if (bright < Brightness Threshold && distance < distanceThreshold) {
                    if (!containsPointThinningAlgo(x,y,thin amount)) {
                        let w = map(bright, 0, 255, Lower Threshold Value, Upper Threshold Value) //maps the brightness, which is on a scale of 0-255, to a new value between two numbers of our choice.

                        curveVertex(x,y)
                    }
                }
            }
        }
        endShape()
    }
)

It wasn't perfect, but this worked! Threshold values required optimizing and not every image was coming out perfectly as sometimes the algorithm was too isolating. What I realized, however, is that I could actually set the algorithm up with to draw in layers according to different ranges of brightness, so there would be both a lower and upper threshold brightness. This strategy essentially became the first version of the algorithm. It worked well, I was able to fill the whole image, and I could get very specific with how effects were drawn. 

From here I was able to get more creative with my effects:

* Coded geometry for more interesting shapes
* Splitting my doodles into multiple pieces that would layer on top of each other for greater color variation when tinting the image prior to drawing it to the canvas
* Implementing algorithms for paint like effects (Using existing flocking algorithms for example)

The next step was optimizing the algorithm, both for effect and speed.

## Optimization Process

This algorithm went through a number of revisions and optimizations to improve both the produced effect as well as the speed and memory efficiency of the algorithm. While the initial version worked, there were a number of issues. I addressed and readdressed these issues at different times, so instead of addressing them in the order I tackled them in, I'll list the issues and the process I went to solve them:

**Improving the final produced effect:**

The effect was working well initially, but there were a few issues. It was difficult to pin down the perfect distance value, so occassionally lines would be drawn across areas they shouldn't be. I tried implementing an existing edge detection algorithm and doing some preprocessing on the image to better align the color data. For example, by posterizing the image I could minimize the color variation and keep the brightness consistent in the different portions of the image. I also used edge detection to draw dark lines around areas of the image. The idea behind posterizing and then detecting the edges, however, is to create sections of color in the image. So it not only detects edges on the objects in the image, but also somewhat separates the regions of color, making it easier to draw.<br />

*Here is a sample of what the preprocessed image would look like before being fed into the algorithm for analysis. You might notice a lot of black around the edges detected in the posterization. I actually deal with that by setting the colors of the final layer drawn, the layer that captures the darkest colors, to the colors of the original imported image instead of the colors of the posterized image.*<br />
![image-edge-posterize](/output%20images/posterizewithedgedetection.png)<br />

I also implemented facial detection to gain even better control over how faces would be drawn. This step came later and was acheived using the ML5 machine learning library and facemesh api. 

In my most recent version, however, I realized edge detection and posterization wasn't really necessary. What I realized I could do instead, is compare the similarity of color between the current previous pixels. This can be done by measuring the euclidean distance between each RGB color value, summing the values, and then finding their square root. 

code(colSimilarity=sqrt((r2-r1)^2+(g2-g1)^2+(b2-b1)^2))

Finding the similarity between colors actually produced a better effect than edge detection and posterization. It worked especially well in isolating where lines should be on a generated image. 

Finally, further down the line once I optimized the speed of the algorithm, I was able to throw the differet draw layers of the algorithm in their own graphical buffers. This provided a much better veiwing experience as it allowed me to draw the image all at once, as opposed to drawing it one layer at time.

**Optimizing Speed and Memory:**

The other major issue was the original algorithm was very slow, and crashed often, especially when trying to generate large images. The algorithm was initially using around 400-500mb of memory! It was clear why– I was plotting millions of points and storing all that information in a massive 2D array that needed to be checked every single iteration while looping through the image. However, it wasn't immediately obvious to me how to solve this issue. I tried using other basic data structures like a Javascript map, but I wasn't able to store as much data as I was able to in the array, so it wasn't viable for producing larger images. 

I instead began by trying to clean and inspect the code in other areas. One of the techniques I came across involved modifying how I was iterating through the image by following the principles of Cache Coherency. I'm not quite an expert in computer memory, but from what I understand, Cache Coherency refers to the consistency of memory between different levels of cache in a multi-processor system. It is a situation where multiple processor cores share the same memory hierarchy, but have their own L1 data and instruction caches. 

Essentially, I was creating a 2D array in the following order [x][y]. This means I was scanning the image vertically. By changing to horizontal scanning, the data is stored closer together in memory, so there are less cache misses between different levels of cache and thus performance is faster, so it is better to scan pixels in the index they are stored. Every processor also has a very fast increment instruction for integers. It’s typically not as fast for “Increment by some amount and multiply by the second amount”. By scanning the 2D array [y][x], I optimized for cache coherency and this led to about 15% increase in efficiency. From 400-500mb to 300-400mb. In addition, I noticed visually the image was filling in much better than before. 

While this was a great improvement, I ultimately found it unnecessary. What I ended up doing isntead was removing the need for the double for loop that iterates over the image within the draw loop. I instead opted for randomly selecting X,Y coordinates and iterating over a preselected amount in a single loop. This was marginally more memory effecient without any changes to the produced effect. While these techniques were both great improvements, the next optimization was significantly better. 

After a lot of research into image processig optimization, I found that a QuadTree data structure to be the answer to my massive array issue. This optimization led to a 10x performance improvement and dropped memory usage down from 300-400mb to 20-40mb as it allowed me to not need the thinning algorithm or 2D array at all, which was taking up the bulk of memory. A QuadTree is a tree-like data structure in which each node has exactly 0 or 4 children. They are used for partitioning two dimensional space. Common uses are image compression algorithms or for querying geolocation data. Uber, for example, uses a quadtree server to match drivers and riders using Google S2. Essentially, what the quadtree does is let you know which points are near a specified coordinate without needing to check every coordinate on a plane. Since I need to know which pixels are near a selected coordinate when drawing the image in order to thin out the number of points placed, the quadtree allows me to do this very quickly. As opposed to using a massive 2D array, I can use the quadtree to query coordinate data where the effect being placed intersects with the tree.

![plot](quadtree-visual.png)

**Side Note On Shaders:**

This isn't quite related to the core algorithm being discussed in this repo, but is instead something that came about in my optimization efforts and is related to a sister program I created using shaders. In researching image processing and generative art optimization techniques, I kept coming across shaders as a solution to limitatiosn any object oriented programming language had when coding computer graphics. Of course, each suggestion had a disclaimer that shaders were extremely difficult. 

Shaders can be displayed in a WEBGL environment and are written in a low-level GPU language, GLSL. The logic is completely different than any sort of image processing done in javascript. As opposed to working sequentially–grabbing one pixel at a time–shaders allow you access the entire pixel matrix simultaneously using the power of the GPU. They are extremely powerful, but this is also what makes them so difficult– it's pure matrix math. As a side note, there are two kinds of shaders– vertex and fragment. I specifically have expiremented with fragment shaders and have only used boilerplate for the vertex shaders. 

While trying to optimize my core algorithm, I got side tracked by shaders thinking I could possibly create a new, faster version of my algorithm with them. I didn't really know where to begin, so I started by reading *The Book of Shaders* and by following a basic guide to recreate the hugo elias water ripple algorithm. The water ripple algorithm is similar to the algorithm I have been creating in that it requires reading current and previous pixel information to calculate the offset between the state of the pixels. I could start by simply plotting points in the canvas, and then pass previous and current pixel information by capturing the entire state of the canvas as as buffer and passing it into the shader, this creates a pattern where a shader is essentially being passed into itself. 

While I managed to get the Hugo Elias water ripple algorithm to work, I wasn't really sure how I could translate a shader into the 1000 Chickens algorithm, so I instead experimented with other effects I could create. My first attempt at doing something on my own was to try and combine the water ripple algorithm with my chicken doodles using a custom masking effect to make my chickens look like water droplets. The experiments here helped me better wrap my head around shaders and in a lot of ways found them to be somewhat similar to photoshopping an image. To acheive a masking effect, I played around with both applying the logic of the hugo elias algorithm to incorporate pixel coordinate values from the chicken doodles and also by experimenting by substracting the color values of my chicken doodles from the results of the water ripple algorithm. 

*Those experiments resulted in this.* <br />
![video-shader](/output%20images/shader-sample.gif)

I've since taken this shader and combined it yet again with another existing shader technique. I found a nifty article on creating a quadtree in a shader using a probabilistic method. Generally, quadtrees are constructed recursively but this isn't possible using a shader. Instead, you can pretile an image in the shader, and then use the variance of colors at the center of the tile to determine whether or not the shader should be subdivided. You would then repeat this process for a preselected number of iterations. Essentially, I used a probabilistic quadtree algorithm to create quadtree tiling on an image. I then adapted logic to tile an image with sprites in a shader to fit my chicken doodles into the squares of the quadtree. Finally, I tried adapting the logic of the hugo elias water ripple algorithm to use the center of the quadtree tiles as opposed to random points being generated on javascript canvas side. The result is a very watery quadtree effect. See the next section for an example.

Although experiments have so far been fairly derivative, its been great proucing novel effects with unique implementations and also seeing how ligthning fast a shader can be.  

**Further Optimizations for Hosting:**

I wrote the previous section because my experiments with WEBGL and shaders essentially lead to further optimizations of my this repos primary algorithm. I reached a point where I thought I couldn't find a way to further optimize my algorithm as I thought my limitations was the language itself. I also wasn't sure if my algorithm would be hostable and settled on just featuring my shader program in an eventual site for my creative work. However, when trying to create a canvas based UI around my sketches in React/Next with P5js, I found that the p5js bundle size itself was a great hinderance to the speed of the algorithm. This forced me to take a step back and really reconsider the direction of both my algorithm and the site I was creating. As a result, I decided to do a deep dive on creative frameworks and found that the majority of them aren't really built for hosting:

* P5JS - Built for ease of use for artists and for new programmers to learn on. Bundle size is not optimized for hosting and cannot be tree-shaken, even with the minified version. 
* Processing - Extremely fast but is Java based and cannot be hosted.
* OpenFrameworks - C++ creative framework, very fast, and can be hosted via websockets. However, it seems like hosting can be quite challening and the learning curve seemed pretty steep since I'm not very familiar with programming in C++ 
* Three.js/Pixi.js/Other JS frameworks - Other creative JS frameworks seem to work well and are designed for hosting, but I haven't discovered a framework specifically for artists. These frameworks seem more oriented towards specific use cases and the limitations made it difficult to acheive the effect I was going for (ThreeJS for 3D Shaders or Pixi JS for creating games).

It really seems like there isn't a perfect framework or solution for serious artist-programmers to easily create hostable work. There seemed to be some promising work being done to create a framework in Rust, but the amount of support the project was receiving seemed minimal and I was also concerned about the learning curve. I ultimately decided the best course of action would be to go bare-metal and recreate the effects I needed in vanilla JS. To my surprise, the speed boost and decrease in memory usage was pretty substantial. My algorithm went from using around 20-40mb of memory to 8-13mb of memory. I then recreated the algorithm again in React with Typescript as well (My expirements with glsl inspired me to try going the type safe route). I don't quite have all the additional features and effects like facial detections, but I am overall quite excited the updates to my algorithm now that I don't have to worry about heavy bundle sizes.

*The following sample was generated with plain Vanilla JS. Notice the differences compared to the p5js examples?* <br />
![image-gen](/output%20images/hasib-vanilla.png)<br />

*This a sample gif showing off the prototype of my new site for hosting my creative work. With the optimizations I've acheived for my creative algorithms, I've actually been able to combine both the 1000 Chickens algorithm with the new shader by layering them on top of one another in react. In addition, the canvas based UI uses an interesting technique that rasterizes the DOM into a PNG and imports it into the canvas. This allows me to acheive a greater degree of accessibility with the canvas. For example, I can control the contrast of my sketches using shaders to meet AA Web Accessibility Standards. I've experimented with layered UIs in the past, but this solution references the following technique and has been adapted for my specific use case and choice of frameworks: https://annekagoss.medium.com/accessible-webgl-43d15f9caa21* <br />
![video-shader](/output%20images/homepage-sample.gif)<br />

*The way this shader is set up and how the water ripple algorithm works, each frame of the shader is passed back into itself. Interesting things happen when I set up the canvas to manually drop frames at the click of a button* <br />
![image-gen](/output%20images/hasibshader.PNG)<br />

## Concluding Thoughts

This journey of creating and optimizing a creative algorithm has been incredible for my learning and understanding of both computer science and the software developmet process. It's helped me become comfortable with ambiguity while also trying to be realistic in my goals. I've teckled challenging optimization issues, and in the process have become comfortable finding unique solutions and being more language agnostic when trying to acheive specific outcomes. Feel free to check out the journal.md to see my thoughts and optimizations in a more detailed, free flow state. 

I started this early on in my programming journey and am still in the process of building and improving. Next step is getting my algorithms live!

## Additional Examples

*Sketch Only: My initial goal before this algorithm involved my doodles was having the algorithm create sketches. The algorithm could still use fine tuning for sketches specifically, however, since I've moved on to focusing on different effects, it hasn't been my main focus.* <br />
![image-sketch](/output%20images/murakami-sketch-gen.png)

*This version incorporates facial recognition. This version uses facemesh api from ML5/Tensorflow. I use an algorithm to check whether a point exists inisde of the mesh, and from there I check to see which point on the facemesh is closest to the current pixel I am on. I map the z-value of the closest point to a value that will scale the size of the effect down on the face. Making it more detailed and capturing some of the contours* <br />
![image-gen](/output%20images/facemesh-adeeb.png)

*This a sample gif of an image being generated. This is sped up and is using the original version of the algorithm where I generate the layers one at a time. The current iteration can have the layers generate all at once* <br />
![video-gen](/output%20images/sample-gen.gif)


## Credits 
Although produced through pure experimentation, this algorithm includes a combination of methods inspired by a community of creative developers. The images used in and produced from the algorithm are my own personal copyright. The algo isn't for release and is not hosted yet. I am currently using the algorithm and images produced for creating works related to my art practice. Please contact me if interested in learning more about the algo or if you'd like to see it in action. <br />
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
→ Probabilist Quadtree algorithm originally by Ciphrd, implemented with minor edits to optimize and adapt to my use case: https://ciphrd.com/2020/04/02/building-a-quadtree-filter-in-glsl-using-a-probabilistic-approach/ <br />
→ Hugo Elias water ripple algorithm: https://web.archive.org/web/20160418004149/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm  <br />





 


