
// this shader technique is inspired by this old medium article to create image filters similar to how they would be done in photoshop
// https://medium.com/@little_cake_yl/explore-instagram-like-filters-with-photoshop-and-opengl-es-shaders-957624924ac1
export const filterFragment: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  varying vec2 vTexCoord;
  uniform vec2 res;

  // use two copies of the same image and blend them to create filters
  uniform sampler2D img0; 
  uniform sampler2D img1;

  // use to edit and create filters
  uniform float br;
  uniform float con;
  uniform float sat;
  uniform float red;
  uniform float green;
  uniform float blue;
  uniform float strength;

  // formula for finding the luminance https://www.w3.org/TR/WCAG20-TECHS/G18.html#G18-tests
  const vec3 W = vec3(0.2126, 0.7152, 0.0722); 

  // as oppposed to adjusting levels/curves directly like in photoshop 
  // we can take a simpler method of adjusting the brightness, contrast, and saturation of the image
  vec3 levels(vec3 color, float brightness, float contrast, float saturation) {
    vec3 black = vec3(0.0);
    vec3 mid = vec3(0.5);
    float lum = dot(color, W); //luminance
    vec3 gray = vec3(lum, lum, lum);

    vec3 brightCol = mix(black, color, brightness);
    vec3 contrastCol = mix(mid, brightCol, contrast);
    vec3 saturatCol = mix(gray, contrastCol, saturation);

    return saturatCol;
  }

  // overlay is a combination of multiply and screen, it darkens the darker parts of an image and brightens the lighter parts
  vec3 overlay(vec3 color, vec3 filter) {
    vec3 result;
    float lum = dot(filter, W);

    if (lum < 0.5) result = 2.0 * filter * color;
    else result = 1.0 - (1.0-(2.0*(filter-0.5)))*(1.0-color);

    return result;
  }
  
  void main() {
    vec2 uv = vTexCoord;
    vec3 rgb = texture2D(img0, uv).rgb;
    vec3 filter = texture2D(img1, uv).rgb;

    //adjust the brightness, contrast, and saturation levels
    float brightness = br;
    float contrast = con;
    float saturation = sat;
    vec3 bcs = levels(rgb, brightness, contrast, saturation);

    //tint
    vec3 tint = vec3(bcs.r*red, bcs.g*green, bcs.b*blue);

    //add filter
    vec3 result = mix(tint, overlay(tint, filter), strength);


    gl_FragColor = vec4(result, 1.0);
  }
`