import { useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { MusicPlayerLayout } from "@/components/layout/MusicPlayerLayout";
import { Button } from "@/components/ui/button";
import { Play, Pause, Trash2, Music } from "lucide-react";

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

const Playlist = () => {
  const { id } = useParams<{ id: string }>();
  
  // Mock data - in a real app this would come from state management or API
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { 
      id: "1", 
      name: "My Favorites", 
      tracks: [
        {
          id: "1",
          title: "Digital Dreams",
          artist: "CryptoBeats",
          coverArt: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
          audioFile: ""
        }
      ] 
    },
    { 
      id: "2", 
      name: "Chill Vibes", 
      tracks: [
        {
          id: "2", 
          title: "Blockchain Rhapsody",
          artist: "NFT Symphony",
          coverArt: "https://images.unsplash.com/photo-1571974599782-87624638275e?w=300&h=300&fit=crop",
          audioFile: ""
        },
        {
          id: "3",
          title: "Solana Sunset",
          artist: "Web3 Vibes",
          coverArt: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
          audioFile: ""
        }
      ] 
    }
  ]);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const playlist = playlists.find(p => p.id === id);
  
  if (!playlist) {
    return <Navigate to="/" replace />;
  }

  const handleRemoveFromPlaylist = (trackId: string) => {
    setPlaylists(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
      }
      return p;
    }));
  };

  const handlePlay = (track: Track) => {
    setCurrentTrack(currentTrack?.id === track.id ? null : track);
  };

  const totalDuration = playlist.tracks.length * 3.5; // Mock duration calculation

  return (
    <MusicPlayerLayout>
      <div className="space-y-8">
        {/* Playlist Header */}
        <div className="flex items-end gap-6">
          <div className="w-48 h-48 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl flex items-center justify-center shadow-elevated">
            <Music className="w-20 h-20 text-foreground/60" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Playlist
              </p>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {playlist.name}
              </h1>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{playlist.tracks.length} tracks</span>
              <span>•</span>
              <span>{Math.floor(totalDuration / 60)}h {Math.round(totalDuration % 60)}m</span>
            </div>

            {playlist.tracks.length > 0 && (
              <Button 
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-primary-foreground border-0 shadow-glow"
                onClick={() => handlePlay(playlist.tracks[0])}
              >
                <Play className="w-5 h-5 mr-2" />
                Play All
              </Button>
            )}
          </div>
        </div>

        {/* Track List */}
        {playlist.tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              This playlist is empty
            </h3>
            <p className="text-muted-foreground">
              Add some tracks to get started!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-medium text-muted-foreground border-b border-border">
              <div className="col-span-1">#</div>
              <div className="col-span-6">Title</div>
              <div className="col-span-3">Artist</div>
              <div className="col-span-2">Actions</div>
            </div>
            
            {playlist.tracks.map((track, index) => (
              <div
                key={track.id}
                className="track-hover grid grid-cols-12 gap-4 px-4 py-3 rounded-lg group"
              >
                <div className="col-span-1 flex items-center">
                  <div className="w-8 h-8 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handlePlay(track)}
                    >
                      {currentTrack?.id === track.id ? (
                        <Pause className="w-4 h-4" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                    </Button>
                    <span className="text-muted-foreground group-hover:hidden">
                      {index + 1}
                    </span>
                  </div>
                </div>
                
                <div className="col-span-6 flex items-center gap-3">
                  <img
                    src={track.coverArt}
                    alt={track.title}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="font-medium text-foreground">{track.title}</p>
                  </div>
                </div>
                
                <div className="col-span-3 flex items-center">
                  <p className="text-muted-foreground">{track.artist}</p>
                </div>
                
                <div className="col-span-2 flex items-center justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveFromPlaylist(track.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MusicPlayerLayout>
  );
};

export default Playlist;