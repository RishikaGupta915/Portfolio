import React, { useEffect, useMemo, useRef, useState } from 'react';
import musicIcon from '../../assets/music.png';
import DraggableWindow from '../Dragable/dragable';

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
  const audioRef = useRef(null);
  const handleEndedRef = useRef(() => {});

  const playlistTracks = useMemo(() => buildPlaylistTracks(), []);

  const [activeTab, setActiveTab] = useState(
    playlistTracks.length > 0 ? 'playlist' : 'discover'
  );

  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [currentTrackId, setCurrentTrackId] = useState(null);

  // Player UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState('off'); // off | all | one

  const formatTime = (sec) => {
    const s = Number.isFinite(sec) ? Math.max(0, sec) : 0;
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

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

  const loadDiscover = async () => {
    await loadTracks();
  };

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
    loadDiscover();
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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onVol = () => setVolume(audio.volume);
    const onEnded = () => handleEndedRef.current?.();

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('durationchange', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('volumechange', onVol);
    audio.addEventListener('ended', onEnded);

    audio.volume = volume;
    onTime();
    onMeta();

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('durationchange', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('volumechange', onVol);
      audio.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = loopMode === 'one';
  }, [loopMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  const getPlaybackContext = () => {
    if (!currentTrackId) {
      return { source: null, list: [], index: -1 };
    }

    const id = String(currentTrackId);
    if (id.startsWith('pl:')) {
      const index = playlistTracks.findIndex((x) => String(x.id) === id);
      return { source: 'playlist', list: playlistTracks, index };
    }

    if (id.startsWith('jm:')) {
      const jamId = id.slice(3);
      const index = tracks.findIndex((x) => String(x.id) === jamId);
      return { source: 'discover', list: tracks, index };
    }

    return { source: null, list: [], index: -1 };
  };

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

  const currentIndex = useMemo(() => {
    return getPlaybackContext().index;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrackId, playlistTracks, tracks]);

  const playPrev = async () => {
    const ctx = getPlaybackContext();
    if (ctx.index <= 0) return;
    if (ctx.source === 'playlist') {
      await playPlaylist(playlistTracks[ctx.index - 1]);
      return;
    }
    if (ctx.source === 'discover') {
      await playJamendo(tracks[ctx.index - 1]);
    }
  };

  const playNext = async () => {
    const ctx = getPlaybackContext();
    if (ctx.index < 0) return;

    if (ctx.source === 'playlist') {
      if (ctx.index >= playlistTracks.length - 1) return;
      await playPlaylist(playlistTracks[ctx.index + 1]);
      return;
    }

    if (ctx.source === 'discover') {
      if (ctx.index >= tracks.length - 1) return;
      await playJamendo(tracks[ctx.index + 1]);
    }
  };

  useEffect(() => {
    handleEndedRef.current = async () => {
      setIsPlaying(false);

      // Loop one is handled by audio.loop=true.
      if (loopMode === 'one') return;

      const ctx = getPlaybackContext();
      if (ctx.index < 0 || ctx.list.length === 0) return;

      // Shuffle: pick a random next track (different from current if possible).
      if (isShuffle) {
        if (ctx.list.length === 1) {
          // With 1 track, behave like loop all to avoid stopping immediately.
          if (ctx.source === 'playlist') await playPlaylist(playlistTracks[0]);
          if (ctx.source === 'discover') await playJamendo(tracks[0]);
          return;
        }

        let nextIndex = ctx.index;
        while (nextIndex === ctx.index) {
          nextIndex = Math.floor(Math.random() * ctx.list.length);
        }

        if (ctx.source === 'playlist') {
          await playPlaylist(playlistTracks[nextIndex]);
          return;
        }
        if (ctx.source === 'discover') {
          await playJamendo(tracks[nextIndex]);
        }
        return;
      }

      // Sequential next, with optional loop-all wrap.
      const atEnd = ctx.index >= ctx.list.length - 1;
      if (atEnd) {
        if (loopMode !== 'all') return;
        if (ctx.source === 'playlist') await playPlaylist(playlistTracks[0]);
        if (ctx.source === 'discover') await playJamendo(tracks[0]);
        return;
      }

      if (ctx.source === 'playlist') {
        await playPlaylist(playlistTracks[ctx.index + 1]);
        return;
      }
      if (ctx.source === 'discover') {
        await playJamendo(tracks[ctx.index + 1]);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShuffle, loopMode, currentTrackId, playlistTracks, tracks]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If nothing loaded yet, start the first item in the current tab.
    if (!audio.src) {
      if (activeTab === 'playlist' && playlistTracks.length > 0) {
        await playPlaylist(playlistTracks[0]);
        return;
      }
      if (activeTab === 'discover' && tracks.length > 0) {
        await playJamendo(tracks[0]);
        return;
      }
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        // ignore
      }
    } else {
      audio.pause();
    }
  };

  const onSeek = (value) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(value);
    if (!Number.isFinite(next)) return;
    audio.currentTime = Math.max(0, Math.min(next, duration || next));
    setCurrentTime(audio.currentTime);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-20 ${
        isOpen ? '' : 'hidden'
      }`}
    >
      <DraggableWindow
        className="bg-gray-900/95 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl select-none flex flex-col overflow-hidden"
        style={{
          width: 'min(980px, calc(100vw - 24px))',
          height: 'min(640px, calc(100vh - 24px))',
        }}
      >
        {/* Title Bar */}
        <div
          data-drag-handle
          className="flex justify-between items-center px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-gray-800/40 cursor-move"
        >
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

        <div className="flex-1 min-h-0 p-3 sm:p-4 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
          {/* Left panel */}
          <div className="lg:w-[360px] lg:min-w-[360px] flex flex-col gap-3 overflow-hidden order-2 lg:order-1">
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
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-white/60">Up to 50 results</div>
                  <button
                    onClick={loadDiscover}
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

          {/* Right panel (artwork + details) */}
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden order-1 lg:order-2">
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
                <img
                  src={musicIcon}
                  alt=""
                  className="w-20 h-20 sm:w-24 sm:h-24 opacity-90"
                  draggable={false}
                />
              </div>

              <div className="text-xs text-white/60">Now Playing</div>
              <div className="mt-1 text-lg sm:text-2xl font-semibold text-white truncate max-w-full">
                {nowPlaying?.title || 'Pick a song'}
              </div>
              <div className="mt-1 text-sm text-white/60 truncate max-w-full">
                {nowPlaying?.subtitle ||
                  (activeTab === 'playlist'
                    ? 'Your local playlist'
                    : 'Discover via Jamendo')}
              </div>

              <div className="mt-3 text-xs text-white/50">
                {activeTab === 'playlist'
                  ? `${playlistTracks.length} local tracks`
                  : `${tracks.length} discover tracks`}
              </div>
            </div>
          </div>
        </div>

        {/* Spotify-like bottom player bar */}
        <div className="no-drag border-t border-white/10 bg-gray-800/40 px-3 sm:px-4 py-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            {/* Left: track info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                <img src={musicIcon} alt="" className="w-7 h-7 opacity-90" />
              </div>
              <div className="min-w-0">
                <div className="text-sm text-white font-medium truncate">
                  {nowPlaying?.title || 'Nothing playing'}
                </div>
                <div className="text-xs text-white/60 truncate">
                  {nowPlaying?.subtitle || (nowPlaying ? '' : 'Choose a track')}
                </div>
              </div>
            </div>

            {/* Center: controls + progress */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsShuffle((s) => !s)}
                  className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    isShuffle
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                  }`}
                  title={isShuffle ? 'Shuffle: On' : 'Shuffle: Off'}
                >
                  ⇄
                </button>
                <button
                  onClick={playPrev}
                  disabled={currentIndex <= 0}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Previous"
                >
                  ⏮
                </button>
                <button
                  onClick={togglePlay}
                  className="px-4 py-2 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-100 transition-colors"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  onClick={playNext}
                  disabled={(() => {
                    const ctx = getPlaybackContext();
                    if (ctx.index < 0) return true;
                    if (ctx.list.length === 0) return true;
                    return ctx.index >= ctx.list.length - 1;
                  })()}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  title="Next"
                >
                  ⏭
                </button>
                <button
                  onClick={() =>
                    setLoopMode((m) =>
                      m === 'off' ? 'all' : m === 'all' ? 'one' : 'off'
                    )
                  }
                  className={`px-3 py-2 rounded-lg border transition-colors cursor-pointer ${
                    loopMode !== 'off'
                      ? 'bg-pink-500/20 border-pink-500/40 text-pink-200'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-white/70'
                  }`}
                  title={
                    loopMode === 'off'
                      ? 'Loop: Off'
                      : loopMode === 'all'
                      ? 'Loop: All'
                      : 'Loop: One'
                  }
                >
                  {loopMode === 'one' ? '🔂' : '↳↰'}
                </button>
              </div>

              <div className="w-full flex items-center gap-2">
                <div className="text-[11px] text-white/60 w-10 text-right tabular-nums">
                  {formatTime(currentTime)}
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.25}
                  value={Math.min(currentTime, duration || currentTime || 0)}
                  onChange={(e) => onSeek(e.target.value)}
                  className="flex-1 accent-pink-500 cursor-pointer"
                  disabled={!duration}
                />
                <div className="text-[11px] text-white/60 w-10 tabular-nums">
                  {formatTime(duration)}
                </div>
              </div>
            </div>

            {/* Right: volume + background */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/60">Vol</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-28 accent-pink-500 cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-white/70 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!keepPlayingInBackground}
                  onChange={(e) =>
                    onChangeKeepPlayingInBackground?.(e.target.checked)
                  }
                  className="accent-pink-500"
                />
                Background
              </label>
            </div>
          </div>

          <audio ref={audioRef} className="hidden" />
        </div>
      </DraggableWindow>
    </div>
  );
}
