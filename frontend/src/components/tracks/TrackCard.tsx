import { useState } from "react";
import { Play, Pause, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioFile: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

interface TrackCardProps {
  track: Track;
  playlists: Playlist[];
  onAddToPlaylist: (trackId: string, playlistId: string) => void;
  onPlay?: (track: Track) => void;
  isPlaying?: boolean;
}

export function TrackCard({ track, playlists, onAddToPlaylist, onPlay, isPlaying = false }: TrackCardProps) {
  const [imageError, setImageError] = useState(false);

  const handlePlayClick = () => {
    onPlay?.(track);
  };

  return (
    <div className="track-hover bg-card rounded-lg p-4 border border-border group">
      {/* Cover Art */}
      <div className="relative mb-4">
        <div className="aspect-square bg-muted rounded-md overflow-hidden">
          {!imageError ? (
            <img
              src={track.coverArt}
              alt={`${track.title} cover`}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <div className="text-6xl text-muted-foreground">♪</div>
            </div>
          )}
        </div>
        
        {/* Play/Pause Button Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
          <Button
            onClick={handlePlayClick}
            size="lg"
            className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>

      {/* Track Info */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-card-foreground truncate text-lg">
              {track.title}
            </h3>
            <p className="text-muted-foreground truncate">
              {track.artist}
            </p>
          </div>

          {/* More Options */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover border-border shadow-elevated">
              <div className="px-2 py-1.5 text-sm font-medium text-popover-foreground border-b border-border">
                Add to Playlist
              </div>
              {playlists.length > 0 ? (
                playlists.map((playlist) => (
                  <DropdownMenuItem
                    key={playlist.id}
                    onClick={() => onAddToPlaylist(track.id, playlist.id)}
                    className="flex items-center gap-2 hover:bg-muted focus:bg-muted"
                  >
                    <Plus className="w-4 h-4" />
                    {playlist.name}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled className="text-muted-foreground">
                  No playlists available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}