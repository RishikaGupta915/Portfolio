import React, { useEffect, useRef, useState } from "react";

const TOOLS = {
  BRUSH: "brush",
  ERASER: "eraser",
  LINE: "line",
  RECT: "rect",
  CIRCLE: "circle",
  BUCKET: "bucket",
  DROPPER: "dropper",
  HAND: "hand",
};

export default function PaintApp({ onClose }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);      // main painting surface
  const overlayRef = useRef(null);     // live preview while dragging shapes
  const fileRef = useRef(null);

  const [tool, setTool] = useState(TOOLS.BRUSH);
  const [color, setColor] = useState("#ff63ec");
  const [bgColor, setBgColor] = useState("#0b0220"); // canvas background
  const [size, setSize] = useState(8);
  const [opacity, setOpacity] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPt, setStartPt] = useState(null);
  const [history, setHistory] = useState([]);       // ImageData snapshots
  const [future, setFuture] = useState([]);         // redo stack
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState(null);
  const [zoom, setZoom] = useState(1);

  // init and scale canvas for HiDPI
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const parent = wrapRef.current;
    if (!canvas || !parent || !overlay) return;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const padding = 24;
      const maxW = Math.min(1100, parent.clientWidth - padding);
      const maxH = Math.min(720, parent.clientHeight - padding - 110);

      const cssW = Math.max(640, maxW);
      const cssH = Math.max(420, maxH);

      for (const c of [canvas, overlay]) {
        c.style.width = `${cssW}px`;
        c.style.height = `${cssH}px`;
        c.width = Math.floor(cssW * ratio);
        c.height = Math.floor(cssH * ratio);
        const ctx = c.getContext("2d");
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      }

      // set BG on main once
      const ctx = canvas.getContext("2d");
      ctx.save();
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height); // (already scaled)
      ctx.restore();

      pushHistory(); // first blank state
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const getCtx = () => canvasRef.current?.getContext("2d");
  const getOverlay = () => overlayRef.current?.getContext("2d");

  function pushHistory() {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const { width, height } = c;
    // store full pixel buffer
    const snapshot = ctx.getImageData(0, 0, width, height);
    setHistory((h) => [...h, snapshot]);
    setFuture([]); // clear redo
  }

  function restore(imageData) {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.putImageData(imageData, 0, 0);
  }

  function undo() {
    setHistory((h) => {
      if (h.length <= 1) return h;
      const prev = h[h.length - 2];
      setFuture((f) => [h[h.length - 1], ...f]);
      restore(prev);
      return h.slice(0, -1);
    });
  }

  function redo() {
    setFuture((f) => {
      if (f.length === 0) return f;
      const [first, ...rest] = f;
      restore(first);
      setHistory((h) => [...h, first]);
      return rest;
    });
  }

  // Drawing primitives
  const withStyle = (ctx, fn, custom = {}) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.globalAlpha = opacity;
    if (tool === TOOLS.ERASER) {
      ctx.globalCompositeOperation = "destination-out";
      ctx.strokeStyle = "rgba(0,0,0,1)";
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
    ctx.lineWidth = Math.max(1, size);
    Object.assign(ctx, custom);
    fn();
    ctx.restore();
  };

  function ptFromEvent(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    return { x: (x - pan.x) / zoom, y: (y - pan.y) / zoom };
  }

  function clearOverlay() {
    const o = getOverlay();
    if (!o) return;
    const c = overlayRef.current;
    o.clearRect(0, 0, c.width, c.height);
  }

  // Bucket fill (simple scanline fill)
  function bucketFillAt(x, y) {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    const w = c.width, h = c.height;
    const data = ctx.getImageData(0, 0, w, h);
    const target = getPixel(data, Math.floor(x * devicePixelRatio), Math.floor(y * devicePixelRatio));
    const fillCol = hexToRgba(color, Math.round(opacity * 255));

    if (colorsEqual(target, fillCol)) return;

    const stack = [[Math.floor(x * devicePixelRatio), Math.floor(y * devicePixelRatio)]];
    while (stack.length) {
      const [sx, sy] = stack.pop();
      let nx = sx;
      // move left
      while (nx >= 0 && colorsEqual(getPixel(data, nx, sy), target)) nx--;
      nx++;
      let spanAbove = false;
      let spanBelow = false;
      while (nx < w && colorsEqual(getPixel(data, nx, sy), target)) {
        setPixel(data, nx, sy, fillCol);
        if (sy > 0) {
          if (colorsEqual(getPixel(data, nx, sy - 1), target)) {
            if (!spanAbove) {
              stack.push([nx, sy - 1]); spanAbove = true;
            }
          } else spanAbove = false;
        }
        if (sy < h - 1) {
          if (colorsEqual(getPixel(data, nx, sy + 1), target)) {
            if (!spanBelow) {
              stack.push([nx, sy + 1]); spanBelow = true;
            }
          } else spanBelow = false;
        }
        nx++;
      }
    }
    ctx.putImageData(data, 0, 0);
  }

  // Pixel helpers for bucket
  function idx(w, x, y) { return (y * w + x) * 4; }
  function getPixel(img, x, y) {
    const i = idx(img.width, x, y);
    const d = img.data;
    return [d[i], d[i + 1], d[i + 2], d[i + 3]];
  }
  function setPixel(img, x, y, [r, g, b, a]) {
    const i = idx(img.width, x, y);
    const d = img.data;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = a;
  }
  function colorsEqual(a, b) { return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3]; }
  function hexToRgba(hex, alpha255 = 255) {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
    return [r, g, b, alpha255];
  }

  // Mouse/pointer handlers
  function onPointerDown(e) {
    const oCtx = getOverlay();
    const ctx = getCtx();
    if (!oCtx || !ctx) return;

    // Start pan mode
    if (tool === TOOLS.HAND) {
      setPanStart({ at: ptFromEvent(e), was: { ...pan } });
      return;
    }

    const p = ptFromEvent(e);
    setIsDrawing(true);
    setStartPt(p);

    if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
      withStyle(ctx, () => {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
      });
    }
    if (tool === TOOLS.BUCKET) {
      pushHistory();
      bucketFillAt(p.x, p.y);
    }
    if (tool === TOOLS.DROPPER) {
      const c = canvasRef.current;
      const raw = ctx.getImageData(
        Math.floor(p.x * devicePixelRatio),
        Math.floor(p.y * devicePixelRatio),
        1, 1
      ).data;
      setColor(`#${[raw[0], raw[1], raw[2]].map(v => v.toString(16).padStart(2, "0")).join("")}`);
    }
  }

  function onPointerMove(e) {
    const oCtx = getOverlay();
    const ctx = getCtx();
    if (!oCtx || !ctx) return;

    // handle pan
    if (panStart && tool === TOOLS.HAND) {
      const now = ptFromEvent(e);
      setPan({ x: panStart.was.x + (now.x - panStart.at.x), y: panStart.was.y + (now.y - panStart.at.y) });
      return;
    }

    if (!isDrawing) return;
    const p = ptFromEvent(e);

    if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
      withStyle(ctx, () => {
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    } else if ([TOOLS.LINE, TOOLS.RECT, TOOLS.CIRCLE].includes(tool)) {
      // draw preview on overlay
      clearOverlay();
      withStyle(oCtx, () => {
        if (tool === TOOLS.LINE) {
          oCtx.beginPath();
          oCtx.moveTo(startPt.x, startPt.y);
          oCtx.lineTo(p.x, p.y);
          oCtx.stroke();
        }
        if (tool === TOOLS.RECT) {
          const w = p.x - startPt.x, h = p.y - startPt.y;
          oCtx.strokeRect(startPt.x, startPt.y, w, h);
        }
        if (tool === TOOLS.CIRCLE) {
          const rx = p.x - startPt.x, ry = p.y - startPt.y;
          const r = Math.hypot(rx, ry);
          oCtx.beginPath();
          oCtx.arc(startPt.x, startPt.y, r, 0, Math.PI * 2);
          oCtx.stroke();
        }
      }, { setLineDash: [] });
    }
  }

  function onPointerUp(e) {
    const oCtx = getOverlay();
    const ctx = getCtx();
    if (!oCtx || !ctx) return;

    // end pan
    if (panStart && tool === TOOLS.HAND) {
      setPanStart(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);

    if ([TOOLS.LINE, TOOLS.RECT, TOOLS.CIRCLE].includes(tool)) {
      // commit shape to main canvas
      const p = ptFromEvent(e);
      clearOverlay();
      pushHistory();
      withStyle(ctx, () => {
        if (tool === TOOLS.LINE) {
          ctx.beginPath();
          ctx.moveTo(startPt.x, startPt.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        if (tool === TOOLS.RECT) {
          const w = p.x - startPt.x, h = p.y - startPt.y;
          ctx.strokeRect(startPt.x, startPt.y, w, h);
        }
        if (tool === TOOLS.CIRCLE) {
          const rx = p.x - startPt.x, ry = p.y - startPt.y;
          const r = Math.hypot(rx, ry);
          ctx.beginPath();
          ctx.arc(startPt.x, startPt.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    } else if (tool === TOOLS.BRUSH || tool === TOOLS.ERASER) {
      pushHistory();
    }
  }

  // wheel zoom (Ctrl+wheel) and pan (wheel)
  function onWheel(e) {
    if (e.ctrlKey) {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.1 : 0.9;
      const next = Math.min(4, Math.max(0.25, zoom * factor));
      setZoom(next);
    } else {
      setPan((p) => ({ x: p.x - e.deltaX * 0.5, y: p.y - e.deltaY * 0.5 }));
    }
  }

  // Import image
  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const ctx = getCtx();
      if (!ctx) return;
      pushHistory();
      ctx.drawImage(img, 0, 0, canvasRef.current.clientWidth, canvasRef.current.clientHeight);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  // Download PNG
  function handleDownload() {
    const c = canvasRef.current;
    const link = document.createElement("a");
    link.download = `paint-${Date.now()}.png`;
    link.href = c.toDataURL("image/png");
    link.click();
  }

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e) {
      if (e.ctrlKey && e.key.toLowerCase() === "z") { e.preventDefault(); undo(); }
      else if (e.ctrlKey && e.key.toLowerCase() === "y") { e.preventDefault(); redo(); }
      else if (e.key.toLowerCase() === "b") setTool(TOOLS.BRUSH);
      else if (e.key.toLowerCase() === "e") setTool(TOOLS.ERASER);
      else if (e.key.toLowerCase() === "l") setTool(TOOLS.LINE);
      else if (e.key.toLowerCase() === "r") setTool(TOOLS.RECT);
      else if (e.key.toLowerCase() === "o") setTool(TOOLS.CIRCLE);
      else if (e.key.toLowerCase() === "k") setTool(TOOLS.BUCKET);
      else if (e.key.toLowerCase() === "i") setTool(TOOLS.DROPPER);
      else if (e.key.toLowerCase() === "h") setTool(TOOLS.HAND);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // UI
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        ref={wrapRef}
        className="w-full max-w-[1200px] h-[80vh] rounded-2xl border border-white/15 bg-gradient-to-br from-[#15051e]/90 via-[#0b0220]/90 to-[#160114]/90 backdrop-blur-xl shadow-[0_20px_120px_rgba(255,80,220,0.18)] text-pink-100"
      >
        {/* Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎨</span>
            <div className="font-mono tracking-wide">
              <div className="text-pink-200">Night Paint</div>
              <div className="text-xs text-pink-200/60">MS-Paint inspired</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={undo}
              className="px-3 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25"
              title="Undo (Ctrl+Z)"
            >↶</button>
            <button
              onClick={redo}
              className="px-3 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25"
              title="Redo (Ctrl+Y)"
            >↷</button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30"
              title="Download PNG"
            >⬇ PNG</button>
            <button
              onClick={() => {
                const ctx = getCtx();
                if (!ctx) return;
                pushHistory();
                ctx.save();
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.restore();
              }}
              className="px-3 py-1 rounded-lg bg-pink-500/15 hover:bg-pink-500/25"
              title="Clear"
            >🗑</button>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/80"
                title="Close"
              >✕</button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-white/10">
          <ToolBtn tool={TOOLS.BRUSH} curr={tool} setTool={setTool}>🖌 Brush (B)</ToolBtn>
          <ToolBtn tool={TOOLS.ERASER} curr={tool} setTool={setTool}>🧽 Eraser (E)</ToolBtn>
          <ToolBtn tool={TOOLS.LINE} curr={tool} setTool={setTool}>／ Line (L)</ToolBtn>
          <ToolBtn tool={TOOLS.RECT} curr={tool} setTool={setTool}>▭ Rect (R)</ToolBtn>
          <ToolBtn tool={TOOLS.CIRCLE} curr={tool} setTool={setTool}>◯ Circle (O)</ToolBtn>
          <ToolBtn tool={TOOLS.BUCKET} curr={tool} setTool={setTool}>🪣 Bucket (K)</ToolBtn>
          <ToolBtn tool={TOOLS.DROPPER} curr={tool} setTool={setTool}>🎯 Dropper (I)</ToolBtn>
          <ToolBtn tool={TOOLS.HAND} curr={tool} setTool={setTool}>✋ Hand (H)</ToolBtn>

          <div className="ml-auto flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-pink-200/80">Color</span>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-8 w-10 rounded-md bg-transparent border border-white/20"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-pink-200/80">Size</span>
              <input
                type="range"
                min="1" max="64" value={size}
                onChange={(e) => setSize(parseInt(e.target.value, 10))}
                className="w-32 accent-pink-400"
              />
              <span className="w-8 text-center">{size}</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <span className="text-pink-200/80">Opacity</span>
              <input
                type="range"
                min="0.1" max="1" step="0.05" value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-32 accent-pink-400"
              />
              <span className="w-10 text-center">{Math.round(opacity * 100)}%</span>
            </label>

            <label className="flex items-center gap-2 text-sm">
              <span className="text-pink-200/80">BG</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                onBlur={() => {
                  const ctx = getCtx();
                  if (!ctx) return;
                  pushHistory();
                  ctx.save();
                  ctx.globalCompositeOperation = "destination-over";
                  ctx.fillStyle = bgColor;
                  ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  ctx.restore();
                }}
                className="h-8 w-10 rounded-md bg-transparent border border-white/20"
              />
            </label>

            <button
              onClick={() => fileRef.current.click()}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30"
              title="Import image"
            >
              ⬆ Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        {/* Canvas area */}
        <div
          className="relative overflow-hidden rounded-b-2xl"
          style={{ background: "radial-gradient(ellipse at top, rgba(255,110,240,0.06), transparent 60%)" }}
          onWheel={onWheel}
        >
          <div
            className="relative"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              touchAction: "none",
            }}
          >
            <canvas
              ref={canvasRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
              className="block select-none cursor-crosshair"
            />
            <canvas
              ref={overlayRef}
              className="absolute inset-0 pointer-events-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 text-xs text-pink-200/70 border-t border-white/10">
          <div>Brush/Eraser draw; Line/Rect/Circle drag; Bucket click; Dropper click; Hand to pan; Ctrl+Wheel to zoom.</div>
          <div className="font-mono">Undo: Ctrl+Z • Redo: Ctrl+Y • Zoom: {Math.round(zoom * 100)}%</div>
        </div>
      </div>
    </div>
  );
}

function ToolBtn({ tool, curr, setTool, children }) {
  const active = curr === tool;
  return (
    <button
      onClick={() => setTool(tool)}
      className={`px-3 py-1.5 rounded-xl text-sm transition
        ${active
          ? "bg-pink-500/30 text-pink-50 shadow-[0_0_0_1px_rgba(255,120,240,0.35)_inset]"
          : "bg-white/5 hover:bg-white/10 text-pink-100/90"}`
      }
    >
      {children}
    </button>
  );
}
