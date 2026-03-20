import { useEffect, useRef } from 'react';

const VERTEX_SHADER = `
precision mediump float;

varying vec2 vUv;
attribute vec2 a_position;

void main() {
    vUv = a_position;
    gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 vUv;
uniform vec2 u_resolution;
uniform float u_progress;
uniform float u_time;
uniform sampler2D u_text;

float rand(vec2 n) {
    return fract(cos(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

float noise(vec2 n) {
    const vec2 d = vec2(0., 1.);
    vec2 b = floor(n), f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
    return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

float fbm(vec2 n) {
    float total = 0.0, amplitude = .4;
    for (int i = 0; i < 4; i++) {
        total += noise(n) * amplitude;
        n += n;
        amplitude *= 0.6;
    }
    return total;
}

void main() {
    vec2 uv = vUv;
    uv.x *= min(1., u_resolution.x / u_resolution.y);
    uv.y *= min(1., u_resolution.y / u_resolution.x);

    vec2 screenUv = vUv * 0.5 + 0.5;
    // Flip Y for texture coordinates
    screenUv.y = 1.0 - screenUv.y;

    float t = u_progress;

    // Sample the text texture generated via canvas
    vec4 textColor = texture2D(u_text, screenUv);
    vec3 color = textColor.rgb;

    // Background burn noise
    float main_noise = 1. - fbm(.75 * uv + 10. - vec2(.3, .9 * t));

    // Make the text turn dark/ashy right before it burns
    float paper_darkness = smoothstep(main_noise - .1, main_noise, t);
    color -= vec3(.99, .95, .99) * paper_darkness;

    // Fire colors
    vec3 fire_color = fbm(6. * uv - vec2(0., .005 * u_time)) * vec3(6., 1.4, .0);
    float show_fire = smoothstep(.4, .9, fbm(10. * uv + 2. - vec2(0., .005 * u_time)));
    show_fire += smoothstep(.7, .8, fbm(.5 * uv + 5. - vec2(0., .001 * u_time)));

    float fire_border = .02 * show_fire;
    float fire_edge = smoothstep(main_noise - fire_border, main_noise - .5 * fire_border, t);
    fire_edge *= (1. - smoothstep(main_noise - .5 * fire_border, main_noise, t));
    color += fire_color * fire_edge;

    // Fade out as it burns
    float opacity = 1. - smoothstep(main_noise - .0005, main_noise, t);

    // Only render pixels that are part of the text mask (textColor.a) 
    // Wait, the original shader burned the whole screen (paper). 
    // But we only want to burn the text, or the text is white on black?
    // Let's use the text's alpha or color to mask it if we want it floating, 
    // or just let it burn the whole black screen and fade out to reveal the Prism below.
    // The provided shader sets opacity based on the burn, so the whole canvas fades out.
    gl_FragColor = vec4(color, opacity);
}
`;

interface FireOverlayProps {
    onComplete?: () => void;
}

export default function FireOverlay({ onComplete }: FireOverlayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;

        const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl") as WebGLRenderingContext | null;
        if (!gl) {
            console.error("WebGL not supported");
            return;
        }
        glRef.current = gl;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        let startTime = performance.now();
        let animationProgress = 0.0; // Start at 0
        let reqId: number;
        let isComplete = false;

        // 1. Compile Shaders
        const compileShader = (type: number, source: string) => {
            const shader = gl.createShader(type);
            if (!shader) return null;
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("Shader compile error:", gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }
            return shader;
        };

        const vShader = compileShader(gl.VERTEX_SHADER, VERTEX_SHADER);
        const fShader = compileShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vShader || !fShader) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program));
            return;
        }

        // 2. Setup Uniforms & Attributes
        const uniforms = {
            u_resolution: gl.getUniformLocation(program, "u_resolution"),
            u_time: gl.getUniformLocation(program, "u_time"),
            u_progress: gl.getUniformLocation(program, "u_progress"),
            u_text: gl.getUniformLocation(program, "u_text"),
        };

        const vertices = new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1
        ]);

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(program);

        const posLoc = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(posLoc);
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        // 3. Create Text Texture
        let textTexture: WebGLTexture | null = null;
        const createTextTexture = () => {
            const textCanvas = document.createElement("canvas");
            // High resolution for crisp text
            textCanvas.width = 2048;
            textCanvas.height = 1024;
            const ctx = textCanvas.getContext("2d");
            if (!ctx) return;

            // Background - Black (transparent base when burning)
            // If background is black, it acts as the "paper" that burns away
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

            // Draw Text - White
            ctx.fillStyle = "white";
            // Use an elegant serif font for the word 'WORRIES'
            ctx.font = "italic 400 240px 'Times New Roman', Times, serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.letterSpacing = "20px";
            ctx.fillText("WORRIES", textCanvas.width / 2, textCanvas.height / 2);

            textTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, textTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

            gl.clearColor(0.0, 0.0, 0.0, 0.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        };
        createTextTexture();

        // 4. Resize Canvas
        const resize = () => {
            if (!canvasEl) return;
            canvasEl.width = window.innerWidth * dpr;
            canvasEl.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvasEl.width, canvasEl.height);
            gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
        };
        window.addEventListener("resize", resize);
        resize();

        // 5. Render Loop
        const easeInOut = (t: number) => {
            return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        };

        // Disable scrolling while animation is running
        document.body.style.overflow = "hidden";

        const render = () => {
            const currentTime = performance.now();

            // Start the burn immediately, burn for 4.5 seconds
            const delay = 0;
            const burnDuration = 4500;

            if (currentTime > startTime + delay) {
                const elapsed = (currentTime - (startTime + delay)) / burnDuration;

                if (elapsed <= 1.2) { // Let it run a bit past 1 to ensure full burn
                    // Start from 0 to 1
                    animationProgress = Math.min(1.0, easeInOut(elapsed));
                } else {
                    isComplete = true;
                }
            }

            if (isComplete) {
                // Remove pointer events so user can click underlying items
                if (canvasEl.style) {
                    canvasEl.style.display = "none";
                }
                // Restore scrolling
                document.body.style.overflow = "";

                if (onComplete) {
                    onComplete();
                }
                return;
            }

            gl.uniform1f(uniforms.u_time, currentTime);
            gl.uniform1f(uniforms.u_progress, animationProgress);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, textTexture);
            gl.uniform1i(uniforms.u_text, 0);

            // Ensure alpha blending is on so the burnt-away areas are transparent
            gl.enable(gl.BLEND);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            reqId = requestAnimationFrame(render);
        };
        reqId = requestAnimationFrame(render);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(reqId);
            if (program) gl.deleteProgram(program);
            if (vShader) gl.deleteShader(vShader);
            if (fShader) gl.deleteShader(fShader);
            if (vbo) gl.deleteBuffer(vbo);
            if (textTexture) gl.deleteTexture(textTexture);
            // Ensure scroll is restored if unmounted early
            document.body.style.overflow = "";
        };
    }, []);

    return (
        <canvas
            id="fire-overlay"
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-screen z-50 pointer-events-none"
        />
    );
}
