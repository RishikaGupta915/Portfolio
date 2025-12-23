import React, { useEffect, useMemo, useRef, useState } from 'react';
import musicIcon from '../../assets/music.png';

const PLAYLIST_MODULES = {
  ...import.meta.glob(
    '../../assets/MUSIC/**/*.{mp3,MP3,wav,WAV,ogg,OGG,m4a,M4A,flac,FLAC}',
    { eager: true, import: 'default' }
  ),
  ...import.meta.glob(
    '../../assets/music/**/*.{mp3,MP3,wav,WAV,ogg,OGG,m4a,M4A,flac,FLAC}',
    { eager: true, import: 'default' }
  ),
};

function filenameBase(filePath) {
  const base = String(filePath).split('/').pop() || String(filePath);
  return base.replace(/\.[^.]+$/, '');
}

function normalizeTitle(s) {
  return String(s).replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseLocalMeta(path) {
  const raw = normalizeTitle(filenameBase(path));
  const parts = raw
    .split(' - ')
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length >= 2) {
    // Common pattern: Artist - Title - Extra
    return {
      title: parts[1] || raw,
      subtitle: parts[0] || '',
    };
  }

  return { title: raw, subtitle: '' };
}

function buildPlaylistTracks() {
  const seenUrls = new Set();

  return Object.entries(PLAYLIST_MODULES)
    .filter(([, url]) => {
      if (!url) return false;
      const key = String(url);
      if (seenUrls.has(key)) return false;
      seenUrls.add(key);
      return true;
    })
    .map(([path, url]) => {
      const meta = parseLocalMeta(path);
      return {
        id: `pl:${path}`,
        title: meta.title,
        subtitle: meta.subtitle,
        url,
        source: 'playlist',
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export default function MusicPlayer({
  isOpen,
  onClose,
  keepPlayingInBackground,
  onChangeKeepPlayingInBackground,
}) {
  const modalRef = useRef(null);
  const audioRef = useRef(null);

  const playlistTracks = useMemo(() => buildPlaylistTracks(), []);

  const [activeTab, setActiveTab] = useState(
    playlistTracks.length > 0 ? 'playlist' : 'discover'
  );

  const [tracks, setTracks] = useState([]); // Jamendo results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  const [currentTrackId, setCurrentTrackId] = useState(null);

  const nowPlaying = useMemo(() => {
    if (!currentTrackId) return null;

    const id = String(currentTrackId);
    if (id.startsWith('pl:')) {
      const t = playlistTracks.find((x) => x.id === id);
      return t
        ? { title: t.title, subtitle: t.subtitle, source: 'playlist' }
        : { title: 'Unknown track', subtitle: '', source: 'playlist' };
    }

    if (id.startsWith('jm:')) {
      const jamId = id.slice(3);
      const t = tracks.find((x) => String(x.id) === jamId);
      return t
        ? { title: t.name, subtitle: t.artist_name || '', source: 'discover' }
        : { title: 'Unknown track', subtitle: '', source: 'discover' };
    }

    return null;
  }, [currentTrackId, playlistTracks, tracks]);

  // Draggable window state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.target.closest('.no-drag')) return;
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
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

  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    if (!isDragging) return;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const loadTracks = async ({ q } = {}) => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ limit: '200' });
      const qValue = typeof q === 'string' ? q.trim() : '';
      if (qValue) params.set('q', qValue);

      const res = await fetch(`/api/jamendo?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        setTracks([]);
        setError(
          data?.error ||
            'Failed to load discover. Make sure CLIENT_ID is set on the server.'
        );
        setLoading(false);
        return;
      }

      const results = Array.isArray(data?.results) ? data.results : [];
      setTracks(results);
      setLoading(false);
    } catch {
      setTracks([]);
      setLoading(false);
      setError('Failed to load discover.');
    }
  };

  useEffect(() => {
    loadTracks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If the window is closed and background playback is NOT allowed, stop audio.
    if (isOpen) return;
    if (keepPlayingInBackground) return;
    if (!audioRef.current) return;

    try {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
    } catch {
      // ignore
    }
  }, [isOpen, keepPlayingInBackground]);

  const playUrl = async ({ id, url }) => {
    if (!audioRef.current) return;
    setCurrentTrackId(id);

    if (!url) return;
    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    try {
      await audioRef.current.play();
    } catch {
      // Autoplay restrictions can block; user can press play in controls.
    }
  };

  const playPlaylist = async (t) => {
    await playUrl({ id: t.id, url: t.url });
  };

  const playJamendo = async (t) => {
    const nextUrl = t.audio || t.audiodownload || '';
    await playUrl({ id: `jm:${t.id}`, url: nextUrl });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-20 ${
        isOpen ? '' : 'hidden'
      }`}
    >
      <div
        ref={modalRef}
        className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl select-none flex flex-col overflow-hidden"
        style={{
          position: 'fixed',
          left:
            position.x === 0 && position.y === 0 ? '50%' : `${position.x}px`,
          top: position.x === 0 && position.y === 0 ? '45%' : `${position.y}px`,
          transform:
            position.x === 0 && position.y === 0
              ? 'translate(-50%, -50%)'
              : 'none',
          width: '760px',
          maxWidth: 'calc(100vw - 24px)',
          height: '540px',
          maxHeight: 'calc(100vh - 24px)',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Title Bar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-gray-800/40">
          <div className="flex items-center gap-2">
            <img
              src={musicIcon}
              alt=""
              className="w-6 h-6 opacity-90"
              draggable={false}
            />
            <h1 className="text-base font-semibold text-pink-300">Music</h1>
          </div>
          <button
            onClick={() => onClose?.()}
            className="no-drag text-white/60 hover:text-white text-xl font-bold w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>

        <div className="flex-1 p-4 grid grid-cols-5 gap-4 overflow-hidden">
          {/* Left panel */}
          <div className="col-span-2 flex flex-col gap-3 overflow-hidden">
            <div className="rounded-xl border border-white/10 bg-white/5 p-2 no-drag">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('playlist')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm transition cursor-pointer ${
                    activeTab === 'playlist'
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-200'
                      : 'bg-white/0 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  My Playlist
                </button>
                <button
                  onClick={() => setActiveTab('discover')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm transition cursor-pointer ${
                    activeTab === 'discover'
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-200'
                      : 'bg-white/0 border-white/10 text-white/80 hover:bg-white/10'
                  }`}
                >
                  Discover
                </button>
              </div>
            </div>

            {activeTab === 'discover' ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 no-drag">
                <div className="flex items-center gap-2">
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') loadTracks({ q: query });
                    }}
                    placeholder="Search songs"
                    className="flex-1 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white placeholder:text-white/40 focus:outline-none"
                  />
                  <button
                    onClick={() => loadTracks({ q: query })}
                    className="px-3 py-2 rounded-lg bg-gray-700 text-gray-200 hover:bg-gray-600 transition cursor-pointer"
                  >
                    Search
                  </button>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-white/60">Up to 200 results</div>
                  <button
                    onClick={() => loadTracks()}
                    className="text-xs px-2 py-1 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/80">My Playlist</div>
                  <div className="text-xs text-white/60">
                    {playlistTracks.length} songs
                  </div>
                </div>
                <div className="text-xs text-white/60 mt-1">
                  From assets/MUSIC
                </div>
              </div>
            )}

            <div className="flex-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="h-full overflow-auto custom-scrollbar p-2">
                {activeTab === 'playlist' ? (
                  playlistTracks.length === 0 ? (
                    <div className="text-sm text-white/60 p-2">
                      No local songs found.
                    </div>
                  ) : (
                    playlistTracks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => playPlaylist(t)}
                        className={`w-full text-left px-3 py-2 rounded-xl mb-2 transition no-drag cursor-pointer border ${
                          String(t.id) === String(currentTrackId)
                            ? 'bg-pink-500/20 border-pink-500/40'
                            : 'bg-white/0 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">
                              {t.title}
                            </div>
                            {t.subtitle ? (
                              <div className="text-xs text-white/60 truncate">
                                {t.subtitle}
                              </div>
                            ) : null}
                          </div>
                          <div className="text-xs text-white/40">
                            {String(t.id) === String(currentTrackId)
                              ? 'Playing'
                              : ''}
                          </div>
                        </div>
                      </button>
                    ))
                  )
                ) : loading ? (
                  <div className="text-sm text-white/60 p-2">Loading…</div>
                ) : error ? (
                  <div className="text-sm text-red-300 p-2">{error}</div>
                ) : tracks.length === 0 ? (
                  <div className="text-sm text-white/60 p-2">
                    No tracks found.
                  </div>
                ) : (
                  tracks.map((t) => (
                    <button
                      key={String(t.id)}
                      onClick={() => playJamendo(t)}
                      className={`w-full text-left px-3 py-2 rounded-xl mb-2 transition no-drag cursor-pointer border ${
                        String(`jm:${t.id}`) === String(currentTrackId)
                          ? 'bg-pink-500/20 border-pink-500/40'
                          : 'bg-white/0 hover:bg-white/10 border-white/10'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="text-sm text-white truncate">
                            {t.name}
                          </div>
                          {t.artist_name ? (
                            <div className="text-xs text-white/60 truncate">
                              {t.artist_name}
                            </div>
                          ) : null}
                        </div>
                        <div className="text-xs text-white/40">
                          {String(`jm:${t.id}`) === String(currentTrackId)
                            ? 'Playing'
                            : ''}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="col-span-3 flex flex-col gap-3 overflow-hidden">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                    <img
                      src={musicIcon}
                      alt=""
                      className="w-11 h-11 opacity-90"
                      draggable={false}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="text-xs text-white/60">Now Playing</div>
                    <div className="text-lg text-white font-semibold truncate">
                      {nowPlaying?.title || 'Pick a song'}
                    </div>
                    <div className="text-sm text-white/60 truncate">
                      {nowPlaying?.subtitle ||
                        (activeTab === 'playlist'
                          ? 'Your local playlist'
                          : 'Discover via Jamendo')}
                    </div>
                  </div>
                </div>

                <span className="text-[11px] px-2 py-1 rounded-full border border-pink-500/30 bg-pink-500/10 text-pink-200 whitespace-nowrap">
                  {nowPlaying?.source === 'playlist'
                    ? 'My Playlist'
                    : 'Discover'}
                </span>
              </div>

              <div className="mt-4">
                <audio ref={audioRef} controls className="w-full no-drag" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 no-drag">
                <label className="flex items-center gap-2 text-xs text-white/70 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!keepPlayingInBackground}
                    onChange={(e) =>
                      onChangeKeepPlayingInBackground?.(e.target.checked)
                    }
                    className="accent-pink-500"
                  />
                  Play in background
                </label>

                <div className="text-xs text-white/50">
                  {keepPlayingInBackground
                    ? 'Close window to keep playing'
                    : 'Off'}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 overflow-auto custom-scrollbar">
              <div className="text-sm text-white/80 mb-2">Quick Info</div>
              <div className="text-sm text-white/60">
                {activeTab === 'playlist'
                  ? `Local songs detected: ${playlistTracks.length}.`
                  : `Discover results loaded: ${tracks.length}.`}
              </div>
              <div className="mt-2 text-sm text-white/60">
                {activeTab === 'playlist'
                  ? 'All songs are served from your assets folder.'
                  : 'Search uses the Jamendo proxy to keep CLIENT_ID private.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
