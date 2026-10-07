import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from 'react';
import { getAyahAudioCandidates, getReciterDisplayName } from '../utils/audioHelper';

export interface AudioTrackInfo {
  audioUrl?: string;
  audioUrls?: string[];
  surahNumber: number;
  ayahNumberInSurah: number;
  globalAyahNumber?: number;
  surahName: string;
  reciterName?: string;
  reciterEdition?: string;
}

interface AudioContextType {
  currentTrack: AudioTrackInfo | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackError: string | null;
  playTrack: (track: AudioTrackInfo, onNext?: () => void, onPrev?: () => void) => void;
  togglePlayPause: () => void;
  stopAudio: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  retryAudio: () => void;
  nextTrack?: () => void;
  prevTrack?: () => void;
  hasAudio: boolean;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrackInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.85);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const candidateUrlsRef = useRef<string[]>([]);
  const candidateIndexRef = useRef<number>(0);
  const nextCallbackRef = useRef<(() => void) | undefined>(undefined);
  const prevCallbackRef = useRef<(() => void) | undefined>(undefined);

  const attemptPlayCurrentSource = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const list = candidateUrlsRef.current;
    const idx = candidateIndexRef.current;

    if (idx >= list.length) {
      setIsLoading(false);
      setIsPlaying(false);
      setPlaybackError('Recitation stream could not be loaded from audio servers.');
      return;
    }

    const url = list[idx];
    setIsLoading(true);
    setPlaybackError(null);

    audio.src = url;
    audio.volume = volume;
    audio.load();

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
          setPlaybackError(null);
        })
        .catch((err: any) => {
          if (err?.name === 'NotAllowedError') {
            setIsPlaying(false);
            setIsLoading(false);
            setPlaybackError('Click play to allow audio playback.');
          } else {
            // Silently try next fallback source if source failed
            if (candidateIndexRef.current < candidateUrlsRef.current.length - 1) {
              candidateIndexRef.current += 1;
              attemptPlayCurrentSource();
            } else {
              setIsPlaying(false);
              setIsLoading(false);
              setPlaybackError('Audio could not be loaded.');
            }
          }
        });
    }
  }, [volume]);

  const handleAudioError = useCallback(() => {
    if (candidateIndexRef.current < candidateUrlsRef.current.length - 1) {
      candidateIndexRef.current += 1;
      attemptPlayCurrentSource();
    } else {
      setIsPlaying(false);
      setIsLoading(false);
      setPlaybackError('Audio playback failed on available sources.');
    }
  }, [attemptPlayCurrentSource]);

  const playTrack = useCallback(
    (track: AudioTrackInfo, onNext?: () => void, onPrev?: () => void) => {
      nextCallbackRef.current = onNext;
      prevCallbackRef.current = onPrev;

      const reciterName =
        track.reciterName || getReciterDisplayName(track.reciterEdition || 'ar.alafasy');

      const fullTrack: AudioTrackInfo = {
        ...track,
        reciterName,
      };

      setCurrentTrack(fullTrack);

      // Generate robust candidate list with CORS-friendly mirrors
      const candidates =
        track.audioUrls && track.audioUrls.length > 0
          ? track.audioUrls
          : getAyahAudioCandidates({
              surahNumber: track.surahNumber,
              ayahNumberInSurah: track.ayahNumberInSurah,
              globalAyahNumber: track.globalAyahNumber,
              reciterEdition: track.reciterEdition || 'ar.alafasy',
              customUrl: track.audioUrl,
            });

      candidateUrlsRef.current = candidates;
      candidateIndexRef.current = 0;
      setCurrentTime(0);

      // Trigger playback
      setTimeout(() => {
        attemptPlayCurrentSource();
      }, 10);
    },
    [attemptPlayCurrentSource]
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      setPlaybackError(null);
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err: any) => {
            if (err?.name === 'NotAllowedError') {
              setPlaybackError('Please click play to allow playback.');
            } else {
              handleAudioError();
            }
          });
      }
    }
  }, [currentTrack, isPlaying, handleAudioError]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setIsLoading(false);
    setPlaybackError(null);
    setCurrentTrack(null);
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && !isNaN(seconds)) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const retryAudio = useCallback(() => {
    if (currentTrack) {
      candidateIndexRef.current = 0;
      attemptPlayCurrentSource();
    }
  }, [currentTrack, attemptPlayCurrentSource]);

  return (
    <AudioContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        volume,
        playbackError,
        playTrack,
        togglePlayPause,
        stopAudio,
        seek,
        setVolume,
        setPlaybackRate,
        playbackRate,
        retryAudio,
        nextTrack: nextCallbackRef.current,
        prevTrack: prevCallbackRef.current,
        hasAudio: !!currentTrack,
      }}
    >
      {/* Persistent HTMLMediaElement mounted inside the DOM */}
      <audio
        ref={audioRef}
        preload="metadata"
        playsInline
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime || 0);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration || 0);
            setIsLoading(false);
            audioRef.current.playbackRate = playbackRate;
          }
        }}
        onPlay={() => {
          setIsPlaying(true);
          setIsLoading(false);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTime(0);
          if (nextCallbackRef.current) {
            nextCallbackRef.current();
          }
        }}
        onError={handleAudioError}
      />
      {children}
    </AudioContext.Provider>
  );
};

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
}
