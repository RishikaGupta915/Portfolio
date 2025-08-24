import React, { useState } from "react";

export default function Settings({ wallpapers, setWallpaper, setTextSize, setCursor, onClose }) {
  const [customWallpaper, setCustomWallpaper] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setCustomWallpaper(URL.createObjectURL(file));
  };

  return (
    <div className="absolute inset-0 bg-black/70 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl p-6 w-3/4 max-w-lg space-y-6">
        <h2 className="text-xl font-bold">Settings</h2>

        {/* Personalization */}
        <div>
          <h3 className="font-semibold mb-2">Personalization</h3>
          <div className="grid grid-cols-2 gap-2">
            {wallpapers.map((wp, i) => (
              <img
                key={i}
                src={wp}
                onClick={() => setWallpaper(wp)}
                className="h-20 w-full object-cover rounded-lg cursor-pointer hover:ring-2 ring-blue-500"
              />
            ))}
          </div>
          <div className="mt-2">
            <label className="block mb-1">Upload custom wallpaper:</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {customWallpaper && (
              <button
                onClick={() => setWallpaper(customWallpaper)}
                className="mt-2 px-4 py-1 bg-blue-600 text-white rounded-lg"
              >
                Set as Wallpaper
              </button>
            )}
          </div>
        </div>

        {/* Accessibility */}
        <div>
          <h3 className="font-semibold mb-2">Accessibility</h3>
          <div className="space-y-2">
            <div>
              <label className="mr-2">Text Size:</label>
              <select onChange={(e) => setTextSize(e.target.value)} className="border p-1 rounded">
                <option value="text-sm">Small</option>
                <option value="text-base" selected>Medium</option>
                <option value="text-lg">Large</option>
              </select>
            </div>
            <div>
              <label className="mr-2">Cursor:</label>
              <select onChange={(e) => setCursor(e.target.value)} className="border p-1 rounded">
                <option value="cursor-default">Default</option>
                <option value="cursor-pointer">Pointer</option>
                <option value="cursor-crosshair">Crosshair</option>
                <option value="cursor-wait">Wait</option>
              </select>
            </div>
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full py-2 bg-red-500 text-white rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
}
