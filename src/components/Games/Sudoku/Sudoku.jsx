import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import DraggableWindow from '../../Dragable/dragable';

const SIZE = 9;
const deepClone = (g) => g.map((r) => r.slice());

const samplePuzzles = [
  [
    0, 0, 0, 0, 0, 2, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 6, 0, 0,
    0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0,
    9, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 4, 0, 3, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 5, 0,
  ],

  [
    0, 2, 0, 0, 6, 0, 7, 0, 1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0,
    0, 0, 0, 0, 5, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 0,
    0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 1, 0, 9,
    0, 3, 0, 0, 0, 0,
  ],
];

function toGrid(flat) {
  const g = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  for (let i = 0; i < flat.length; i++) g[Math.floor(i / 9)][i % 9] = flat[i];
  return g;
}
function findEmpty(grid) {
  for (let r = 0; r < 9; r++)
    for (let c = 0; c < 9; c++) if (grid[r][c] === 0) return [r, c];
  return null;
}
function isSafe(grid, r, c, val) {
  for (let i = 0; i < 9; i++)
    if (grid[r][i] === val || grid[i][c] === val) return false;
  const br = Math.floor(r / 3) * 3,
    bc = Math.floor(c / 3) * 3;
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) if (grid[br + i][bc + j] === val) return false;
  return true;
}
function solveBacktrack(grid) {
  const empty = findEmpty(grid);
  if (!empty) return true;
  const [r, c] = empty;
  for (let n = 1; n <= 9; n++) {
    if (isSafe(grid, r, c, n)) {
      grid[r][c] = n;
      if (solveBacktrack(grid)) return true;
      grid[r][c] = 0;
    }
  }
  return false;
}

function SudokuCell({
  r,
  c,
  value,
  fixed,
  selected,
  noteMode,
  notes,
  onInput,
  onSelect,
  isError,
}) {
  const boxBorder =
    (r % 3 === 0 ? 'border-t-2 ' : '') +
    (c % 3 === 0 ? 'border-l-2 ' : '') +
    (r === 8 ? 'border-b-2 ' : '') +
    (c === 8 ? 'border-r-2 ' : '');
  return (
    <button
      onClick={() => onSelect(r, c)}
      className={[
        'relative aspect-square w-9 sm:w-10 md:w-11 flex items-center justify-center',
        'transition-colors select-none no-drag cursor-pointer',
        'border border-pink-500/30 ' + boxBorder,
        selected ? 'bg-pink-500/20' : 'bg-black/30',
        isError ? 'ring-2 ring-red-500/70' : '',
        fixed ? 'text-cyan-300' : 'text-pink-200',
      ].join(' ')}
      onKeyDown={(e) => {
        const k = e.key;
        if (k >= '1' && k <= '9') onInput(parseInt(k, 10));
        if (k === 'Backspace' || k === 'Delete' || k === '0') onInput(0);
        if (k === 'n' || k === 'N') onInput('TOGGLE_NOTE_MODE');
      }}
    >
      {/* big number or notes */}
      {value ? (
        <motion.span
          layout
          className={`text-lg sm:text-xl ${
            fixed ? 'font-semibold' : 'font-medium'
          }`}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          {value}
        </motion.span>
      ) : (
        <div className="grid grid-cols-3 gap-0.5 p-0.5 w-full h-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <span
              key={n}
              className={`text-[8px] sm:text-[9px] md:text-[10px] leading-none opacity-70 ${
                notes?.has(n) ? 'text-cyan-400' : 'text-pink-300/30'
              }`}
            >
              {notes?.has(n) ? n : '·'}
            </span>
          ))}
        </div>
      )}

      {/* selection glow */}
      {selected && (
        <span className="pointer-events-none absolute inset-0 ring-1 ring-cyan-300/60 rounded-sm" />
      )}
    </button>
  );
}

