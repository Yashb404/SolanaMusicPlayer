import { useState } from "react";
import { Music, Plus, Menu,Wallet, X } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MusicSidebar } from "./MusicSidebar";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";
import { UploadTrackModal } from "../modals/UploadTrackModal";

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

interface MusicPlayerLayoutProps {
  children: React.ReactNode;
}

export function MusicPlayerLayout({ children }: MusicPlayerLayoutProps) {
  
  const { publicKey, connected } = useWallet();
  
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isUploadTrackOpen, setIsUploadTrackOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: "1", name: "My Favorites", tracks: [] },
    { id: "2", name: "Chill Vibes", tracks: [] }
  ]);

  const createPlaylist = (name: string) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    setPlaylists([...playlists, newPlaylist]);
  };

  // Optional: Add wallet-dependent features
  const handleUploadTrack = () => {
    if (!connected) {
      // TODO: Show wallet connection required message
      console.log("Wallet connection required to upload tracks");
      return;
    }
    setIsUploadTrackOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <MusicSidebar 
          playlists={playlists}
          onCreatePlaylist={() => setIsCreatePlaylistOpen(true)}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="h-16 border-b border-border bg-background sticky top-0 z-50">
            <div className="flex items-center justify-between h-full px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Music className="w-6 h-6" />
                  <h1 className="text-xl font-semibold">Music Player</h1>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleUploadTrack}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={!connected} // Disable upload if wallet not connected
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Track
                </Button>

                <WalletMultiButton />
              </div>
            </div>
          </header>

          <main className="flex-1 p-6">
            <div className="animate-fade-in">
              {children}
            </div>
          </main>
        </div>

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={isCreatePlaylistOpen}
          onClose={() => setIsCreatePlaylistOpen(false)}
          onCreatePlaylist={createPlaylist}
        />
        
        <UploadTrackModal
          isOpen={isUploadTrackOpen}
          onClose={() => setIsUploadTrackOpen(false)}
          onUploadTrack={(track) => {
            // Handle track upload
            console.log("Uploading track:", track);
          }}
        />
      </div>
    </SidebarProvider>
  );
}