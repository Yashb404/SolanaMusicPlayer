import { createContext, useContext, useMemo, useRef, useState } from "react";

export type Track = { id: string; title: string; artist: string; audioFile: string; coverArt: string; };

function ipfsToHttp(ipfsUri: string, gateway = "https://ipfs.io/ipfs/") {
  if (!ipfsUri) return "";
  return ipfsUri.startsWith("ipfs://") ? `${gateway}${ipfsUri.slice(7)}` : ipfsUri;
}

type PlayerCtx = {
  current: Track | null;
  isPlaying: boolean;
  play: (t: Track) => Promise<void>;
  pause: () => void;
  resume: () => Promise<void>;
  seek: (sec: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  setVolume: (v: number) => void;
};

const Ctx = createContext<PlayerCtx | null>(null);
export const usePlayer = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePlayer must be used within PlayerProvider");
  return v;
};

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(0.9);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const ensureAudio = () => {
    if (!audioRef.current) {
      const el = new Audio();
      el.preload = "auto";
      el.volume = volume;
      el.onended = () => setIsPlaying(false);
      el.ontimeupdate = () => setCurrentTime(el.currentTime || 0);
      el.onloadedmetadata = () => setDuration(el.duration || 0);
      audioRef.current = el;
    }
    return audioRef.current;
  };

  const play = async (t: Track) => {
    const audio = ensureAudio();
    setCurrent(t);
    audio.src = ipfsToHttp(t.audioFile);
    setCurrentTime(0);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      // TODO: Show toast if autoplay blocked
    }
  };

  const pause = () => {
    const a = audioRef.current;
    if (!a) return;
    a.pause();
    setIsPlaying(false);
  };

  const resume = async () => {
    const a = audioRef.current;
    if (!a) return;
    try {
      await a.play();
      setIsPlaying(true);
    } catch {}
  };

  const seek = (sec: number) => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = sec;
    setCurrentTime(sec);
  };

  const setVolume = (v: number) => {
    setVolumeState(v);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const value = useMemo(
    () => ({ current, isPlaying, play, pause, resume, seek, currentTime, duration, volume, setVolume }),
    [current, isPlaying, currentTime, duration, volume]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      {/* Hidden audio element kept in-memory via ref */}
    </Ctx.Provider>
  );
}