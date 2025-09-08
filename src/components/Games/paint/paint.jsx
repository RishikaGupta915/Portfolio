import React, { useEffect, useRef, useState } from 'react';

const TOOLS = {
  BRUSH: 'brush',
  ERASER: 'eraser',
  LINE: 'line',
  RECT: 'rect',
  CIRCLE: 'circle',
  BUCKET: 'bucket',
  DROPPER: 'dropper',
  HAND: 'hand',
};

export default function PaintApp({ onClose }) {
  const modalRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const fileRef = useRef(null);

  // Tool and drawing states
  const [tool, setTool] = useState(TOOLS.BRUSH);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(3);
  const [opacity, setOpacity] = useState(1);

  // Drawing states
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState(null);
  const [lastPos, setLastPos] = useState(null);
  const [currentStroke, setCurrentStroke] = useState([]);

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Draggable window states
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

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

  // Drag functionality
  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;

    const rect = modalRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    const maxX = window.innerWidth - (modalRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (modalRef.current?.offsetHeight || 0);

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Drawing functions
  const getCanvasPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
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

  const floodFill = (ctx, startX, startY, fillColor) => {
    const imageData = ctx.getImageData(
      0,
      0,
      ctx.canvas.width,
      ctx.canvas.height
    );
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    const startIndex = (startY * width + startX) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    const startA = data[startIndex + 3];

    const fillR = parseInt(fillColor.substr(1, 2), 16);
    const fillG = parseInt(fillColor.substr(3, 2), 16);
    const fillB = parseInt(fillColor.substr(5, 2), 16);

    if (startR === fillR && startG === fillG && startB === fillB) return;

    const stack = [{ x: startX, y: startY }];
    const visited = new Set();

    while (stack.length > 0) {
      const { x, y } = stack.pop();
      const key = y * width + x;

      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key))
        continue;

      const index = (y * width + x) * 4;
      if (
        data[index] !== startR ||
        data[index + 1] !== startG ||
        data[index + 2] !== startB ||
        data[index + 3] !== startA
      )
        continue;

      visited.add(key);
      data[index] = fillR;
      data[index + 1] = fillG;
      data[index + 2] = fillB;
      data[index + 3] = 255;

      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
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
    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    setIsDrawing(true);
    setStartPos(pos);
    setLastPos(pos);
    setCurrentStroke([pos]);

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
    if (!isDrawing) return;

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
        if (lastPos) {
          drawLine(ctx, lastPos, pos);
        }
        setLastPos(pos);
        setCurrentStroke((prev) => [...prev, pos]);
        break;

      case TOOLS.LINE:
      case TOOLS.RECT:
      case TOOLS.CIRCLE:
        // Clear overlay and draw preview
        overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

        if (tool === TOOLS.LINE) {
          drawLine(overlayCtx, startPos, pos);
        } else if (tool === TOOLS.RECT) {
          drawRect(overlayCtx, startPos, pos);
        } else if (tool === TOOLS.CIRCLE) {
          const radius = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
          drawCircle(overlayCtx, startPos, radius);
        }
        break;
    }
  };

  const handleCanvasMouseUp = (e) => {
    if (!isDrawing) return;

    const pos = getCanvasPos(e);
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    const ctx = canvas.getContext('2d');
    const overlayCtx = overlay.getContext('2d');

    setupDrawingContext(ctx);

    switch (tool) {
      case TOOLS.LINE:
        drawLine(ctx, startPos, pos);
        break;

      case TOOLS.RECT:
        drawRect(ctx, startPos, pos);
        break;

      case TOOLS.CIRCLE:
        const radius = Math.hypot(pos.x - startPos.x, pos.y - startPos.y);
        drawCircle(ctx, startPos, radius);
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

    setIsDrawing(false);
    setStartPos(null);
    setLastPos(null);
    setCurrentStroke([]);
  };

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
      <div
        ref={modalRef}
        className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl select-none"
        style={{
          position: 'fixed',
          left:
            position.x === 0 && position.y === 0 ? '50%' : `${position.x}px`,
          top: position.y === 0 && position.y === 0 ? '45%' : `${position.y}px`,
          transform:
            position.x === 0 && position.y === 0
              ? 'translate(-50%, -50%)'
              : 'none',
          width: '1000px',
          height: '600px',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Title Bar */}
        <div className="flex justify-between items-center p-3 border-b border-white/20 bg-gray-800/50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <h1 className="text-lg font-bold text-pink-400">Paint</h1>
          </div>
          <button
            onClick={onClose}
            className="no-drag text-white/60 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-3 border-b border-white/20 bg-gray-800/30 no-drag">
          {/* Tools */}
          <div className="flex gap-1">
            {Object.entries(TOOLS).map(([key, value]) => (
              <button
                key={value}
                onClick={() => setTool(value)}
                className={`px-3 py-2 rounded text-sm font-medium transition cursor-pointer ${
                  tool === value
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={key}
              >
                {value === 'brush' && '🖌️'}
                {value === 'eraser' && '🧽'}
                {value === 'line' && '📏'}
                {value === 'rect' && '⬜'}
                {value === 'circle' && '⭕'}
                {value === 'bucket' && '🪣'}
                {value === 'dropper' && '💧'}
                {value === 'hand' && '✋'}
              </button>
            ))}
          </div>

          <div className="w-px h-8 bg-white/20 mx-2"></div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Color:</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Size:</label>
              <input
                type="range"
                min="1"
                max="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-20 accent-pink-500 cursor-pointer"
              />
              <span className="text-sm text-gray-300 w-6">{size}</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">BG:</label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded border-none cursor-pointer"
              />
            </div>
          </div>

          <div className="w-px h-8 bg-white/20 mx-2"></div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ↶ Undo
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              ↷ Redo
            </button>
            <button
              onClick={clearCanvas}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
            >
              Import
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 cursor-pointer"
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
            <canvas
              ref={canvasRef}
              onMouseDown={handleCanvasMouseDown}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onMouseLeave={handleCanvasMouseUp}
              className="absolute inset-0 cursor-crosshair"
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
    </div>
  );
}
