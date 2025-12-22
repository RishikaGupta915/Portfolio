import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  X,
  Settings2,
  Palette,
  Monitor,
  Type,
  MousePointer,
  Upload,
} from 'lucide-react';

export default function Settings({
  wallpapers,
  textSize,
  cursor,
  wallpaper,
  onSave,
  onPreview,
  onClose,
}) {
  const [draftWallpaper, setDraftWallpaper] = useState(wallpaper);
  const [draftTextSize, setDraftTextSize] = useState(textSize);
  const [draftCursor, setDraftCursor] = useState(cursor);

  const [customWallpaper, setCustomWallpaper] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const MAX_WALLPAPER_BYTES = 2 * 1024 * 1024; // 2MB

  useEffect(() => {
    if (typeof onPreview !== 'function') return;
    onPreview({
      wallpaper: draftWallpaper,
      textSize: draftTextSize,
      cursor: draftCursor,
    });
  }, [draftWallpaper, draftTextSize, draftCursor, onPreview]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setCustomWallpaper(null);

    if (file.size > MAX_WALLPAPER_BYTES) {
      setUploadError('Image too large. Please choose a file under 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;
      if (!result) {
        setUploadError('Could not read that file. Please try another image.');
        return;
      }
      setCustomWallpaper(result);
    };
    reader.onerror = () => {
      setUploadError('Could not read that file. Please try another image.');
    };
    reader.readAsDataURL(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pb-20"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 max-w-4xl w-full max-h-[calc(100vh-8rem)] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Settings2 className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="space-y-8">
          {/* Personalization */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Palette className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Personalization
              </h3>
            </div>

            {/* Wallpapers */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <div className="flex items-center space-x-2 mb-4">
                <Monitor className="w-4 h-4 text-white/60" />
                <span className="text-white/80 font-medium">Wallpapers</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {wallpapers.map((wp, i) => (
                  <motion.img
                    key={i}
                    src={wp}
                    onClick={() => setDraftWallpaper(wp)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="h-24 w-full object-cover rounded-xl cursor-pointer border-2 border-transparent hover:border-blue-400/50 transition-all duration-200"
                  />
                ))}
              </div>

              {/* Custom Upload */}
              <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <Upload className="w-4 h-4 text-white/60" />
                  <label className="text-white/80 font-medium">
                    Upload Custom Wallpaper
                  </label>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-sm text-white/60 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-400 hover:file:bg-blue-500/30 file:cursor-pointer"
                />

                {uploadError && (
                  <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {uploadError}
                  </div>
                )}
                {customWallpaper && (
                  <motion.button
                    onClick={() => setDraftWallpaper(customWallpaper)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Set as Wallpaper
                  </motion.button>
                )}
              </div>
            </div>
          </div>

          {/* Accessibility */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Type className="w-5 h-5 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">
                Accessibility
              </h3>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/10 space-y-6">
              {/* Text Size */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Type className="w-4 h-4 text-white/60" />
                  <span className="text-white/80 font-medium">Text Size</span>
                </div>
                <select
                  onChange={(e) => setDraftTextSize(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400/50 focus:bg-white/15"
                  value={draftTextSize}
                >
                  <option value="text-sm" className="bg-gray-800">
                    Small
                  </option>
                  <option value="text-base" className="bg-gray-800">
                    Medium
                  </option>
                  <option value="text-lg" className="bg-gray-800">
                    Large
                  </option>
                </select>
              </div>

              {/* Cursor Style */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <MousePointer className="w-4 h-4 text-white/60" />
                  <span className="text-white/80 font-medium">
                    Cursor Style
                  </span>
                </div>
                <select
                  onChange={(e) => setDraftCursor(e.target.value)}
                  className="bg-white/10 border border-white/20 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400/50 focus:bg-white/15"
                  value={draftCursor}
                >
                  <option value="cursor-default" className="bg-gray-800">
                    Default
                  </option>
                  <option value="cursor-pointer" className="bg-gray-800">
                    Pointer
                  </option>
                  <option value="cursor-crosshair" className="bg-gray-800">
                    Crosshair
                  </option>
                  <option value="cursor-wait" className="bg-gray-800">
                    Wait
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <motion.button
              onClick={() =>
                onSave({
                  wallpaper: draftWallpaper,
                  textSize: draftTextSize,
                  cursor: draftCursor,
                })
              }
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg"
            >
              Save Settings
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
