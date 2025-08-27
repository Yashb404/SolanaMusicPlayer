import { useState,useEffect } from "react";
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
import { AudioPlayerDialog } from "../music/AudioPlayerDialog";



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
        .rpc({ skipPreflight: true, commitment: "confirmed" });

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
      const sig = await program.methods
        .uploadTrack(trackId, trackData.title, trackData.artist, trackData.genre, audioUri)
        .accounts({
          // ✅ inferred PDAs; only signer needed
          signer: provider.wallet.publicKey,
        })
        .rpc({ skipPreflight: true, commitment: "confirmed" });

      console.log("Tx:", sig, "Explorer:", `https://explorer.solana.com/tx/${sig}?cluster=devnet`);

      // ✅ Fetch the just-created account from chain for canonical data
      const trackAccount = await program.account.track.fetch(trackPda);
      const newTrack = mapTrackAccount(trackAccount);
      // TODO: if/when coverArt is stored on-chain, remove this override
      newTrack.coverArt = coverUri;
      setTracks(prev => [newTrack, ...prev]);
      
    } catch (error) {
      console.error("❌ Failed to upload track:", error);
      try {
        // Attempt to print simulation logs if available (Anchor SendTransactionError)
        const anyErr: any = error;
        if (anyErr && typeof anyErr.getLogs === 'function' && provider?.connection) {
          const logs = await anyErr.getLogs(provider.connection);
          console.error("🔍 Transaction logs:", logs);
        }
      } catch (e) {
        console.error("Failed to fetch logs:", e);
      }
      // TODO: Surface user-friendly toast with actionable hint (e.g., airdrop SOL on devnet)
    } finally {
      setIsLoading(false);
    }
  };

    // TODO: move to a shared utils file if reused elsewhere
    const mapTrackAccount = (t: any) => ({
      id: t.id.toString(),
      title: t.title,
      artist: t.artist,
      genre: t.genre,
      audioFile: t.uri,
      coverArt: "ipfs://placeholder", // TODO: wire real coverArt when available
      owner: t.owner.toBase58(),
      createdAt: Number(t.createdAt),
    });
  
    // Fetch my tracks from chain
    useEffect(() => {
      const run = async () => {
        if (!connected || !program || !provider?.wallet?.publicKey) return;
  
        try {
          setIsLoading(true);
          const owner = provider.wallet.publicKey.toBase58();
          // owner offset = 8 (discriminator) + 8 (id) = 16
          const accounts = await program.account.track.all([
            { memcmp: { offset: 16, bytes: owner } },
          ]);
  
          const mapped = accounts.map(a => mapTrackAccount(a.account));
          setTracks(mapped);
        } catch (e) {
          console.error("Failed to fetch tracks:", e);
        } finally {
          setIsLoading(false);
        }
      };
  
      run();
      // re-fetch when wallet or program changes
    }, [connected, program, provider]);

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

        <AudioPlayerDialog
          open={!!currentTrack}
          onOpenChange={(open) => {
            if (!open) {
              setIsPlaying(false);
              setCurrentTrack(null);
            }
          }}
          track={currentTrack}
        />
   
      </div>
    </SidebarProvider>
  );
}