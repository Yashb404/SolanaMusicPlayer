import { TrackCard } from "./TrackCard";

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

interface TrackGridProps {
  tracks: Track[];
  playlists: Playlist[];
  onAddToPlaylist: (trackId: string, playlistId: string) => void;
  onPlay?: (track: Track) => void;
  currentTrack?: Track | null;
}

export function TrackGrid({ tracks, playlists, onAddToPlaylist, onPlay, currentTrack }: TrackGridProps) {
  if (tracks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6">
          <div className="text-4xl text-muted-foreground">♪</div>
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No tracks uploaded yet
        </h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Start building your music collection by uploading your first track to the Solana blockchain.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tracks.map((track, index) => (
        <div 
          key={track.id} 
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <TrackCard
            track={track}
            playlists={playlists}
            onAddToPlaylist={onAddToPlaylist}
            onPlay={onPlay}
            isPlaying={currentTrack?.id === track.id}
          />
        </div>
      ))}
    </div>
  );
}