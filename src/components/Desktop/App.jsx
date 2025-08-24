// App.jsx
import React, { useState } from "react";
import Desktop from "Desktop";
import Settings from "Settings";

import defaultWallpaper from "./assets/default.jpg";
import wallpaper1 from "./assets/wall1.jpg";
import wallpaper2 from "./assets/wall2.jpg";
import wallpaper3 from "./assets/wall3.jpg";
import wallpaper4 from "./assets/wall4.jpg";

export default function App() {
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [textSize, setTextSize] = useState("text-base");
  const [cursor, setCursor] = useState("cursor-default");
  const [showSettings, setShowSettings] = useState(false);

  const wallpapers = [defaultWallpaper, wallpaper1, wallpaper2, wallpaper3, wallpaper4];

  return (
    <div className={`h-screen w-screen overflow-hidden ${textSize} ${cursor}`}>
      <Desktop wallpaper={wallpaper} onOpenSettings={() => setShowSettings(true)} />

      {showSettings && (
        <Settings
          wallpapers={wallpapers}
          setWallpaper={setWallpaper}
          setTextSize={setTextSize}
          setCursor={setCursor}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
