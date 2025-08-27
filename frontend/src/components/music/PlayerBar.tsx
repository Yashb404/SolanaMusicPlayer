import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayer } from "./PlayerContext";

function formatTime(sec: number) {
  if (!isFinite(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function PlayerBar() {
  const { current, isPlaying, pause, resume, seek, currentTime, duration, volume, setVolume } = usePlayer();

  const cover = useMemo(() => {
    if (!current?.coverArt) return "";
    return current.coverArt.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${current.coverArt.slice(7)}` : current.coverArt;
  }, [current]);

  if (!current) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="w-12 h-12 bg-muted rounded overflow-hidden">
          {cover ? <img src={cover} alt={current.title} className="w-full h-full object-cover" /> : null}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{current.title}</div>
          <div className="text-xs text-muted-foreground truncate">{current.artist}</div>
        </div>
        <div className="flex-1 px-4">
          <Slider value={[Math.min(currentTime, duration || 0)]} max={duration || 0} step={1} onValueChange={(v) => seek(v[0])} />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <Button size="sm" onClick={isPlaying ? pause : resume}>{isPlaying ? "Pause" : "Play"}</Button>
        <div className="w-32 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Vol</span>
          <Slider value={[Math.round(volume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
        </div>
      </div>
    </div>
  );
}