import React, { useEffect, useRef, useState } from 'react';
import Desktop from 'Desktop';
import Settings from 'Settings';

import defaultWallpaper from './assets/default.jpg';
import wallpaper1 from './assets/wall1.jpg';
import wallpaper2 from './assets/wall2.jpg';
import wallpaper3 from './assets/wall3.jpg';
import wallpaper4 from './assets/wall4.jpg';

import heartCursor from '../../assets/heart.cur';

export default function App() {
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [textSize, setTextSize] = useState('text-base');
  const [cursor, setCursor] = useState('cursor-default');
  const [showSettings, setShowSettings] = useState(false);
  const settingsSnapshotRef = useRef(null);

  const wallpapers = [
    defaultWallpaper,
    wallpaper1,
    wallpaper2,
    wallpaper3,
    wallpaper4,
  ];

  useEffect(() => {
    try {
      const raw = localStorage.getItem('desktopSettings');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.wallpaper && typeof saved.wallpaper === 'string') {
        setWallpaper(saved.wallpaper);
      }
      if (saved?.textSize && typeof saved.textSize === 'string') {
        setTextSize(saved.textSize);
      }
      if (saved?.cursor && typeof saved.cursor === 'string') {
        setCursor(saved.cursor);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const fontSize =
      textSize === 'text-sm'
        ? '14px'
        : textSize === 'text-lg'
        ? '18px'
        : '16px';
    document.documentElement.style.fontSize = fontSize;
  }, [textSize]);

  useEffect(() => {
    const cursorValueByClass = {
      'cursor-default': `url("${heartCursor}") 0 0, default`,
      'cursor-pointer': 'pointer',
      'cursor-crosshair': 'crosshair',
      'cursor-wait': 'wait',
    };

    const styleId = 'global-cursor-style';
    const cursorCss = [
      'body, body * { cursor: var(--app-cursor, auto) !important; }',
      // Always show pointer
      'a, a *, button, button *, [role="button"], [role="button"] *, [role="link"], [role="link"] *, .cursor-pointer, .cursor-pointer * { cursor: pointer !important; }',
      // Force pointer cursor even on text fields
      'input, textarea, select { cursor: pointer !important; }',
    ].join('\n');

    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement('style');
      style.id = styleId;
      document.head.appendChild(style);
    }
    // Always update (important for HMR / hot reload and user edits).
    style.textContent = cursorCss;

    const cssCursor = cursorValueByClass[cursor] || 'auto';
    document.documentElement.style.setProperty('--app-cursor', cssCursor);
  }, [cursor]);

  const handleSaveSettings = ({ wallpaper, textSize, cursor }) => {
    setWallpaper(wallpaper);
    setTextSize(textSize);
    setCursor(cursor);
    try {
      localStorage.setItem(
        'desktopSettings',
        JSON.stringify({ wallpaper, textSize, cursor })
      );
    } catch {
      // ignore quota
    }
    settingsSnapshotRef.current = null;
    setShowSettings(false);
  };

  const openSettings = () => {
    settingsSnapshotRef.current = { wallpaper, textSize, cursor };
    setShowSettings(true);
  };

  const handlePreviewSettings = ({ wallpaper, textSize, cursor }) => {
    setWallpaper(wallpaper);
    setTextSize(textSize);
    setCursor(cursor);
  };

  const handleCloseSettings = () => {
    const snapshot = settingsSnapshotRef.current;
    if (snapshot) {
      setWallpaper(snapshot.wallpaper);
      setTextSize(snapshot.textSize);
      setCursor(snapshot.cursor);
    }
    settingsSnapshotRef.current = null;
    setShowSettings(false);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden ${textSize} ${cursor}`}>
      <Desktop wallpaper={wallpaper} onOpenSettings={openSettings} />

      {showSettings && (
        <Settings
          wallpapers={wallpapers}
          textSize={textSize}
          cursor={cursor}
          wallpaper={wallpaper}
          onSave={handleSaveSettings}
          onPreview={handlePreviewSettings}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  );
}
