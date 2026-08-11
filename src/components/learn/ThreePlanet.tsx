"use client";

import { useEffect, useRef } from "react";
import { PlanetType } from "./pythonData";

interface ThreePlanetProps {
  type: PlanetType;
  size?: number; // Canvas size in px (default 84)
  isCurrent?: boolean;
}

// 3D Color palettes per planet type
const PLANET_3D_COLORS: Record<
  PlanetType,
  {
    base: [number, number, number];
    light: [number, number, number];
    dark: [number, number, number];
    ring: [number, number, number];
    band: [number, number, number];
  }
> = {
  "green-crater": {
    base: [0.52, 0.8, 0.09], // Lime green
    light: [0.75, 0.95, 0.39],
    dark: [0.1, 0.2, 0.03],
    ring: [0.64, 0.9, 0.21],
    band: [0.25, 0.38, 0.07],
  },
  swirl: {
    base: [0.58, 0.2, 0.92], // Purple
    light: [0.85, 0.6, 0.98],
    dark: [0.18, 0.03, 0.35],
    ring: [0.75, 0.52, 0.98],
    band: [0.35, 0.11, 0.53],
  },
  "striped-banded": {
    base: [0.39, 0.45, 0.55], // Slate
    light: [0.88, 0.91, 0.94],
    dark: [0.04, 0.06, 0.1],
    ring: [0.8, 0.84, 0.88],
    band: [0.2, 0.25, 0.33],
  },
  "saturn-ring": {
    base: [0.85, 0.65, 0.25], // Gold / Amber
    light: [0.95, 0.82, 0.5],
    dark: [0.3, 0.2, 0.05],
    ring: [0.95, 0.75, 0.35],
    band: [0.45, 0.3, 0.1],
  },
  "grid-web": {
    base: [0.01, 0.52, 0.78], // Cyan / Electric blue
    light: [0.49, 0.83, 0.99],
    dark: [0.01, 0.11, 0.16],
    ring: [0.22, 0.74, 0.97],
    band: [0.01, 0.41, 0.63],
  },
  "moon-crater": {
    base: [0.86, 0.15, 0.47], // Fuchsia / Rose
    light: [0.96, 0.53, 0.75],
    dark: [0.25, 0.03, 0.13],
    ring: [0.96, 0.45, 0.71],
    band: [0.51, 0.09, 0.27],
  },
};

