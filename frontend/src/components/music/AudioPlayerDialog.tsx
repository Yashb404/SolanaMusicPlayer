import { useEffect, useMemo, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export interface DialogTrack {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioFile: string; // ipfs://...
}

function ipfsToHttp(ipfsUri: string, gateway = "https://ipfs.io/ipfs/") {
  if (!ipfsUri) return "";
  if (ipfsUri.startsWith("ipfs://")) {
    const cid = ipfsUri.replace("ipfs://", "");
    return `${gateway}${cid}`;
  }
  return ipfsUri;
}

interface AudioPlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  track: DialogTrack | null;
}

export function AudioPlayerDialog({ open, onOpenChange, track }: AudioPlayerDialogProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);

  const src = useMemo(() => ipfsToHttp(track?.audioFile ?? ""), [track]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!open) {
      setIsPlaying(false);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [open]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        // TODO: surface toast if autoplay blocked
        // eslint-disable-next-line no-console
        console.error("Audio play failed", e);
      }
    }
  };

  const onTimeChange = (val: number[]) => {
    if (!audioRef.current) return;
    const next = val[0];
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{track?.title ?? "Untitled"}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4">
          <div className="w-24 h-24 bg-muted rounded overflow-hidden flex-shrink-0">
            {track?.coverArt && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ipfsToHttp(track.coverArt)} alt={track.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">{track?.artist}</div>

            <div className="mt-4 space-y-2">
              <Slider
                value={[currentTime]}
                max={duration || 0}
                step={1}
                onValueChange={onTimeChange}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{Math.floor(currentTime)}s</span>
                <span>{Math.floor(duration)}s</span>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</Button>
              <div className="flex items-center gap-2 w-40">
                <span className="text-xs text-muted-foreground">Vol</span>
                <Slider value={[Math.round(volume * 100)]} max={100} step={1} onValueChange={(v) => setVolume(v[0] / 100)} />
              </div>
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={src}
          onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration || 0)}
          onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
          onEnded={() => setIsPlaying(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AudioPlayerDialog;


