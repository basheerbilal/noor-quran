import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAudio } from '../context/AudioContext';

export const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    playbackError,
    playbackRate,
    togglePlayPause,
    stopAudio,
    seek,
    setVolume,
    setPlaybackRate,
    retryAudio,
    nextTrack,
    prevTrack,
  } = useAudio();

  if (!currentTrack) return null;

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };

  return (
    <div
      className="fixed bottom-[54px] lg:bottom-0 left-0 right-0 z-30 sm:z-50 bg-[#fcfaf6]/95 dark:bg-[#0c1412]/95 backdrop-blur-xl border-t border-emerald-900/10 dark:border-emerald-800/30 px-3 sm:px-4 py-2 sm:py-2.5 shadow-lg transition-all"
      id="global-audio-player"
    >
      {/* Playback error alert with retry button */}
      {playbackError && (
        <div className="max-w-5xl mx-auto mb-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{playbackError}</span>
          </div>
          <button
            type="button"
            onClick={retryAudio}
            className="flex items-center gap-1 font-semibold text-amber-800 dark:text-amber-200 hover:underline cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
        {/* Track info & Compact mobile controls */}
        <div className="flex items-center justify-between w-full sm:w-auto gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 text-amber-300 flex items-center justify-center font-bold text-xs shadow-xs border border-amber-400/20 shrink-0">
              {currentTrack.surahNumber}:{currentTrack.ayahNumberInSurah}
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-50 truncate">
                Surah {currentTrack.surahName}
              </p>
              <p className="text-[10px] sm:text-xs text-stone-500 dark:text-stone-400 truncate">
                Ayah {currentTrack.ayahNumberInSurah} • {currentTrack.reciterName || 'Mishary Rashid Alafasy'}
              </p>
            </div>
          </div>

          {/* Quick controls on mobile screen */}
          <div className="flex sm:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={prevTrack}
              disabled={!prevTrack}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 disabled:opacity-30 cursor-pointer"
              title="Previous Ayah"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-8 h-8 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-200 flex items-center justify-center shadow-xs cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-amber-200 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-3.5 h-3.5 fill-amber-200" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-amber-200 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              disabled={!nextTrack}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 disabled:opacity-30 cursor-pointer"
              title="Next Ayah"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={stopAudio}
              className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer ml-1"
              aria-label="Close audio player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Playback Controls & Progress (Desktop controls in center) */}
        <div className="flex flex-col items-center gap-1 w-full sm:max-w-md">
          {/* Desktop play buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <button
              type="button"
              onClick={prevTrack}
              disabled={!prevTrack}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Previous Ayah"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={togglePlayPause}
              className="w-9 h-9 rounded-full bg-emerald-800 hover:bg-emerald-700 text-amber-200 flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-amber-200 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-amber-200" />
              ) : (
                <Play className="w-4 h-4 fill-amber-200 ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={nextTrack}
              disabled={!nextTrack}
              className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-emerald-900/10 dark:hover:bg-emerald-800/20 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Next Ayah"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Seekbar */}
          <div className="w-full flex items-center gap-2 text-[10px] sm:text-[11px] text-stone-500 dark:text-stone-400">
            <span className="w-8 text-right font-mono">{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="flex-1 h-1.5 bg-emerald-950/20 dark:bg-emerald-800/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="w-8 font-mono">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Speed & Close (Desktop right group) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Playback Speed */}
          <select
            value={playbackRate}
            onChange={(e) => setPlaybackRate(Number(e.target.value))}
            className="px-1.5 py-1 text-xs font-semibold rounded-lg bg-emerald-950/5 dark:bg-emerald-800/30 text-emerald-900 dark:text-emerald-100 border border-emerald-900/10 dark:border-emerald-800/30 focus:outline-none cursor-pointer"
            title="Playback Speed"
          >
            {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
              className="p-1 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300"
            >
              {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-16 sm:w-20 h-1 bg-emerald-950/20 dark:bg-emerald-800/40 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={stopAudio}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-emerald-900/5 dark:hover:bg-emerald-800/20 transition-colors cursor-pointer"
            title="Close player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