export default function SudokuApp({ onClose }) {
  const base = useMemo(
    () =>
      toGrid(samplePuzzles[Math.floor(Math.random() * samplePuzzles.length)]),
    []
  );
  const [grid, setGrid] = useState(() => deepClone(base));
  const [fixed] = useState(() => base.map((row) => row.map((v) => v !== 0)));
  const [notes, setNotes] = useState(() =>
    Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()))
  );
  const [selected, setSelected] = useState([0, 0]);
  const [noteMode, setNoteMode] = useState(false);
  const [errors, setErrors] = useState(new Set());
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  function handleSelect(r, c) {
    setSelected([r, c]);
  }
  function setValue(r, c, val) {
    if (fixed[r][c]) return;
    setGrid((g) => {
      const ng = deepClone(g);
      ng[r][c] = val;
      return ng;
    });
  }
  function toggleNote(r, c, val) {
    setNotes((n) => {
      const nn = n.map((row) => row.map((set) => new Set(set)));
      if (nn[r][c].has(val)) nn[r][c].delete(val);
      else nn[r][c].add(val);
      return nn;
    });
  }
  function handleInput(input) {
    const [r, c] = selected;
    if (input === 'TOGGLE_NOTE_MODE') {
      setNoteMode((m) => !m);
      return;
    }
    if (typeof input !== 'number') return;
    if (noteMode && input >= 1 && input <= 9) {
      toggleNote(r, c, input);
      return;
    }
    setValue(r, c, input);
  }

  useEffect(() => {
    const bad = new Set();
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = grid[r][c];
        if (!v) continue;

        const tmp = grid[r][c];
        grid[r][c] = 0;
        if (!isSafe(grid, r, c, v)) bad.add(`${r},${c}`);
        grid[r][c] = tmp;
      }
    }
    setErrors(bad);
  }, [grid]);

  function resetPuzzle() {
    setGrid(deepClone(base));
    setNotes(
      Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => new Set())
      )
    );
    setSeconds(0);
    setErrors(new Set());
  }
  function hint() {
    const sol = deepClone(grid);
    if (!solveBacktrack(sol)) return;
    const empties = [];
    for (let r = 0; r < 9; r++)
      for (let c = 0; c < 9; c++) if (!grid[r][c]) empties.push([r, c]);
    if (!empties.length) return;
    const [rr, cc] = empties[Math.floor(Math.random() * empties.length)];
    setValue(rr, cc, sol[rr][cc]);
  }
  function solve() {
    const g = deepClone(grid);
    if (solveBacktrack(g)) setGrid(g);
  }
  const done = useMemo(
    () => grid.flat().every((v) => v !== 0) && errors.size === 0,
    [grid, errors]
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 pb-20 z-40">
      <DraggableWindow className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-xl shadow-2xl mx-auto max-w-[min(90vw,750px)] w-full p-4 select-none">
        {/* header */}
        <div
          data-drag-handle
          className="mb-3 flex items-center justify-between cursor-move select-none"
        >
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-pink-300 drop-shadow-[0_0_15px_rgba(255,0,255,0.35)] tracking-wider font-semibold text-lg"
          >
            ★ Sudoku
          </motion.h1>
          <div className="flex items-center space-x-3">
            <div className="text-cyan-300 text-xs tabular-nums">
              ⏱ {String(Math.floor(seconds / 60)).padStart(2, '0')}:
              {String(seconds % 60).padStart(2, '0')}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="no-drag text-white/60 hover:text-white text-lg font-bold w-6 h-6 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-4 items-start no-drag">
          {/* board */}
          <div className="rounded-xl bg-gradient-to-br from-fuchsia-900/50 via-black/60 to-cyan-900/40 p-2 border border-pink-500/30 shadow-[0_0_40px_rgba(255,0,255,0.15)]">
            <div
              className="grid grid-cols-9"
              onKeyDown={(e) => e.preventDefault()}
              tabIndex={0}
            >
              {grid.map((row, r) =>
                row.map((val, c) => (
                  <SudokuCell
                    key={`${r}-${c}`}
                    r={r}
                    c={c}
                    value={val}
                    fixed={fixed[r][c]}
                    selected={selected[0] === r && selected[1] === c}
                    noteMode={noteMode}
                    notes={notes[r][c]}
                    onInput={handleInput}
                    onSelect={handleSelect}
                    isError={errors.has(`${r},${c}`)}
                  />
                ))
              )}
            </div>
          </div>

          {/* controls */}
          <div className="flex md:flex-col gap-2 md:w-40">
            <button
              className="px-2 py-1.5 rounded-lg border border-pink-500/40 bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 no-drag cursor-pointer text-xs"
              onClick={() => setNoteMode((m) => !m)}
            >
              ✎ Notes:{' '}
              <span className="font-semibold">{noteMode ? 'ON' : 'OFF'}</span>
            </button>
            <div className="grid grid-cols-5 md:grid-cols-3 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button
                  key={n}
                  onClick={() => handleInput(n)}
                  className="rounded-md py-1.5 text-xs border border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-200 no-drag cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleInput(0)}
                className="col-span-2 md:col-span-3 rounded-md py-1.5 text-xs border border-fuchsia-400/40 bg-fuchsia-400/10 hover:bg-fuchsia-400/20 text-fuchsia-200 no-drag cursor-pointer"
              >
                Clear
              </button>
            </div>
            <button
              onClick={hint}
              className="px-2 py-1.5 rounded-lg border border-cyan-400/40 bg-cyan-400/10 hover:bg-cyan-400/20 text-cyan-200 no-drag cursor-pointer text-xs"
            >
              Hint
            </button>
            <button
              onClick={solve}
              className="px-2 py-1.5 rounded-lg border border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/20 text-emerald-200 no-drag cursor-pointer text-xs"
            >
              Solve
            </button>
            <button
              onClick={resetPuzzle}
              className="px-2 py-1.5 rounded-lg border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-pink-100 no-drag cursor-pointer text-xs"
            >
              Reset
            </button>
            {done && (
              <div className="mt-1 text-emerald-300 text-xs">
                Completed! Nice.
              </div>
            )}
          </div>
        </div>

        <p className="mt-3 text-xs text-pink-200/70">
          Tip: use number keys 1–9 and Del/Backspace to clear.
        </p>
      </DraggableWindow>
    </div>
  );
}
