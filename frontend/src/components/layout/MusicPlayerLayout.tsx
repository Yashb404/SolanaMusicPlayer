import { useState } from "react";
import { Music, Plus } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { MusicSidebar } from "./MusicSidebar";
import { CreatePlaylistModal } from "../modals/CreatePlaylistModal";
import { UploadTrackModal } from "../modals/UploadTrackModal";
import { useMusicPlayerProgram } from "../../lib/solana-program";



interface Playlist {
  id: string;
  name: string;
  tracks: string[]; // Track IDs as strings
}

interface Track {
  id: string;
  title: string;
  artist: string;
  coverArt: string;
  audioFile: string;
}

interface MusicPlayerLayoutProps {
  children: React.ReactNode;
}

export function MusicPlayerLayout({ children }: MusicPlayerLayoutProps) {
  const { connected } = useWallet();
  const { program, provider } = useMusicPlayerProgram();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]); // ✅ Add missing tracks state
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showUploadTrack, setShowUploadTrack] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ REAL SOLANA CALL: Create playlist on-chain
  const createPlaylist = async (name: string) => {
    if (!program || !provider || !connected) {
      console.error('Program not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const playlistId = new BN(Date.now());
      
      // Derive PDA for the new playlist
      const [playlistPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("playlist"), provider.wallet.publicKey.toBuffer(), playlistId.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Call the Solana program
      await program.methods
        .createPlaylist(playlistId, name, "New playlist")
        .accounts({
          
          signer: provider.wallet.publicKey,
        })
        .rpc();

      // ✅ FIXED: Use capitalized account name as per your IDL
      const playlistAccount = await program.account.playlist.fetch(playlistPda);
      
      // Update local state with on-chain data
      const newPlaylist: Playlist = {
        id: playlistAccount.id.toString(),
        name: playlistAccount.name,
        tracks: [],
      };
      
      setPlaylists(prev => [...prev, newPlaylist]);
      console.log("✅ Playlist created on-chain:", playlistAccount);
      
    } catch (error) {
      console.error("❌ Failed to create playlist:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ REAL SOLANA CALL: Upload track on-chain with IPFS
  const onUploadTrack = async (trackData: {
    title: string;
    artist: string;
    genre: string;
    ipfsCid: string;
    coverArt?: string;
  }) => {
    if (!program || !provider || !connected) {
      console.error('Program not initialized or wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      const trackId = new BN(Date.now());
      
      // Derive PDA for the new track
      const [trackPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("track"), provider.wallet.publicKey.toBuffer(), trackId.toArrayLike(Buffer, 'le', 8)],
        program.programId
      );

      // Use the IPFS CID directly - no need to upload files here
      const audioUri = `ipfs://${trackData.ipfsCid}`;
      const coverUri = trackData.coverArt ? `ipfs://${trackData.coverArt}` : "ipfs://placeholder";

      // Call the Solana program
      await program.methods
        .uploadTrack(trackId, trackData.title, trackData.artist, trackData.genre, audioUri)
        .accounts({
          // ✅ This should work now with proper types
          signer: provider.wallet.publicKey,
        })
        .rpc();

      // ✅ FIXED: Use capitalized account name as per your IDL
      const trackAccount = await program.account.track.fetch(trackPda);
      
      // Update local state with on-chain data
      const newTrack: Track = { // ✅ Fix type name to uppercase Track
        id: trackAccount.id.toString(),
        title: trackAccount.title,
        artist: trackAccount.artist,
        coverArt: coverUri,
        audioFile: audioUri,
      };
      
      setTracks(prev => [...prev, newTrack]);
      console.log("✅ Track uploaded on-chain:", trackAccount);
      
    } catch (error) {
      console.error("❌ Failed to upload track:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    // TODO: Implement actual audio playback using track.audioFile
  };


  return (
    <SidebarProvider>
      <div className="min-h-screen w-full bg-background flex">
        <MusicSidebar 
          playlists={playlists}
          onCreatePlaylist={() => setShowCreatePlaylist(true)}
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
                  onClick={() => setShowUploadTrack(true)}
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
              {/* Add track display here */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Your Tracks</h2>
                {tracks.length === 0 ? (
                  <p className="text-muted-foreground">No tracks uploaded yet. Upload your first track!</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tracks.map((track) => (
                      <div key={track.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{track.title}</h3>
                            <p className="text-sm text-muted-foreground">{track.artist}</p>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => playTrack(track)}
                            className="ml-2"
                          >
                            ▶️ Play
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {children}
            </div>
          </main>
        </div>

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
          onCreatePlaylist={createPlaylist}
        />
        
        <UploadTrackModal
          isOpen={showUploadTrack}
          onClose={() => setShowUploadTrack(false)}
          onUploadTrack={onUploadTrack}
        />
   
      </div>
    </SidebarProvider>
  );
}