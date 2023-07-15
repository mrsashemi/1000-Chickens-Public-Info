export const tileFragment: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  // grab texcoords from vert shader
  varying vec2 vTexCoord;
  uniform vec2 res;
  uniform vec2 mouse;
  uniform vec2 pix;

  // for water ripples and other effects
  uniform float time;
  uniform float damping;
  uniform float music;
  uniform float doodleX;
  uniform float doodleY;

  // for mouse and music effects
  uniform float invert;
  uniform float isPlaying;
  uniform float randomize;

  // our texture coming from p5
  uniform sampler2D imageTexture;
  uniform sampler2D doodleTiles;
  uniform sampler2D currBuff;
  uniform sampler2D prevBuff;
  uniform sampler2D chick;

  // the number of divisions at the start
  #define divisions 6.0

  // the numer of possible quad divisions
  #define iterations 4

  // the number of samples picked fter each quad division
  #define varianceSamples 5

  // threshold min, max given the mouse.x
  #define minVariance 0.0001
  #define maxVariance 0.005


  // commonly used hashing function to generate random coordinates http://glslsandbox.com/e#41197.0
  vec2 hash2D(vec2 p) { 
      float n = sin(dot(p, vec2(41, 289)));
      return fract(vec2(262144, 32768)*n);    
  }

  // another common hashing function to generate a random number used for creating a random index from which we can tile the doodles
  float hash(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
  }


  // Computes the variance of colors surrounding the center of a given quad, used to tile the image based on how detailed specific areas are
  // Original Probabilstic QuadTree Algorithm by Ciphrd. Algo explanation here: https://ciphrd.com/2020/04/02/building-a-quadtree-filter-in-glsl-using-a-probabilistic-approach/
  // I've simplified the variance formula as much as possible so it is computed in a single pass
  float constructQuadTree (vec2 center, float size) {    
    vec3 avg = vec3(0); // mean
    vec3 var = vec3(0); // variance

    for (int i = 0; i < varianceSamples; i++) {
        
        // use a hashing function to pick a random 2d point using the center of the active quad as input and subtracting by 0.5 to ensure it is in the active tile
        vec2 randomPoint = hash2D(center.xy + vec2(float(i), 0.0)) - 0.5;
        vec3 newSample = texture2D(imageTexture, center + randomPoint * size).rgb;
        avg += newSample;

        // estimate the color variation on the active quad by computing the variance, it is quickest to do so in one pass
        var += newSample*newSample;
    }
    

    avg /= float(varianceSamples);
    var /= float(varianceSamples);
    var -= avg*avg;
        
    return (var.x+var.y+var.z)/3.0;
  }

  // use the following in place of conditionals to avoid branching (marginal performance improvement compared to if/else *needs testing*)
  float when_eq(float x, float y) {
    return 1.0 - abs(sign(x - y));
  }

  float when_lt(float x, float y) {
    return max(sign(y - x), 0.0);
  }

  float when_gt(float x, float y) {
    return max(sign(x - y), 0.0);
  }

  float when_neq(float x, float y) {
    return abs(sign(x - y));
  }


  void main() {
    vec2 uv = vTexCoord; 

    // some experimenting for adding a music visualization layer
    vec2 p = (uv-0.5);
    p.x*=res.x/res.y;
    mat2 rot = mat2(cos(time*0.075), sin(time*0.075), -sin(music*0.075), cos(music*0.075));
    p+=sin(music*60.0)*0.005;
    p+=cos(uv.y*time/160.0)*music;
    float len = length(p);
    p*=rot;

    float wave = 0.0;

    p+=(p*rot-p)*when_eq(randomize, 1.0);
    p+=(1.2*abs(p)-1.0-p)*when_eq(randomize, 1.0); 
    wave+=min(1000.0,abs(dot(p,p)-sin(time*60.0+len*20.0)*0.015-0.15))*when_eq(isPlaying, 1.0);

    float varianceThreshold = mix(minVariance, maxVariance, wave+mouse.x/res.x);

    // number of space divisions
    float divs = divisions;

    // the center of the active quad - we initialze with 2 divisions
    vec2 center = (floor(uv * divs) + 0.5) / divs;
    float quadTileSize = 1.0 / divs; // the length of a side of the active quad
    
    // we store average and variance here
    float quadColorVariance = 0.0;
    
    for (int i = 0; i < iterations; i++) {
      quadColorVariance = constructQuadTree(center, quadTileSize);
        
      // if the variance is lower than the varianceThreshold, current quad is outputted (divide == 0)
      float divide = when_lt(varianceThreshold, quadColorVariance);

      // otherwise we divide again (divide == 1)
      divs+=divs*divide;
      center+=(((floor(uv*divs)+0.5)/divs)-center)*divide;
      quadTileSize+=(-0.5*quadTileSize)*divide;
    }
    
    // the coordinates of the quad
    vec2 uvQuad = fract(uv * divs);
    vec3 color = texture2D(imageTexture, uv).rgb;
    vec4 chicks = texture2D(chick, uv);
    float randomIndex = hash(center);

    color+=((1.0-2.0*color)/(1.0-color))*(1.0-color)*when_eq(invert, 1.0);

    //the following are forumlas to tile an image into a grid. I've adapted it to use the center coordinates of the quadtree tiles as opposed to a preexisting grid
    // seperate the chicken image into seperate doodles
    float doodleIndex = floor(randomIndex/4.0 * doodleX * doodleY);
    float xDoodleIndex = mod(doodleIndex, doodleX);
    float yDoodleIndex = 1.0 - floor(doodleIndex / doodleX) - 1.0;
    
    // map the doodle doodle coordinates to the quadtree doodle  
    vec2 doodle_uv = vec2((xDoodleIndex + uvQuad.x) / doodleX, 1.0 - (yDoodleIndex + uvQuad.y) / doodleY);

    // load the doodle tile texture color at the current fragment's coordinate
    vec4 tileColor = texture2D(doodleTiles, doodle_uv);

    // load previous states
    vec3 prev = texture2D(prevBuff, uv).rgb;

    // Get neigboring states and experiment to see what happens when only loading state from the center of quadtree subdivisions
    // results in interesting tie-dye/watercolor/bleeding effect
    vec2 visualize = uv;
    visualize+=(center-visualize)*when_eq(randomize, 1.0);

    vec3 prevC = texture2D(prevBuff, (visualize)-vec2(wave)).rgb;
    prevC+=(prev-prevC)*when_eq(isPlaying, 0.0);

    vec3 c = texture2D(doodleTiles, center + vec2(0.0, pix.y)*0.1).rgb;
    vec3 h = texture2D(doodleTiles, center - vec2(0.0, pix.y)*0.1).rgb;
    vec3 k = texture2D(doodleTiles, center + vec2(pix.x, 0.0)*0.1).rgb;
    vec3 n = texture2D(doodleTiles, center - vec2(pix.x, 0.0)*0.1).rgb;

    // vec3 cC = texture2D(chick, uv + vec2(0.0, pix.y)).rgb;
    // vec3 hC = texture2D(chick, uv - vec2(0.0, pix.y)).rgb;
    // vec3 kC = texture2D(chick, uv + vec2(pix.x, 0.0)).rgb;
    // vec3 nC = texture2D(chick, uv - vec2(pix.x, 0.0)).rgb;

    vec3 u = texture2D(currBuff, uv + vec2(0.0, pix.y)).rgb;
    vec3 l = texture2D(currBuff, uv - vec2(0.0, pix.y)).rgb;
    vec3 d = texture2D(currBuff, uv + vec2(pix.x, 0.0)).rgb;
    vec3 r = texture2D(currBuff, uv - vec2(pix.x, 0.0)).rgb;

    // hugo elias water ripple: https://web.archive.org/web/20160418004149/http://freespace.virgin.net/hugo.elias/graphics/x_water.htm
    // Incorporating some logic for the hugo elias algorithm referencing this wave equation solver, also based on hugo elias: https://www.shadertoy.com/view/4dK3Ww 
    //float amp = when_gt(0.05, fract(time));
    float amp = 0.05;
    // vec3 chickenR = ((cC+hC+kC+nC)/2.0) - prevC;
    // chickenR *= damping;
    vec3 chicken = -amp*vec3(smoothstep(2.5, 0.5, length(uv - center)));
    chicken += (quadTileSize*(c+h+k+n))-2.0*prevC-1.0; 
    chicken *= damping;
    chicken = chicken*0.5 + 0.5;
    
    vec3 nextR = ((u+d+l+r)/2.0)-prev;
    vec3 next = -amp*vec3(smoothstep(2.5, 0.5, length(center - uv)));
    next += nextR+prev-(2.0*prevC)+((u+d+l+r)/2.0)-1.0;
    next *= damping;
    next = next*0.5 + 0.5;
    next *= 1.0 - chicken; 
    vec3 rippleR = nextR * damping;                  
    //nextR *= 1.5 - chickenR*1.5;
    vec3 blotchR = nextR - chicks.rgb * damping;

    //reduce intensity of darker colors
    blotchR.rgb = max(blotchR.rgb, 0.5);
    vec3 mixedColor = mix(blotchR, rippleR, 0.98);
  
    // mixing and masking effects
    float tileCheck = tileColor.r + tileColor.g + tileColor.b;
    float chickCheck = chicks.r + chicks.g + chicks.b;
    
    color+=next*when_gt(tileCheck, 0.0);
    color+=(next*color-color)*when_eq(tileCheck, 0.0);

    vec3 mixedColor2 = mix(color, rippleR, 0.89);
    vec3 finalColor = mixedColor2;
    mixedColor.r+=(mixedColor2.r-mixedColor.r)*when_neq(chickCheck, 0.0);
    finalColor+=(mixedColor-finalColor)*when_neq(chickCheck, 0.0);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`

