import React, { useState } from 'react';
import BootSequence from './components/BootStrap/BootSequence';
import Desktop from './components/Desktop/desktop';
import Settings from './components/Desktop/Settings';
import Taskbar from './components/Taskbar/Taskbar';
import SudokuApp from './components/Sudoku/Sudoku';

import defaultWallpaper from './assets/default.gif';
import wallpaper1 from './assets/wall1.jpg';
import wallpaper2 from './assets/wall2.jpg';
import wallpaper3 from './assets/wall3.jpg';
import wallpaper4 from './assets/wall4.jpg';

function App() {
  const [booting, setBooting] = useState(true);
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [textSize, setTextSize] = useState('text-base');
  const [cursor, setCursor] = useState('cursor-default');
  const [showSettings, setShowSettings] = useState(false);
  const [showSudoku, setShowSudoku] = useState(false);

  const wallpapers = [
    defaultWallpaper,
    wallpaper1,
    wallpaper2,
    wallpaper3,
    wallpaper4,
  ];

  // Sample apps for the taskbar
  const apps = [
    { name: 'Browser', icon: '/icons/browser.png' },
    { name: 'Terminal', icon: '/icons/terminal.png' },
    { name: 'VS Code', icon: '/icons/vscode.png' },
    { name: 'Portfolio', icon: '/icons/portfolio.png' },
  ];

  return (
    <div className={`fixed inset-0 ${textSize} ${cursor}`}>
      {booting ? (
        <BootSequence onComplete={() => setBooting(false)} />
      ) : (
        <>
          <Desktop
            wallpaper={wallpaper}
            onOpenSettings={() => setShowSettings(true)}
            onOpenSudoku={() => setShowSudoku(true)}
          />
          {showSettings && (
            <Settings
              wallpapers={wallpapers}
              setWallpaper={setWallpaper}
              setTextSize={setTextSize}
              setCursor={setCursor}
              onClose={() => setShowSettings(false)}
            />
          )}
          {showSudoku && <SudokuApp onClose={() => setShowSudoku(false)} />}
          <Taskbar apps={apps} />
        </>
      )}
    </div>
  );
}

export default App;
