import { useState } from "react";
import { MusicPlayerLayout } from "@/components/layout/MusicPlayerLayout";
import { TrackGrid } from "@/components/tracks/TrackGrid";
import { Button } from "@/components/ui/button";
import { Plus, Music } from "lucide-react";

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

const Index = () => {
  const [tracks, setTracks] = useState<Track[]>([
    {
  "id": "1",
  "title": "Maybe Man",
  "artist": "AJR",
  "coverArt": "https://upload.wikimedia.org/wikipedia/en/3/38/The_Maybe_Man_album_cover.jpg",
  "audioFile": ""
},
{
  "id": "2",
  "title": "Tunnel Vision",
  "artist": "Talwiinder",
  "coverArt": "https://is3-ssl.mzstatic.com/image/thumb/Music125/v4/aa/bb/cc/aabbccdd-1234-5678-abcd-ef0123456789/cover.jpg/300x300bb.jpg",
  "audioFile": ""
},
{
  "id": "3",
  "title": "Ends of the Earth",
  "artist": "Lord Huron",
  "coverArt": "https://upload.wikimedia.org/wikipedia/en/4/48/Ends_of_the_Earth_cover.jpg",
  "audioFile": ""
}

  ]);

  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: "1", name: "My Favorites", tracks: [] },
    { id: "2", name: "Chill Vibes", tracks: [] }
  ]);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);

  const handleAddToPlaylist = (trackId: string, playlistId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    setPlaylists(prev => prev.map(playlist => {
      if (playlist.id === playlistId) {
        const isAlreadyInPlaylist = playlist.tracks.some(t => t.id === trackId);
        if (!isAlreadyInPlaylist) {
          return { ...playlist, tracks: [...playlist.tracks, track] };
        }
      }
      return playlist;
    }));
  };

  const handlePlay = (track: Track) => {
    setCurrentTrack(currentTrack?.id === track.id ? null : track);
  };

  return (
    <MusicPlayerLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Your Library
            </h1>
            <p className="text-muted-foreground mt-2">
              Your music collection
            </p>
          </div>
        </div>

        <TrackGrid
          tracks={tracks}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylist}
          onPlay={handlePlay}
          currentTrack={currentTrack}
        />
      </div>
    </MusicPlayerLayout>
  );
};

export default Index;
