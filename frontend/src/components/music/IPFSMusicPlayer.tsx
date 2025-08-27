import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface IPFSMusicPlayerProps {
  ipfsCid: string;
  title?: string;
  artist?: string;
  coverArt?: string;
}

export function IPFSMusicPlayer({ ipfsCid, title = "Unknown Track", artist = "Unknown Artist", coverArt }: IPFSMusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  // IPFS Gateway URLs - you can use multiple for redundancy
  const ipfsGateways = [
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://dweb.link/ipfs/'
  ];

  const audioUrl = `${ipfsGateways[0]}${ipfsCid}`;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
      setError('Failed to load audio file');
      setIsLoading(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4 text-center">
        <p className="text-destructive font-medium">Error: {error}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Failed to load audio from IPFS. Please check your CID or try a different gateway.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-lg p-6 max-w-md mx-auto">
      {/* Cover Art */}
      {coverArt && (
        <div className="mb-4 text-center">
          <img 
            src={coverArt} 
            alt={`${title} cover art`}
            className="w-32 h-32 mx-auto rounded-lg object-cover shadow-lg"
          />
        </div>
      )}

      {/* Track Info */}
      <div className="text-center mb-6">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground">{artist}</p>
        <p className="text-xs text-muted-foreground mt-1">
          IPFS: {ipfsCid.slice(0, 10)}...{ipfsCid.slice(-10)}
        </p>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Progress Bar */}
      <div className="mb-4">
        <div 
          ref={progressRef}
          className="w-full bg-secondary rounded-full h-2 cursor-pointer relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const percentage = (clickX / rect.width) * 100;
            handleSeek([percentage]);
          }}
        >
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-150"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={skipBackward}
          className="hover:bg-secondary"
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={skipForward}
          className="hover:bg-secondary"
        >
          <SkipForward className="w-4 h-4" />
        </Button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          className="hover:bg-secondary"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={handleVolumeChange}
          max={100}
          step={1}
          className="flex-1"
        />
      </div>

      {/* Gateway Fallback Info */}
      <div className="mt-4 text-xs text-muted-foreground text-center">
        <p>Using Pinata Gateway</p>
        <p>If playback fails, try switching gateways</p>
      </div>
    </div>
  );
}
