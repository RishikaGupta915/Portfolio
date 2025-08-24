import React, { useState } from 'react';
import BootSequence from './components/BootStrap/BootSequence';
import Desktop from './components/Desktop/desktop';
import Settings from './components/Desktop/Settings';

import defaultWallpaper from './assets/default.jpg';
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

  const wallpapers = [
    defaultWallpaper,
    wallpaper1,
    wallpaper2,
    wallpaper3,
    wallpaper4,
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
        </>
      )}
    </div>
  );
}

export default App;
