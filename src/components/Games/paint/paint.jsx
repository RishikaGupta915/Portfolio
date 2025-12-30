import React, { useEffect, useRef, useState } from 'react';
import DraggableWindow from '../../Dragable/dragable';

const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  LINE: 'line',
  RECT: 'rect',
  CIRCLE: 'circle',
  BUCKET: 'bucket',
  DROPPER: 'dropper',
  MOVE: 'move',
};

export default function PaintApp({ onClose }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const fileRef = useRef(null);
  const rafPanRef = useRef(0);

  // Tool and drawing states
  const [tool, setTool] = useState(TOOLS.BRUSH);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(1);

  // Drawing state (refs to avoid rerendering on every mousemove)
  const isDrawingRef = useRef(false);
  const startPosRef = useRef(null);

  // Pan (hand tool)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panBaseOffsetRef = useRef({ x: 0, y: 0 });
  const pendingPanRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    // Set canvas size
    const width = 800;
    const height = 500;

    canvas.width = width;
    canvas.height = height;
    overlay.width = width;
    overlay.height = height;

    // Initialize with white background
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // Save initial state
    saveToHistory();
  }, [bgColor]);

  // Drawing functions
  const getCanvasPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas
      .getContext('2d')
      .getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(imageData);

    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(history[historyIndex - 1], 0, 0);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.putImageData(history[historyIndex + 1], 0, 0);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const drawLine = (ctx, from, to) => {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const drawCircle = (ctx, center, radius) => {
    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
  };

  const drawRect = (ctx, start, end) => {
    const width = end.x - start.x;
    const height = end.y - start.y;
    ctx.strokeRect(start.x, start.y, width, height);
  };

  const hexToRgb = (hex) => ({
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  });

  const floodFill = (ctx, startX, startY, fillColor) => {
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    if (
      startX < 0 ||
      startX >= canvasWidth ||
      startY < 0 ||
      startY >= canvasHeight
    )
      return;

    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const startIndex = (startY * width + startX) * 4;
    const target = {
      r: data[startIndex],
      g: data[startIndex + 1],
      b: data[startIndex + 2],
      a: data[startIndex + 3],
    };

    const fill = hexToRgb(fillColor);
    const fillA = 255;

    // Higher tolerance = more forgiving (fills anti-aliased edges cleanly).
    // Keep this conservative so we don't "leak" across real boundaries.
    const tolerance = 28;
    const withinTol = (v, t) => Math.abs(v - t) <= tolerance;

    const matchesTargetAtIndex = (index) =>
      withinTol(data[index], target.r) &&
      withinTol(data[index + 1], target.g) &&
      withinTol(data[index + 2], target.b) &&
      withinTol(data[index + 3], target.a);

    const matchesTarget = (x, y) => {
      const index = (y * width + x) * 4;
      return matchesTargetAtIndex(index);
    };

    const setFill = (x, y) => {
      const index = (y * width + x) * 4;
      data[index] = fill.r;
      data[index + 1] = fill.g;
      data[index + 2] = fill.b;
      data[index + 3] = fillA;
    };

    // If the clicked pixel is already (effectively) the fill color, bail.
    if (
      withinTol(target.r, fill.r) &&
      withinTol(target.g, fill.g) &&
      withinTol(target.b, fill.b) &&
      withinTol(target.a, fillA)
    )
      return;

    // Scanline flood fill for smooth, complete fills.
    const stack = [{ x: startX, y: startY }];
    while (stack.length) {
      const { x, y } = stack.pop();
      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (!matchesTarget(x, y)) continue;

      let xLeft = x;
      while (xLeft >= 0 && matchesTarget(xLeft, y)) xLeft -= 1;
      xLeft += 1;

      let xRight = x;
      while (xRight < width && matchesTarget(xRight, y)) xRight += 1;
      xRight -= 1;

      let inSpanAbove = false;
      let inSpanBelow = false;

      for (let xi = xLeft; xi <= xRight; xi += 1) {
        setFill(xi, y);

        if (y > 0) {
          const aboveMatches = matchesTarget(xi, y - 1);
          if (aboveMatches && !inSpanAbove) {
            stack.push({ x: xi, y: y - 1 });
            inSpanAbove = true;
          } else if (!aboveMatches) {
            inSpanAbove = false;
          }
        }

        if (y < height - 1) {
          const belowMatches = matchesTarget(xi, y + 1);
          if (belowMatches && !inSpanBelow) {
            stack.push({ x: xi, y: y + 1 });
            inSpanBelow = true;
          } else if (!belowMatches) {
            inSpanBelow = false;
          }
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const setupDrawingContext = (ctx) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = size;
    ctx.globalAlpha = opacity;

    if (tool === TOOLS.ERASER) {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  };

  // Event handlers
  const handleCanvasMouseDown = (e) => {
    if (tool === TOOLS.MOVE) {
      isPanningRef.current = true;
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panBaseOffsetRef.current = { ...panOffsetRef.current };
      return;
    }

    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    isDrawingRef.current = true;
    startPosRef.current = pos;
    lastPosRef.current = pos;

    setupDrawingContext(ctx);

    switch (tool) {
      case TOOLS.BRUSH:
      case TOOLS.ERASER:
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size / 2, 0, 2 * Math.PI);
        ctx.fill();
        break;

      case TOOLS.BUCKET:
        floodFill(ctx, Math.floor(pos.x), Math.floor(pos.y), color);
        saveToHistory();
        break;

      case TOOLS.DROPPER:
        const imageData = ctx.getImageData(pos.x, pos.y, 1, 1);
        const pixel = imageData.data;
        const hex =
          '#' +
          ((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
            .toString(16)
            .slice(1);
        setColor(hex);
        break;
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (tool === TOOLS.MOVE && isPanningRef.current) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;

      pendingPanRef.current = {
        x: panBaseOffsetRef.current.x + dx,
        y: panBaseOffsetRef.current.y + dy,
      };

      if (!rafPanRef.current) {
        rafPanRef.current = window.requestAnimationFrame(() => {
          rafPanRef.current = 0;
          if (!pendingPanRef.current) return;
          panOffsetRef.current = pendingPanRef.current;
          setPanOffset(pendingPanRef.current);
        });
      }
      return;
    }

    if (!isDrawingRef.current) return;

    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    setupDrawingContext(ctx);
    setupDrawingContext(overlayCtx);

    switch (tool) {
      case TOOLS.BRUSH:
      case TOOLS.ERASER:
        if (lastPosRef.current) {
          drawLine(ctx, lastPosRef.current, pos);
        }
        lastPosRef.current = pos;
        break;

      case TOOLS.LINE:
      case TOOLS.RECT:
      case TOOLS.CIRCLE:
        // Clear overlay and draw preview
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

        if (tool === TOOLS.LINE) {
          drawLine(overlayCtx, startPosRef.current, pos);
        } else if (tool === TOOLS.RECT) {
          drawRect(overlayCtx, startPosRef.current, pos);
        } else if (tool === TOOLS.CIRCLE) {
          const start = startPosRef.current;
          const radius = Math.hypot(pos.x - start.x, pos.y - start.y);
          drawCircle(overlayCtx, start, radius);
        }
        break;
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (tool === TOOLS.MOVE) {
      isPanningRef.current = false;
      setIsPanning(false);
      return;
    }

    if (!isDrawingRef.current) return;

    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    setupDrawingContext(ctx);

    switch (tool) {
      case TOOLS.LINE:
        drawLine(ctx, startPosRef.current, pos);
        break;

      case TOOLS.RECT:
        drawRect(ctx, startPosRef.current, pos);
        break;

      case TOOLS.CIRCLE:
        const start = startPosRef.current;
        const radius = Math.hypot(pos.x - start.x, pos.y - start.y);
        drawCircle(ctx, start, radius);
        break;
    }

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

    if (
      tool === TOOLS.BRUSH ||
      tool === TOOLS.ERASER ||
      tool === TOOLS.LINE ||
      tool === TOOLS.RECT ||
      tool === TOOLS.CIRCLE
    ) {
      saveToHistory();
    }

    isDrawingRef.current = false;
    startPosRef.current = null;
    lastPosRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (rafPanRef.current) {
        window.cancelAnimationFrame(rafPanRef.current);
      }
    };
  }, []);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `paint-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      saveToHistory();
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-20">
      <DraggableWindow
        className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl select-none"
        style={{
          width: '1000px',
          height: '600px',
        }}
      >
        {/* Title Bar */}
        <div
          data-drag-handle
          className="flex justify-between items-center px-3 py-2 border-b border-white/20 bg-gray-800/50 rounded-t-xl cursor-move"
        >
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-pink-400">Paint</h1>
          </div>
          <button
            onClick={onClose}
            className="no-drag text-white/60 hover:text-white text-lg font-bold w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-white/20 bg-gray-800/30 no-drag">
          {/* Tools */}
          <div className="flex gap-1">
            {Object.entries(TOOLS).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setTool(value)}
                className={`px-2 py-1 rounded-md text-xs font-medium leading-none transition cursor-pointer min-w-9 h-8 ${
                  tool === value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={key}
              >
                {value === 'brush' && '🖌'}
                {value === 'eraser' && '🫧'}
                {value === 'line' && '───'}
                {value === 'rect' && '███'}
                {value === 'circle' && '𖧋'}
                {value === 'bucket' && '🗑'}
                {value === 'dropper' && '𓄼𓄼'}
                {value === 'move' && 'જ⁀➴'}
              </button>
            ))}
          </div>

          <div className="w-px h-7 bg-white/20 mx-2"></div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-300">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-300">Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-16 accent-pink-500 cursor-pointer"
              />
              <span className="text-xs text-gray-300 w-6">{size}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-300">BG:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-7 h-7 rounded border-none cursor-pointer"
              />
            </div>
          </div>

          <div className="w-px h-7 bg-white/20 mx-2"></div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-2 py-1 bg-gray-700 text-gray-300 rounded-md text-xs hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ↷ Redo
            </button>
            <button
              onClick={clearCanvas}
              className="px-2 py-1 bg-pink-400 text-black rounded-md text-xs hover:bg-pink-500 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-2 py-1 bg-blue-300 text-black rounded-md text-xs hover:bg-blue-400 cursor-pointer"
            >
              Import
            </button>
            <button
              onClick={handleDownload}
              className="px-2 py-1 bg-yellow-300 text-black rounded-md text-xs hover:bg-yellow-400 cursor-pointer"
            >
              Save
            </button>
          </div>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Canvas Area */}
        <div
          className="p-4 bg-gray-900 rounded-b-xl no-drag"
          style={{ height: 'calc(100% - 120px)' }}
        >
          <div className="relative w-full h-full border-2 border-gray-600 rounded bg-white overflow-hidden">
            <div
              className="absolute inset-0"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
              }}
            >
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                className={`absolute inset-0 ${
                  tool === TOOLS.MOVE
                    ? isPanning
                      ? 'cursor-grabbing'
                      : 'cursor-grab'
                    : 'cursor-crosshair'
                }`}
                style={{ width: '100%', height: '100%' }}
              />
              <canvas
                ref={overlayRef}
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          </div>
        </div>
      </DraggableWindow>
    </div>
  );
}
