// Interleaved data buffer (X,Y: vertex coordinates, U,V: texture coordinates)
const verticesTexCoords = new Float32Array([
    -1.0, 1.0,  0.0, 1.0,
    -1.0, -1.0, 0.0, 0.0,
    1.0,  1.0,  1.0, 1.0,
    1.0,  -1.0, 1.0, 0.0,
]);

const FSIZE = verticesTexCoords.BYTES_PER_ELEMENT; // bytes per float (4)

export const prepareShader = (gl: WebGL2RenderingContext, vertex: string, fragment: string, w: number, h: number) => {
    const program: WebGLShader | null = compile(gl, vertex, fragment);

    // Create the buffer object
    const vertexTexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    // Use every 1st and 2nd float for position
    const position = gl.getAttribLocation((program as WebGLShader), 'aPosition');
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    gl.enableVertexAttribArray(position);

     // Use every 3rd and 4th float for texCoord
    const texCoord = gl.getAttribLocation((program as WebGLShader), 'aTexCoord');
    gl.vertexAttribPointer(texCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(texCoord);

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);  // Flip the image's y axis
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    gl.disable(gl.DEPTH_TEST);
    gl.clearColor(0.0,0.0,0.0,0.0);
    gl.viewport(0,0,w, h);

    return program;
}

// Compile a WebGL program from a vertex shader and a fragment shader
export const compile = (gl: WebGL2RenderingContext, vshader: string, fshader: string) => {
    // Compile vertex shader
    const vs: WebGLShader | null = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource((vs as WebGLShader), vshader);
    gl.compileShader((vs as WebGLShader));

    // Compile fragment shader
    const fs: WebGLShader | null = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource((fs as WebGLShader), fshader);
    gl.compileShader((fs as WebGLShader));

    // Create and launch the WebGL program
    const program: WebGLShader | null = gl.createProgram();
    gl.attachShader((program as WebGLShader), (vs as WebGLShader));
    gl.attachShader((program as WebGLShader), (fs as WebGLShader));
    gl.linkProgram((program as WebGLShader));
    gl.useProgram(program);

    // Log errors (optional)
    console.log('vertex shader:', gl.getShaderInfoLog((vs as WebGLShader)) || 'OK');
    console.log('fragment shader:', gl.getShaderInfoLog((fs as WebGLShader)) || 'OK');
    console.log('program:', gl.getProgramInfoLog((program as WebGLShader)) || 'OK');

    return program;
}

export const createGLbuffer = (gl: RenderingContext | null, canvas: HTMLCanvasElement, w: number, h: number) => {
    gl = canvas.getContext('webgl2', {
        alpha: true,
        antialias: true,
        depth: true,
        stencil: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        perPixelLighting: true,
        version: 2
    });

    canvas.width = w;
    canvas.height = h;
    
    return gl;
}

export const addTexture = (gl: WebGL2RenderingContext, TEXTURE: number, bufferImg: HTMLCanvasElement | HTMLImageElement, program: WebGLShader, num: number, location: string) => {
    const texture = gl.createTexture();
    gl.activeTexture(TEXTURE);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, bufferImg);
    const buffer = gl.getUniformLocation(program, location);
    gl.uniform1i(buffer, num);
}


export const setUniform2f = (gl: WebGL2RenderingContext, location: string, program: WebGLShader, w: number, h: number) => {
    const uniform = gl.getUniformLocation(program, location);
    gl.uniform2f(uniform, w, h);
}

export const setUniform1f = (gl: WebGL2RenderingContext, location: string, program: WebGLShader, w: number) => {
    const uniform = gl.getUniformLocation(program, location);
    gl.uniform1f(uniform, w);
}

export const create2Dbuffer = (ctx: RenderingContext | null, canvas: HTMLCanvasElement, w: number, h: number, preDraw: boolean, img: HTMLImageElement | null) => {
    ctx = canvas.getContext('2d', {
        willReadFrequently: true,
        alpha: true
    });

    canvas.width = w;
    canvas.height = h;

    if (preDraw) (ctx as CanvasRenderingContext2D).drawImage((img as HTMLImageElement), 0, 0, w, h);

    return ctx;
}
