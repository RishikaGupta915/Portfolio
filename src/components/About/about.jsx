'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import DraggableWindow from '../Dragable/dragable';

const ABOUT_POINTS = [
  'Hey, I’m Rishika Gupta',
  'Pursuing my BCA at VIT Vellore.',
  'Currently focused on developing projects across development, AI experimentation and cybersecurity fields which enhance my professional growth and curiosity.',
  'I stay focused on maintaining strong grades while pursuing creative hobbies.',
  'In my free time, I enjoy doing MUNs and debates, singing and hanging out.',
  'I love connecting with new people & open to cool opportunities!!',
];

export default function AboutMe({ onClose }) {
  const [index, setIndex] = useState(0);
  const length = ABOUT_POINTS.length;

  const displayedIndexRef = useRef(index);
  const targetIndexRef = useRef(index);

  const lerp = useCallback((a, b, t) => a + (b - a) * t, []);

  useEffect(() => {
    targetIndexRef.current = index;

    let raf = null;
    const tick = () => {
      displayedIndexRef.current = lerp(
        displayedIndexRef.current,
        targetIndexRef.current,
        0.14
      );
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [index]);

  const canvasRef = useRef(null);
  const glStateRef = useRef({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gl = canvas.getContext('webgl');
    if (!gl) {
      return;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const frag = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_index;
    // simple hash / noise
    float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
    float noise(vec2 p){
      vec2 i=floor(p);vec2 f=fract(p);
      vec2 u=f*f*(3.0-2.0*f);
      return mix(mix(hash(i+vec2(0.0,0.0)),hash(i+vec2(1.0,0.0)),u.x),
                 mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),u.x),u.y);
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res.xy;
      uv -= 0.5;
      uv.x *= u_res.x / u_res.y;

      // moving noise
      float n = noise(uv * 6.0 + u_time * 0.12 + u_index * 0.4);

      // radial soft vignette
      float r = length(uv) * 1.25;
      // base gradient (purple -> pink -> cyan)
      vec3 col = mix(vec3(0.06,0.01,0.12), vec3(0.45,0.06,0.5), uv.y + 0.4 + 0.18 * sin(u_time * 0.6));
      col = mix(col, vec3(0.06,0.22,0.35), uv.x * 0.6 + 0.2);

      // neon veins based on noise
      float veins = smoothstep(0.45, 0.48, abs(sin((n+uv.x+uv.y+u_time*0.5)*6.2831)));
      vec3 neon = vec3(1.0, 0.2, 0.9) * veins * 1.08;

      // subtle moving highlight
      float highlight = smoothstep(0.0, 0.6, 0.6 - r + 0.2*sin(u_time*0.7 + uv.x*8.0));
      col += neon * highlight * 0.55;

      // flicker/scanline
      float scan = 0.03 * sin(gl_FragCoord.y * 0.06 + u_time * 10.0);

      // final composition with vignette
      float vign = smoothstep(0.8, 0.2, r);
      vec3 outc = col + scan;
      outc = mix(outc * 0.7, outc, vign);

      gl_FragColor = vec4(outc, 1.0);
    }
    `;

    const vert = `
    attribute vec2 position;
    void main(){
      gl_Position = vec4(position, 0.0, 1.0);
    }`;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Shader compile error:', gl.getShaderInfoLog(s));
        gl.deleteShader(s);
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vert);
    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!vs || !fs) return;

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn('Program link error:', gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const pos = gl.getAttribLocation(prog, 'position');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const u_res = gl.getUniformLocation(prog, 'u_res');
    const u_time = gl.getUniformLocation(prog, 'u_time');
    const u_index = gl.getUniformLocation(prog, 'u_index');

    glStateRef.current = {
      gl,
      prog,
      u_res,
      u_time,
      u_index,
      start: performance.now(),
    };

    let raf = null;
    function frame() {
      resize();
      const s = glStateRef.current;
      const now = (performance.now() - s.start) / 1000;
      gl.uniform2f(s.u_res, canvas.width, canvas.height);
      gl.uniform1f(s.u_time, now);
      gl.uniform1f(s.u_index, displayedIndexRef.current || 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    }
    frame();

    const onResize = () => {
      resize();
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      try {
        gl.deleteProgram(prog);
        gl = null;
      } catch (e) {}
    };
  }, []);

  const nextPoint = useCallback(
    () => setIndex((prev) => (prev + 1) % length),
    [length]
  );
  const prevPoint = useCallback(
    () => setIndex((prev) => (prev - 1 + length) % length),
    [length]
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') nextPoint();
      if (e.key === 'ArrowLeft') prevPoint();
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nextPoint, prevPoint, onClose]);

  const cardVariants = {
    enter: (dir = 1) => ({
      x: 120 * dir,
      opacity: 0,
      scale: 0.94,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
    },
    exit: (dir = 1) => ({
      x: -120 * dir,
      opacity: 0,
      scale: 0.94,
      transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
    }),
  };

  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: '-20% 0px' });

  const handleDragEnd = useCallback(
    (event, info) => {
      const threshold = 80;
      const velocityThreshold = 300;
      const offsetX = info.offset.x;
      const velX = info.velocity.x;

      event.stopPropagation();

      if (offsetX < -threshold || velX < -velocityThreshold) {
        nextPoint();
      } else if (offsetX > threshold || velX > velocityThreshold) {
        prevPoint();
      }
    },
    [nextPoint, prevPoint]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const centerX = rect.width / 2;

      if (clickX > centerX) {
        nextPoint();
      } else {
        prevPoint();
      }
    },
    [nextPoint, prevPoint]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <DraggableWindow
        ref={containerRef}
        className="relative w-full max-w-2xl h-[440px] flex items-center justify-center text-center p-6 rounded-2xl overflow-hidden"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,6,18,0.75), rgba(6,2,10,0.65))',
          border: '1px solid rgba(255,120,240,0.06)',
          boxShadow: '0 20px 90px rgba(140, 40, 180, 0.16)',
        }}
      >
        {/* Drag handle (kept separate from swipeable card) */}
        <div
          data-drag-handle
          className="absolute top-0 left-0 right-0 h-12 z-30 cursor-move select-none"
        />

        {/* Shader canvas background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ display: 'block' }}
        />

        {/* Top-right close */}
        <button
          onClick={() => onClose?.()}
          className="absolute top-4 right-4 text-gray-300 hover:text-white z-40 p-2 rounded-full bg-black/40 backdrop-blur-sm"
          aria-label="Close about dialog"
        >
          ✕
        </button>

        {/* Card area */}
        <div className="w-full max-w-xl z-20 px-4">
          <AnimatePresence mode="wait" custom={1}>
            <motion.div
              key={index}
              custom={1}
              variants={cardVariants}
              initial="enter"
              animate={isInView ? 'center' : 'enter'}
              exit="exit"
              className="relative"
            >
              <motion.div
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.15}
                onDragStart={(e) => e.stopPropagation()}
                onDrag={(e) => e.stopPropagation()}
                onDragEnd={handleDragEnd}
                onDoubleClick={handleDoubleClick}
                whileTap={{ scale: 0.995 }}
                whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
                style={{ cursor: 'grab' }}
                className="select-none"
              >
                <div
                  className="rounded-2xl p-8 shadow-2xl border border-white/6"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(120,30,210,0.16), rgba(255,40,180,0.12))',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <motion.p
                    className="text-lg md:text-xl font-medium text-white tracking-tight leading-relaxed"
                    initial={{ opacity: 0.92 }}
                    animate={{
                      rotate: [-1.5, 0, 1.5, 0],
                      transition: {
                        duration: 6,
                        repeat: Infinity,
                        ease: 'linear',
                      },
                    }}
                    style={{ textShadow: '0 6px 30px rgba(140,40,180,0.12)' }}
                  >
                    {ABOUT_POINTS[index]}
                  </motion.p>

                  <div className="mt-6 flex justify-center gap-2">
                    {/* small progress dots */}
                    {ABOUT_POINTS.map((_, i) => {
                      const displayed =
                        Math.abs(displayedIndexRef.current - i) < 0.5;
                      const active = i === index;
                      return (
                        <span
                          key={i}
                          aria-hidden
                          style={{
                            width: active ? 14 : displayed ? 8 : 6,
                            height: active ? 14 : displayed ? 8 : 6,
                            borderRadius: 999,
                            display: 'inline-block',
                            margin: '0 4px',
                            background: active
                              ? 'linear-gradient(90deg,#ff66d6,#7a4bff)'
                              : 'rgba(255,255,255,0.08)',
                            boxShadow: active
                              ? '0 6px 20px rgba(160,80,220,0.18)'
                              : 'none',
                            transition: 'all 280ms cubic-bezier(.2,.9,.2,1)',
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Navigation instruction */}
                  <motion.div
                    className="mt-4 text-center"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    transition={{ delay: 1, duration: 0.5 }}
                  >
                    <p className="text-xs text-white/60 font-light tracking-wide">
                      • Double-click left/right swipe or ➡⬅ to navigate •
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </DraggableWindow>
    </div>
  );
}
