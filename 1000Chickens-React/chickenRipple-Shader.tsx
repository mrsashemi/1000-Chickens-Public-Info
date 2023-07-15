import React, { useEffect, useRef, useState } from "react"
import { tileFragment } from "./assets/shaders/tile";
import portrait from './assets/images/hasibwide.JPG'
import spritesheet from './assets/chickens/spritesheet.png'
import spriteJSON from './assets/chickens/spritesheet.json'
import allchickenlines from './assets/chickens/allchickenlines.png'
import Image from "next/image";
import { contrastFragment, sharpenFragment } from "./assets/shaders/contrastAccessibility";
import { vertexUniversal } from "./assets/shaders/universalVertex";
import { useDispatch, useSelector } from "react-redux";
import { getDomImage, getHovering, getInvert, getMousePos, getPressing, setCanvasSize } from "@/state/slices/canvasSlice";
import { getRandomColor, loadChickens, tint } from "./methods/effects";
import { addTexture, create2Dbuffer, createGLbuffer, prepareShader, setUniform1f, setUniform2f } from "./methods/createbuffer"




export const ChickenRipple = () => {
    const isPressing = useSelector(getPressing);
    const dispatch = useDispatch();
    const domImage = useSelector(getDomImage);
    const mousePos = useSelector(getMousePos);
    const isHovering = useSelector(getHovering);
    const isInvert = useSelector(getInvert);
    const [sketchReady, setReady] = useState(false);
    const [spriteBitMap, setSprites] = useState<ImageBitmap[] | null>(null);

    //animate
    const sketchId = useRef<number | null>(null);

    //data
    const pixels = useRef<Uint8ClampedArray | null>(null);

    //image refs
    const img = useRef<HTMLImageElement>(null);
    const sprites = useRef<HTMLImageElement>(null);
    const lines = useRef<HTMLImageElement>(null);
    const dom = useRef<HTMLImageElement>(null);

    //canvas and buffers
    const cSharpen = useRef<HTMLCanvasElement>(null);
    const cRipple = useRef<HTMLCanvasElement>(null);
    const cContrast = useRef<HTMLCanvasElement>(null);
    const cCurrent = useRef<HTMLCanvasElement>(null);
    const cPrevious = useRef<HTMLCanvasElement>(null);
    const cChickens = useRef<HTMLCanvasElement>(null);
    const cSprites = useRef<HTMLCanvasElement>(null);
    const cImg = useRef<HTMLCanvasElement>(null);

    //shaders
    const quadRipples = useRef<WebGLShader | null>(null)
    const adjustContrast = useRef<WebGLShader | null>(null)
    const sharpenResult = useRef<WebGLShader | null>(null)

    //contexts
    const glSharpen = useRef<RenderingContext | null>(null);
    const glRipple = useRef<RenderingContext | null>(null);
    const glContrast = useRef<RenderingContext | null>(null);
    const ctxCurrent = useRef<RenderingContext | null>(null);
    const ctxPrevious = useRef<RenderingContext | null>(null);
    const ctxChickens = useRef<RenderingContext | null>(null);
    const ctxSprites = useRef<RenderingContext | null>(null);
    const ctxImg = useRef<RenderingContext | null>(null);


    //Initialize Sketch
    useEffect(() => {
        const initSketch = async () => {
            let w: number = Math.floor((img.current as HTMLImageElement).width/2);
            let h: number = Math.floor((img.current as HTMLImageElement).height/2);

            glRipple.current = createGLbuffer(glRipple.current, (cRipple.current as HTMLCanvasElement), w, h);
            glContrast.current = createGLbuffer(glContrast.current, (cContrast.current as HTMLCanvasElement), w, h);
            glSharpen.current = createGLbuffer(glSharpen.current, (cSharpen.current as HTMLCanvasElement), w, h);

            ctxCurrent.current = create2Dbuffer(ctxCurrent.current, (cCurrent.current as HTMLCanvasElement), w, h, false, null);
            ctxPrevious.current = create2Dbuffer(ctxPrevious.current, (cPrevious.current as HTMLCanvasElement), w, h, false, null);
            ctxChickens.current = create2Dbuffer(ctxChickens.current, (cChickens.current as HTMLCanvasElement), w, h, false, null);
            ctxSprites.current = create2Dbuffer(ctxSprites.current, (cSprites.current as HTMLCanvasElement), 5596, 1177, true, lines.current);
            ctxImg.current = create2Dbuffer(ctxImg.current, (cImg.current as HTMLCanvasElement), w, h, true, img.current);

            quadRipples.current = prepareShader((glRipple.current as WebGL2RenderingContext), vertexUniversal, tileFragment, w, h);
            adjustContrast.current = prepareShader((glContrast.current as WebGL2RenderingContext), vertexUniversal, contrastFragment, w, h);
            sharpenResult.current = prepareShader((glSharpen.current as WebGL2RenderingContext), vertexUniversal, sharpenFragment, w, h);

            setUniform2f((glContrast.current as WebGL2RenderingContext), 'res', (adjustContrast.current as WebGLShader), w, h);
            setUniform2f((glSharpen.current as WebGL2RenderingContext), 'res', (sharpenResult.current as WebGLShader), w, h);
            setUniform2f((glRipple.current as WebGL2RenderingContext), 'res', (quadRipples.current as WebGLShader), w, h);
            setUniform2f((glRipple.current as WebGL2RenderingContext), 'pix', (quadRipples.current as WebGLShader), 1/w, 1/h);
            setUniform1f((glRipple.current as WebGL2RenderingContext), 'doodleX', (quadRipples.current as WebGLShader), 20.0);
            setUniform1f((glRipple.current as WebGL2RenderingContext), 'doodleY', (quadRipples.current as WebGLShader), 4.0);
            setUniform1f((glRipple.current as WebGL2RenderingContext), 'damping', (quadRipples.current as WebGLShader), 0.98);
            addTexture((glRipple.current as WebGL2RenderingContext), (glRipple.current as WebGL2RenderingContext).TEXTURE1, (cSprites.current as HTMLCanvasElement), (quadRipples.current as HTMLImageElement), 1, 'doodleTiles')
            addTexture((glRipple.current as WebGL2RenderingContext), (glRipple.current as WebGL2RenderingContext).TEXTURE2, (img.current as HTMLImageElement), (quadRipples.current as HTMLImageElement), 2, 'imageTexture');

            const colorData = (ctxImg.current as CanvasRenderingContext2D).getImageData(0, 0, w, h).data;
            pixels.current = colorData;

            const tempSprites = await loadChickens((sprites.current as HTMLImageElement), spriteJSON);
            setSprites(tempSprites.lines);
            dispatch(setCanvasSize([w, h]));
            setReady(true);

            console.log(spriteBitMap);
        }
        initSketch();
    }, [])


    function sketch(now: any) {
        sketchId.current = requestAnimationFrame(sketch);

        if (spriteBitMap) {
            let randX: number = Math.floor(Math.random()*(cRipple.current as HTMLCanvasElement).width);
            let randY: number = Math.floor(Math.random()*(cRipple.current as HTMLCanvasElement).height);

        
            let randArr: (number[] | number)[] = getRandomColor(randX, randY, (cRipple.current as HTMLCanvasElement).width, (pixels.current as Uint8ClampedArray));
            let chkn = Math.floor(Math.random()*2);
    
            //lines and tinted are the same
            const tinted = tint(spriteBitMap[chkn], (randArr[0] as number[]));
            (ctxChickens.current as CanvasRenderingContext2D).drawImage(tinted, randX, randY, 50, 50);
            if (mousePos) (ctxChickens.current as CanvasRenderingContext2D).drawImage(tinted, mousePos[0], mousePos[1], 20, 20);
        }

        (ctxPrevious.current as CanvasRenderingContext2D).drawImage((cCurrent.current as HTMLCanvasElement), 0, 0);
        (ctxCurrent.current as CanvasRenderingContext2D).drawImage((cRipple.current as HTMLCanvasElement), 0, 0);

        setUniform1f((glRipple.current as WebGL2RenderingContext), 'music', (quadRipples.current as WebGLShader), 0.0);
        setUniform1f((glRipple.current as WebGL2RenderingContext), 'randomize', (quadRipples.current as WebGLShader), 0.0);
        setUniform1f((glRipple.current as WebGL2RenderingContext), 'isPlaying', (quadRipples.current as WebGLShader), 0.0);
        setUniform1f((glRipple.current as WebGL2RenderingContext), 'invert', (quadRipples.current as WebGLShader), (isInvert) ? 1.0 : 0.0);
        setUniform1f((glRipple.current as WebGL2RenderingContext), 'time', (quadRipples.current as WebGLShader), now);
        setUniform1f((glContrast.current as WebGL2RenderingContext), 'isPressing', (adjustContrast.current as WebGLShader), (isPressing) ? 1.0 : 0.0);
        setUniform1f((glContrast.current as WebGL2RenderingContext), 'time', (adjustContrast.current as WebGLShader), now);
        setUniform1f((glContrast.current as WebGL2RenderingContext), 'hover', (adjustContrast.current as WebGLShader), (isHovering) ? 1.0 : 0.0);

        if (mousePos) setUniform2f((glRipple.current as WebGL2RenderingContext), 'mouse', (quadRipples.current as WebGLShader), mousePos[0], mousePos[1]);
        if (mousePos) setUniform2f((glContrast.current as WebGL2RenderingContext), 'mouse', (adjustContrast.current as WebGLShader), mousePos[0], mousePos[1]);
      
        // quadtree + ripple effect
        addTexture((glRipple.current as WebGL2RenderingContext), (glRipple.current as WebGL2RenderingContext).TEXTURE0, (cChickens.current as HTMLCanvasElement), (quadRipples.current as WebGLShader), 0, 'chick');
        addTexture((glRipple.current as WebGL2RenderingContext),  (glRipple.current as WebGL2RenderingContext).TEXTURE3, (cCurrent.current as HTMLCanvasElement), (quadRipples.current as WebGLShader), 3, 'currBuff');
        addTexture((glRipple.current as WebGL2RenderingContext), (glRipple.current as WebGL2RenderingContext).TEXTURE4, (cPrevious.current as HTMLCanvasElement), (quadRipples.current as WebGLShader), 4, 'prevBuff');
        (glRipple.current as WebGL2RenderingContext).drawArrays((glRipple.current as WebGL2RenderingContext).TRIANGLE_STRIP, 0, 4); // Draw the quad
        
        // adjust contrast for accessibility
        addTexture((glContrast.current as WebGL2RenderingContext), (glContrast.current as WebGL2RenderingContext).TEXTURE0, (cRipple.current as HTMLCanvasElement), (adjustContrast.current as WebGLShader), 0, 'uiBackground');
        addTexture((glContrast.current as WebGL2RenderingContext), (glContrast.current as WebGL2RenderingContext).TEXTURE1, (dom.current as HTMLImageElement), (adjustContrast.current as WebGLShader), 1, 'uiForeground');
        (glContrast.current as WebGL2RenderingContext).drawArrays((glContrast.current as WebGL2RenderingContext).TRIANGLE_STRIP, 0, 4); // Draw the quad

        // sharpen
        addTexture((glSharpen.current as WebGL2RenderingContext), (glSharpen.current as WebGL2RenderingContext).TEXTURE0, (cContrast.current as HTMLCanvasElement), (sharpenResult.current as WebGLShader), 0, 'uiBackground');
        (glSharpen.current as WebGL2RenderingContext).drawArrays((glSharpen.current as WebGL2RenderingContext).TRIANGLE_STRIP, 0, 4); // Draw the quad

        if (Math.floor(now/1000) % 5 === 0) (ctxChickens.current as CanvasRenderingContext2D).clearRect(0, 0, (cRipple.current as HTMLCanvasElement).width, (cRipple.current as HTMLCanvasElement).height);
        if (isPressing) (ctxCurrent.current as CanvasRenderingContext2D).clearRect(0, 0, (cRipple.current as HTMLCanvasElement).width, (cRipple.current as HTMLCanvasElement).height);
    }


    useEffect(() => {
        if (sketchReady) sketch(performance.now);
        return () => {
            cancelAnimationFrame(sketchId.current as number);
        }
    }, [sketch, sketchReady])


    return (
        <React.Fragment>
            <canvas ref={cSharpen} className="absolute inset-0 w-full h-full overflow-hidden z-10"/>
            <canvas ref={cContrast} className="invisible"/>
            <canvas ref={cRipple} className="invisible"/>
            <canvas ref={cCurrent} className="invisible"/>
            <canvas ref={cPrevious} className="invisible"/>
            <canvas ref={cChickens} className="invisible"/>
            <canvas ref={cSprites} className="invisible"/>
            <canvas ref={cImg} className="invisible"/>
            <Image src={portrait}  alt="Portrait of Hasib" className="hidden" ref={img} priority/>
            <Image src={spritesheet} alt="all sprites" className="hidden" ref={sprites} priority unoptimized/>
            <Image src={allchickenlines} alt="line sprites" className="hidden" ref={lines} priority unoptimized/>
            <img src={(domImage as string)} alt="rasterized DOM" className="hidden" ref={dom} />
        </React.Fragment>
    )
}

