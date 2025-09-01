import React, { useState } from "react";

export default function Settings({ wallpapers, setWallpaper, setTextSize, setCursor, onClose }) {
  const [customWallpaper, setCustomWallpaper] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) setCustomWallpaper(URL.createObjectURL(file));
  };

  return (
    <div className="absolute inset-0 bg-black/40 backdrop-blur-md flex justify-center items-center">
      <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-11/12 max-w-2xl space-y-8">
        <h2 className="text-2xl font-bold text-gray-800">⚙ Settings</h2>

        {/* Personalization */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">🎨 Personalization</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {wallpapers.map((wp, i) => (
              <img
                key={i}
                src={wp}
                onClick={() => setWallpaper(wp)}
                className="h-24 w-full object-cover rounded-xl cursor-pointer transition-transform duration-200 hover:scale-105 hover:ring-4 ring-indigo-500"
              />
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-gray-600 mb-1">Upload custom wallpaper:</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="text-sm text-gray-700"
            />
            {customWallpaper && (
              <button
                onClick={() => setWallpaper(customWallpaper)}
                className="mt-3 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow"
              >
                Set as Wallpaper
              </button>
            )}
          </div>
        </div>

        {/* Accessibility */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-700">🧩 Accessibility</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <label className="mr-3 font-medium text-gray-700">Text Size:</label>
              <select
                onChange={(e) => setTextSize(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
                defaultValue="text-base"
              >
                <option value="text-sm">Small</option>
                <option value="text-base">Medium</option>
                <option value="text-lg">Large</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="mr-3 font-medium text-gray-700">Cursor:</label>
              <select
                onChange={(e) => setCursor(e.target.value)}
                className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-indigo-400"
              >
                <option value="cursor-default">Default</option>
                <option value="cursor-pointer">Pointer</option>
                <option value="cursor-crosshair">Crosshair</option>
                <option value="cursor-wait">Wait</option>
              </select>
            </div>
          </div>
        </div>

        {/* Close */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold rounded-xl shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
