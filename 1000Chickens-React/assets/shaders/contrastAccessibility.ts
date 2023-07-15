// This shader is based on the following article, https://annekagoss.medium.com/accessible-webgl-43d15f9caa21
// We want to adjust the contrast ratios to meet web content accesibility guidelines. 
// I have found that adjusting the contrast according to the HSV color space works best for my sketches
// In addition, I've implemented sharpening to try and save the quality on lower resolution sketches (for perfomance purposes)
export const contrastFragment: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 vTexCoord;
  uniform vec2 res;
  uniform vec2 mouse;

  uniform float time;
  uniform float hover;
  uniform float isPressing;

  // our texture coming from p5
  uniform sampler2D uiBackground;
  uniform sampler2D uiForeground;

  #define light 0.05
  #define dark 0.2
  
  //rgb color conversions
  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }
  
  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }
  
  // formula for finding the luminance for normalized, gamma-corrected colors https://www.w3.org/TR/WCAG20-TECHS/G18.html#G18-tests
  float gammaCorrection(float colorChannel) {
    if (colorChannel <= 0.03928) return colorChannel / 1.055;
    else return pow((colorChannel + 0.055) / 1.055, 2.4);
  }

  // based on math to find luminance
  float W3Luminance(vec3 rgb) {
    float r = gammaCorrection(rgb.r);
    float g = gammaCorrection(rgb.g);
    float b = gammaCorrection(rgb.b);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b; 
  }
  
  // check if we need to adjust the colors or not
  bool lightenBackground(float bgl, float fgl) {
    if (fgl == bgl) return bgl < 0.5;
    else return bgl > fgl;
  }
  
  // if we need to adjust the pixel colors, find a luminance that would result in our contrat target ratio
  float newLuminance(float fgl, float target, bool up) {
    if (up) return (target * (fgl + 0.075)) + 0.05;
    else return ((fgl + 0.05 - (target * 0.05)) / target);
  }
  
  vec3 shiftHSV(vec3 bg, float fgl, float targetRatio) {
    vec3 bghsv = rgb2hsv(bg);
    bool up = lightenBackground(bghsv.z, fgl);
    float newLum = newLuminance(fgl, targetRatio, up);
    bghsv.z = up ? max(bghsv.z, newLum + light) : min(bghsv.z, newLum + dark);
    vec3 rgb = hsv2rgb(bghsv);
    return up ? 
      vec3(
        max(bg.r, rgb.r), 
        max(bg.g, rgb.g), 
        max(bg.b, rgb.b)
      ) : vec3(
        min(bg.r, rgb.r), 
        min(bg.g, rgb.g), 
        min(bg.b, rgb.b)
      );
  }
  
  vec3 makeAccessible(vec3 bg, vec3 fg) {
    float fgl = W3Luminance(fg);
    float targetRatio = 4.5; //compliance level, 7.0 for AAA
    return shiftHSV(bg, fgl, targetRatio);
  }

  
  // from https://www.shadertoy.com/view/4tcGW2, slightly tweaked to match the luminance formula above
  // helps with performance as it allows us to use a lower resolution image while saving some of the quality
  mat3 YUVFromRGB = mat3(
    vec3(0.299,-0.14713, 0.615),
    vec3(0.587,-0.28886,-0.51499),
    vec3(0.114,0.436,-0.10001));
 
  mat3 RGBFromYUV = mat3(
    vec3(1, 1, 1),
    vec3(0.0,-0.394,2.03211),
    vec3(1.13983,-0.580,0.0));
 
  float extractLuma(vec3 c) {
    return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
  }
  
    
  void main() {
    vec2 uv = vTexCoord; 
    vec4 bg = texture2D(uiBackground, uv);
    vec4 fg = texture2D(uiForeground, uv);

    vec3 yuv = YUVFromRGB*fg.rgb;
    vec2 imgSize = vec2(res.x, res.y);
    float accumY = 0.0; 

    for(int i = -1; i <= 1; ++i) {
      for(int j = -1; j <= 1; ++j) {
        vec2 offset = vec2(i,j) / imgSize;
        
        float s = extractLuma(texture2D(uiForeground, uv + offset).rgb);
        float notCentre = min(float(i*i + j*j),1.0);
        accumY += s * (9.0 - notCentre*10.0);
      }
    }

    accumY /= 9.0;
    float gain = 0.9;
    accumY = (accumY + yuv.x)*gain;
    fg = vec4(RGBFromYUV * vec3(accumY,yuv.y,yuv.z),1.0);
    float mid = fg.r + fg.g + fg.b;

    float speed;
    float distance;
    vec4 warpedFg;

    if (uv.y > 0.2 && uv.y < 0.8) {
      speed = 0.0001;
      distance = 0.001;
      vec3 luma = vec3(0.299, 0.587, 0.114);
      //float luma = W3Luminance(bg.rgb);
      float power = dot(bg.rgb, vec3(luma));
      power = sin(3.1415927*2.0 * mod(power + time * speed, 1.0))*20.0;
      warpedFg = texture2D(uiForeground, uv+vec2(sin(power*0.5), power)*distance);
      mid = warpedFg.r + warpedFg.g + warpedFg.b;
    }
  
    float blank = mid;

    vec4 dom;
    vec3 result = makeAccessible(bg.rgb, vec3(1.0));
    float avg = result.r + result.g + result.b;

    if (avg > 0.2 && isPressing == 1.0) warpedFg*=bg;
    else if (isPressing == 1.0) warpedFg/=bg;
    else warpedFg*=bg;

    if (blank == 0.0) dom = vec4(result, 1.0);
    else if (uv.y > 0.2 && uv.y < 0.8) dom = warpedFg;
    else dom = fg;

    gl_FragColor = dom;
  }
`

// from https://www.shadertoy.com/view/4tcGW2, slightly tweaked to match the luminance formula above
// helps with performance as it allows us to use a lower resolution image while saving some of the quality (I sharpen the image twice)
export const sharpenFragment: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 vTexCoord;
  uniform vec2 res;

  // our texture coming from p5
  uniform sampler2D uiBackground;

  mat3 YUVFromRGB = mat3(
    vec3(0.299,-0.14713, 0.615),
    vec3(0.587,-0.28886,-0.51499),
    vec3(0.114,0.436,-0.10001));
 
  mat3 RGBFromYUV = mat3(
    vec3(1, 1, 1),
    vec3(0.0,-0.394,2.03211),
    vec3(1.13983,-0.580,0.0));
 
  float extractLuma(vec3 c) {
    return c.r * 0.2126 + c.g * 0.7152 + c.b * 0.0722;
  }
    
  void main() {
    vec2 uv = vTexCoord; 
    vec4 bg = texture2D(uiBackground, uv);

    vec3 yuv = YUVFromRGB*bg.rgb;
    vec2 imgSize = vec2(res.x, res.y);
    float accumY = 0.0; 

    for(int i = -1; i <= 1; ++i) {
      for(int j = -1; j <= 1; ++j) {
        vec2 offset = vec2(i,j) / imgSize;
        
        float s = extractLuma(texture2D(uiBackground, uv + offset).rgb);
        float notCentre = min(float(i*i + j*j),1.0);
        accumY += s * (9.0 - notCentre*10.0);
      }
    }

    accumY /= 9.0;
    float gain = 0.9;
    accumY = (accumY + yuv.x)*gain;
    vec4 sharp = vec4(RGBFromYUV * vec3(accumY,yuv.y,yuv.z),1.0);

    gl_FragColor = sharp;
  }
`