export default function ThreePlanet({
  type,
  size = 84,
  isCurrent = false,
}: ThreePlanetProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) return;

    // ── WebGL Shaders for 3D Sphere & 3D Saturn Ring Raytracing ──
    const vsSource = `
      attribute vec2 aPosition;
      varying vec2 vUv;
      void main() {
        vUv = aPosition * 0.5 + 0.5;
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision highp float;
      varying vec2 vUv;
      uniform vec2 uResolution;
      uniform vec2 uRotation;
      uniform vec3 uBaseColor;
      uniform vec3 uLightColor;
      uniform vec3 uDarkColor;
      uniform vec3 uRingColor;
      uniform vec3 uBandColor;

      // 3D Sphere Ray Intersection
      void main() {
        vec2 st = (gl_FragCoord.xy - 0.5 * uResolution) / min(uResolution.x, uResolution.y);
        
        // Planet Sphere radius
        float r = 0.33;
        float distSq = st.x * st.x + st.y * st.y;

        // Tilted 3D Saturn Ring test
        float angle = -0.28;
        vec2 rotSt = vec2(
          cos(angle) * st.x - sin(angle) * st.y,
          sin(angle) * st.x + cos(angle) * st.y
        );
        rotSt.y *= 2.8; // Elliptical 3D tilt

        float ringDist = length(rotSt);
        bool isRing = ringDist >= 0.38 && ringDist <= 0.52;
        bool isFrontRing = isRing && (st.y < 0.02);
        bool isBackRing = isRing && !isFrontRing;

        vec4 col = vec4(0.0);

        // 3D Back Ring (rendered behind sphere)
        if (isBackRing && distSq > r * r) {
          float ringAlpha = smoothstep(0.38, 0.40, ringDist) * (1.0 - smoothstep(0.50, 0.52, ringDist));
          col = vec4(uRingColor * 0.8, ringAlpha * 0.7);
        }

        // 3D Sphere Raytracing
        if (distSq <= r * r) {
          float z = sqrt(r * r - distSq);
          vec3 normal = normalize(vec3(st.x, st.y, z));

          // 3D Rotation transform
          float cosY = cos(uRotation.y);
          float sinY = sin(uRotation.y);
          vec3 rotNormal = vec3(
            normal.x * cosY + normal.z * sinY,
            normal.y,
            -normal.x * sinY + normal.z * cosY
          );

          // 3D Directional Light from top-left
          vec3 lightDir = normalize(vec3(0.5, 0.7, 0.8));
          float diff = max(dot(normal, lightDir), 0.0);
          
          // Specular Highlight
          vec3 viewDir = vec3(0.0, 0.0, 1.0);
          vec3 reflectDir = reflect(-lightDir, normal);
          float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);

          // Atmosphere Banding Noise Pattern
          float bandPattern = sin(rotNormal.y * 18.0 + rotNormal.x * 4.0);
          vec3 sphereColor = mix(uBaseColor, uBandColor, smoothstep(-0.3, 0.6, bandPattern));
          sphereColor = mix(uDarkColor, sphereColor, diff * 0.85 + 0.15);
          sphereColor += vec3(0.3) * spec; // Specular flare

          col = vec4(sphereColor, 1.0);
        }

        // 3D Front Ring (rendered in front of sphere)
        if (isFrontRing) {
          float ringAlpha = smoothstep(0.38, 0.40, ringDist) * (1.0 - smoothstep(0.50, 0.52, ringDist));
          vec3 ringCol = mix(uRingColor, vec3(1.0), 0.2);
          if (distSq <= r * r && col.a > 0.0) {
            // Front ring overlaying planet
            col.rgb = mix(col.rgb, ringCol, ringAlpha * 0.88);
          } else if (distSq > r * r) {
            col = vec4(ringCol, ringAlpha * 0.88);
          }
        }

        gl_FragColor = col;
      }
    `;

    // Compile Shaders
    const createShader = (glCtx: WebGLRenderingContext, type: number, src: string) => {
      const s = glCtx.createShader(type)!;
      glCtx.shaderSource(s, src);
      glCtx.compileShader(s);
      return s;
    };

    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    // Quad Buffer
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uRes = gl.getUniformLocation(program, "uResolution");
    const uRot = gl.getUniformLocation(program, "uRotation");
    const uBase = gl.getUniformLocation(program, "uBaseColor");
    const uLight = gl.getUniformLocation(program, "uLightColor");
    const uDark = gl.getUniformLocation(program, "uDarkColor");
    const uRing = gl.getUniformLocation(program, "uRingColor");
    const uBand = gl.getUniformLocation(program, "uBandColor");

    const colorConfig = PLANET_3D_COLORS[type] || PLANET_3D_COLORS["striped-banded"];

    gl.uniform2f(uRes, size, size);
    gl.uniform3fv(uBase, colorConfig.base);
    gl.uniform3fv(uLight, colorConfig.light);
    gl.uniform3fv(uDark, colorConfig.dark);
    gl.uniform3fv(uRing, colorConfig.ring);
    gl.uniform3fv(uBand, colorConfig.band);

    // ── 360° Mouse Drag Rotation State ──
    let rotY = 0.0;
    let rotX = 0.0;
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMousePos.x;
      const dy = e.clientY - prevMousePos.y;
      rotY += dx * 0.015;
      rotX += dy * 0.015;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // ── 60 FPS Animation Render Loop ──
    let animId: number;
    const render = () => {
      if (!isDragging) {
        rotY += 0.012; // Continuous 360° axial spin
      }

      gl.viewport(0, 0, size, size);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(uRot, rotY, rotX);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [type, size, isCurrent]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="cursor-grab active:cursor-grabbing select-none"
    />
  );
}
