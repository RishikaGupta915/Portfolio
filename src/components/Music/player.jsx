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

function getYouTubeId(url) {
  const reg =
    /(?:youtube\.com.*(?:v=|\/embed\/|\/v\/)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(reg);
  return match ? match[1] : null;
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

  const [currentTrackId, setCurrentTrackId] = useState(null);

  // Player UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);

  const [isShuffle, setIsShuffle] = useState(false);
  const [loopMode, setLoopMode] = useState('off'); // off | all | one

  const [ytUrlInput, setYtUrlInput] = useState('');
  const [ytTracks, setYtTracks] = useState([]);
  const [ytThumbnail, setYtThumbnail] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  const formatTime = (sec) => {
    const s = Number.isFinite(sec) ? Math.max(0, sec) : 0;
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${String(r).padStart(2, '0')}`;
  };

  const nowPlaying = useMemo(() => {
    if (!currentTrackId) return null;

    const id = String(currentTrackId);

    // Local playlist track
    if (id.startsWith('pl:')) {
      const t = playlistTracks.find((x) => x.id === id);
      return t
        ? { title: t.title, subtitle: t.subtitle, source: 'playlist' }
        : { title: 'Unknown track', subtitle: '', source: 'playlist' };
    }

    // YouTube track
    if (id.startsWith('yt:')) {
      const t = ytTracks.find((x) => x.id === id);
      return t
        ? {
            title: t.title,
            subtitle: t.subtitle,
            source: 'youtube',
            thumbnail: t.thumbnail,
          }
        : {
            title: 'YouTube Stream',
            subtitle: id.replace('yt:', ''),
            source: 'youtube',
            thumbnail: ytThumbnail,
          };
    }

    return null;
  }, [currentTrackId, playlistTracks, ytTracks]);

  const isYouTubeLink = (s) =>
    s.includes('youtube.com') || s.includes('youtu.be');

  const handlePlayYouTube = async () => {
    if (!ytUrlInput) return;

    // If user pasted a link → play directly
    if (isYouTubeLink(ytUrlInput)) {
      await playFromUrl(ytUrlInput);
      return;
    }

    // Else → SEARCH MODE
    const r = await fetch(
      `https://validity-ata-shaped-wheel.trycloudflare.com/api/music/search?q=${encodeURIComponent(
        ytUrlInput
      )}`
    );
    const data = await r.json();
    setSearchResults(data);
  };

  const playFromResult = async (video) => {
    const streamUrl = `https://validity-ata-shaped-wheel.trycloudflare.com/api/music/stream?url=${encodeURIComponent(
      video.url
    )}`;

    setYtTracks([
      {
        id: 'yt:' + video.id,
        title: video.title,
        subtitle: video.channel,
        url: streamUrl,
        thumbnail: video.thumbnail,
        source: 'youtube',
      },
    ]);

    await playUrl({
      id: 'yt:' + video.id,
      url: streamUrl,
    });
  };

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
    const all = [...playlistTracks, ...ytTracks];
    const index = all.findIndex((x) => String(x.id) === String(currentTrackId));
    return { list: all, index };
  };

  const playUrl = async ({ id, url }) => {
    if (!audioRef.current) return;
    setCurrentTrackId(id);

    if (!url) return;
    if (audioRef.current.src !== url) {
      audioRef.current.src = url;
    }

    // Attempt play only after user-triggered action
    const playAttempt = audioRef.current.play();
    if (playAttempt !== undefined) {
      playAttempt.catch(() => {
        console.log('Autoplay blocked — waiting for user click');
      });
    }
  };

  const playPlaylist = async (t) => {
    await playUrl({ id: t.id, url: t.url });
  };

  const currentIndex = useMemo(() => {
    return getPlaybackContext().index;
  }, [currentTrackId, playlistTracks, ytTracks]);

  const ctx = useMemo(
    () => getPlaybackContext(),
    [currentTrackId, playlistTracks, ytTracks]
  );

  const playPrev = async () => {
    if (ctx.index <= 0) return;
    await playPlaylist(ctx.list[ctx.index - 1]);
  };

  const playNext = async () => {
    if (ctx.index < 0) return;
    if (ctx.index >= ctx.list.length - 1) return;
    await playPlaylist(ctx.list[ctx.index + 1]);
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
          await playPlaylist(ctx.list[0]);

          return;
        }

        let nextIndex = ctx.index;
        while (nextIndex === ctx.index) {
          nextIndex = Math.floor(Math.random() * ctx.list.length);
        }

        await playPlaylist(ctx.list[nextIndex]);
        return;
      }

      // Sequential next, with optional loop-all wrap.
      const atEnd = ctx.index >= ctx.list.length - 1;
      if (atEnd) {
        if (loopMode !== 'all') return;
        await playPlaylist(ctx.list[0]);
        return;
      }

      await playPlaylist(ctx.list[ctx.index + 1]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isShuffle, loopMode, currentTrackId, playlistTracks]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // If nothing loaded yet, start the first item in the current tab.
    if (!audio.src) {
      const all = [...playlistTracks, ...ytTracks];
      if (all.length > 0) await playPlaylist(all[0]);
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
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 mb-3">
              <div className="text-sm text-white/80 mb-1">
                Play from YouTube
              </div>

              <div className="flex gap-2">
                <input
                  value={ytUrlInput}
                  onChange={(e) => setYtUrlInput(e.target.value)}
                  placeholder="Paste YouTube link"
                  className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white text-sm outline-none"
                />

                <button
                  onClick={handlePlayYouTube}
                  className="px-3 py-2 rounded-lg bg-pink-500/30 text-white text-sm"
                >
                  Play
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-3 space-y-2">
                  {searchResults.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => playFromResult(v)}
                      className="w-full flex gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10"
                    >
                      <img src={v.thumbnail} className="w-12 h-12 rounded" />
                      <div className="text-left">
                        <div className="text-sm text-white">{v.title}</div>
                        <div className="text-xs text-white/60">
                          {v.channel} • {Math.floor(v.duration / 60)}:
                          {String(v.duration % 60).padStart(2, '0')}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

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

            <div className="flex-1 rounded-xl border border-white/10 bg-white/5 overflow-hidden">
              <div className="h-full overflow-auto custom-scrollbar p-2">
                {playlistTracks.length === 0 ? (
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
                )}
              </div>
            </div>
          </div>

          {/* Right panel (artwork + details) */}
          <div className="flex-1 rounded-xl border border-white/10 bg-white/5 p-4 overflow-hidden order-1 lg:order-2">
            <div className="h-full w-full flex flex-col items-center justify-center text-center">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center mb-4">
                <img
                  src={nowPlaying?.thumbnail || musicIcon}
                  alt=""
                  className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
                  draggable={false}
                />
              </div>

              <div className="text-xs text-white/60">Now Playing</div>
              <div className="mt-1 text-lg sm:text-2xl font-semibold text-white truncate max-w-full">
                {nowPlaying?.title || 'Pick a song'}
              </div>
              <div className="mt-1 text-sm text-white/60 truncate max-w-full">
                {nowPlaying?.subtitle ||
                  (nowPlaying?.source === 'youtube'
                    ? 'YouTube'
                    : 'Your local playlist')}
              </div>

              <div className="mt-3 text-xs text-white/50">
                {`${playlistTracks.length} local tracks`}
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
                <img
                  src={nowPlaying?.thumbnail || musicIcon}
                  alt=""
                  className="w-7 h-7 object-cover rounded-md"
                />
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
                  disabled={ctx.index < 0 || ctx.index >= ctx.list.length - 1}
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
