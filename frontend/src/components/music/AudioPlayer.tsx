import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button"; // ✅ import your shadcn/ui Button (adjust path if needed)


interface AudioPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
}

export function AudioPlayer({ track, isPlaying, onPlay, onPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  if (!track) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-4">
          <div>
            <h4 className="font-semibold">{track.title}</h4>
            <p className="text-sm text-muted-foreground">{track.artist}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button onClick={isPlaying ? onPause : onPlay}>
            {isPlaying ? '⏸️' : '▶️'}
          </Button>
        </div>
        
        <audio 
          ref={audioRef}
          src={track.audioFile}
          onPlay={() => onPlay()}
          onPause={() => onPause()}
        />
      </div>
    </div>
  );
}
